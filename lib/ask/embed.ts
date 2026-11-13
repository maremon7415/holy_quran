import 'server-only'
/**
 * Server-side query embedding for Ask the Quran (transformers.js + onnxruntime-node, CPU).
 *
 * The model (EmbeddingGemma-300m, q4 ONNX ≈ 190 MB + 20 MB tokenizer) is NOT bundled: it is downloaded from the Hugging Face CDN on the
 * first request of an instance into a writable cache dir (/tmp on Vercel), then kept in memory.
 * Locally the offline build cache `scripts/.cache/hf` is reused when present.
 * Set ASK_SEMANTIC=off to disable the model entirely (Ask then falls back to lexical search).
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import header from '@/data/quran/embeddings.json'
import { normalize } from './vectors'

export type Embedder = (text: string) => Promise<Float32Array>

let override: Embedder | null = null
/** Test hook: replace the model with a fake (pass null to restore). */
export function setEmbedder(fn: Embedder | null) { override = fn; failedAt = 0 }

type QueryEmbedder = (text: string) => Promise<Float32Array>
interface Header { model: string; dims: number; queryPrefix: string; kind?: string; modelDtype?: string }
const H = header as Header

let loading: Promise<QueryEmbedder> | null = null
let failedAt = 0
let lastError = ''
const RETRY_MS = 60_000

export const embedModel = H.model

export function semanticDisabled() {
  return process.env.ASK_SEMANTIC === 'off' || (!override && !loadImpl && process.env.NODE_ENV === 'test' && process.env.ASK_REAL_MODEL !== '1')
}

function cacheDir() {
  if (process.env.ASK_MODEL_CACHE) return process.env.ASK_MODEL_CACHE
  const local = path.join(process.cwd(), 'scripts/.cache/hf')
  if (fs.existsSync(path.join(local, H.model))) return local
  return path.join(os.tmpdir(), 'noor-hf')
}

async function load(): Promise<QueryEmbedder> {
  const t0 = Date.now()
  const { pipeline, AutoModel, AutoTokenizer, env } = await import('@huggingface/transformers')
  env.cacheDir = cacheDir()
  env.allowLocalModels = false
  const dtype = (H.modelDtype ?? 'q8') as 'q8'
  let fn: QueryEmbedder
  if (H.kind === 'sentence_embedding') {
    // models that export their own pooling + dense head (EmbeddingGemma): take `sentence_embedding`, Matryoshka-truncate
    const [tokenizer, model] = await Promise.all([AutoTokenizer.from_pretrained(H.model), AutoModel.from_pretrained(H.model, { dtype })])
    fn = async (text) => {
      const out = await model(await tokenizer([text], { padding: true, truncation: true }))
      return normalize((out.sentence_embedding.data as Float32Array).subarray(0, H.dims))
    }
  } else {
    const extractor = await pipeline('feature-extraction', H.model, { dtype })
    fn = async (text) => {
      const out = await extractor([text], { pooling: 'mean', normalize: true })
      return normalize((out.data as Float32Array).subarray(0, H.dims))
    }
  }
  if (process.env.ASK_DEBUG) console.log(`[ask] model loaded in ${Date.now() - t0} ms (cache ${env.cacheDir})`)
  return fn
}

/** Status for diagnostics / the UI note. */
export function embedStatus() {
  return { model: H.model, loaded: loaded && !failedAt, loading: !!loading && !loaded && !failedAt, failed: failedAt ? lastError : null }
}

/** Thrown by embedQuery when the model is still loading after `loadTimeoutMs` (it keeps loading in the background). */
export class ModelLoadTimeoutError extends Error {
  constructor(ms: number) { super(`Model still loading after ${ms} ms`); this.name = 'ModelLoadTimeoutError' }
}

/**
 * How long a request waits for the model on a cold instance before falling back to word matching. The first load
 * downloads ~210 MB from Hugging Face, which can exceed a function's time budget (maxDuration 60 s); the download
 * continues in the background and the next request gets the model.
 */
export const modelLoadTimeoutMs = () => Number(process.env.ASK_MODEL_TIMEOUT_MS) || 20_000

let loaded = false
function startLoad(): Promise<QueryEmbedder> {
  if (!loading || failedAt) {
    failedAt = 0
    loaded = false
    const p = (loadImpl ?? load)()
    loading = p
    p.then(() => { if (loading === p) loaded = true }, (e: unknown) => { if (loading === p) { failedAt = Date.now(); lastError = e instanceof Error ? e.message : String(e) } })
  }
  return loading
}

let loadImpl: (() => Promise<QueryEmbedder>) | null = null
/** Test hook: replace the real model loader (null restores it) and forget any loaded model. */
export function _setModelLoader(fn: (() => Promise<QueryEmbedder>) | null) { loadImpl = fn; loading = null; loaded = false; failedAt = 0; lastError = '' }

/**
 * Start loading the model without waiting (e.g. when someone opens /ask, before they type). Runs at most once per
 * instance (later calls are no-ops while loading/loaded; after a failure it retries only after RETRY_MS).
 * Returns what happened, for the warm-up endpoint.
 */
export function warmUpModel(): 'disabled' | 'loaded' | 'loading' | 'started' | 'failed' {
  if (override) return 'loaded'
  if (semanticDisabled()) return 'disabled'
  if (loaded) return 'loaded'
  if (failedAt && Date.now() - failedAt < RETRY_MS) return 'failed'
  if (loading && !failedAt) return 'loading'
  startLoad().catch(() => {})
  return 'started'
}

/**
 * Embed a question → L2-normalised vector. Throws when the model can't be loaded (callers fall back), and
 * ModelLoadTimeoutError when it is still loading after `loadTimeoutMs`.
 */
export async function embedQuery(q: string, opts: { loadTimeoutMs?: number } = {}): Promise<Float32Array> {
  if (override) return override(q)
  if (semanticDisabled()) throw new Error('Semantic search is disabled')
  if (failedAt && Date.now() - failedAt < RETRY_MS) throw new Error(`Model unavailable: ${lastError}`)
  const p = startLoad()
  const ms = opts.loadTimeoutMs ?? modelLoadTimeoutMs()
  let timer: ReturnType<typeof setTimeout> | undefined
  const embed = loaded ? await p : await Promise.race([
    p,
    new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new ModelLoadTimeoutError(ms)), ms) }),
  ]).finally(() => clearTimeout(timer))
  return embed(`${H.queryPrefix}${q}`)
}
