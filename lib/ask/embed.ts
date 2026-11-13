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
  return process.env.ASK_SEMANTIC === 'off' || (!override && process.env.NODE_ENV === 'test' && process.env.ASK_REAL_MODEL !== '1')
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
  return { model: H.model, loaded: !!loading && !failedAt, failed: failedAt ? lastError : null }
}

/** Embed a question → L2-normalised vector. Throws when the model can't be loaded (callers fall back). */
export async function embedQuery(q: string): Promise<Float32Array> {
  if (override) return override(q)
  if (semanticDisabled()) throw new Error('Semantic search is disabled')
  if (failedAt && Date.now() - failedAt < RETRY_MS) throw new Error(`Model unavailable: ${lastError}`)
  if (!loading || failedAt) {
    failedAt = 0
    loading = load()
    loading.catch((e: unknown) => { failedAt = Date.now(); lastError = e instanceof Error ? e.message : String(e) })
  }
  const embed = await loading
  return embed(`${H.queryPrefix}${q}`)
}
