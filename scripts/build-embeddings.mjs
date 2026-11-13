#!/usr/bin/env node
/**
 * Precompute "Ask the Quran" passage embeddings (semantic search) — run OFFLINE, commit the output.
 *
 *   pnpm build:embeddings                                 # → data/quran/embeddings.bin + embeddings.json (~25 min on 4 CPUs)
 *   node scripts/build-embeddings.mjs --limit 300 --out /tmp/x   # quick experiment
 *   EMBED_MODEL=Xenova/multilingual-e5-small node scripts/build-embeddings.mjs --out /tmp/y   # compare a model
 *   node scripts/build-embeddings.mjs --dims 256          # Matryoshka-truncated EmbeddingGemma vectors
 *
 * Model: EmbeddingGemma-300m (q4 ONNX, 100+ languages incl. Bangla; Gemma terms of use). On the 33-query fixture it
 * reached semantic-only recall@10 0.61 vs 0.16 for multilingual-e5-small (see docs/ARCHITECTURE.md → Ask the Quran).
 * Passage text per ayah = English (Saheeh International) + Bangla (Taisirul Quran) with the model's document prompt.
 * Vectors are L2-normalised, then quantised to int8 with a per-vector scale (v ≈ q * scale). Binary layout: [count*dims int8][count float32 scales] (little endian).
 * Order = canonical mushaf order (1:1 … 114:6); keys are implicit from chapters.json verse counts.
 *
 * Model files are cached in scripts/.cache/hf (git-ignored). Uses modest batches to keep memory low.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const arg = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def }

const MODEL = process.env.EMBED_MODEL || 'onnx-community/embeddinggemma-300m-ONNX'
const OUT = path.resolve(arg('out', path.join(root, 'data/quran')))
const LIMIT = Number(arg('limit', '0')) || Infinity
const BATCH = Number(arg('batch', '8'))
const TEXT = arg('text', 'both') // en | bn | both (experiments)

/** Per-model-family settings; copied into the header so query-time embedding (server + browser) matches. */
const FAMILY = /embeddinggemma/i.test(MODEL)
  ? { kind: 'sentence_embedding', dtype: arg('dtype', 'q4'), queryPrefix: 'task: search result | query: ', passagePrefix: 'title: none | text: ', truncate: Number(arg('dims', '768')) }
  : /e5/i.test(MODEL)
    ? { kind: 'mean', dtype: arg('dtype', 'q8'), queryPrefix: 'query: ', passagePrefix: 'passage: ', truncate: 0 }
    : { kind: 'mean', dtype: arg('dtype', 'q8'), queryPrefix: '', passagePrefix: '', truncate: 0 }

const { pipeline, AutoTokenizer, AutoModel, env } = await import('@huggingface/transformers')
env.cacheDir = path.join(root, 'scripts/.cache/hf')
env.allowLocalModels = false

/** The passage text that gets embedded for an ayah (kept in sync with the header's `passage` field). */
function passageText(v) {
  const t = (TEXT === 'en' ? v.en : TEXT === 'bn' ? v.bn : `${v.en}\n${v.bn}`).replace(/\s+/g, ' ').trim()
  return FAMILY.passagePrefix + t
}

/** texts → { data: Float32Array (rows × dims, L2-normalised), dims } */
async function makeEmbedder() {
  if (FAMILY.kind === 'mean') {
    const extractor = await pipeline('feature-extraction', MODEL, { dtype: FAMILY.dtype })
    return async (texts) => { const o = await extractor(texts, { pooling: 'mean', normalize: true }); return { data: o.data, dims: o.dims[1] } }
  }
  const tokenizer = await AutoTokenizer.from_pretrained(MODEL)
  const model = await AutoModel.from_pretrained(MODEL, { dtype: FAMILY.dtype })
  return async (texts) => {
    const inputs = await tokenizer(texts, { padding: true, truncation: true, max_length: 512 })
    const { sentence_embedding } = await model(inputs)
    const full = sentence_embedding.dims[1]
    const d = FAMILY.truncate && FAMILY.truncate < full ? FAMILY.truncate : full
    const out = new Float32Array(texts.length * d)
    for (let r = 0; r < texts.length; r++) {
      let n = 0
      for (let i = 0; i < d; i++) n += sentence_embedding.data[r * full + i] ** 2
      n = Math.sqrt(n) || 1
      for (let i = 0; i < d; i++) out[r * d + i] = sentence_embedding.data[r * full + i] / n
    }
    return { data: out, dims: d }
  }
}

const chapters = JSON.parse(await readFile(path.join(root, 'data/quran/chapters.json'), 'utf8'))
const rows = []
for (const c of chapters) {
  const verses = JSON.parse(await readFile(path.join(root, `data/quran/surah/${c.id}.json`), 'utf8'))
  for (const v of verses) rows.push(v)
  if (rows.length >= LIMIT) break
}
const items = rows.slice(0, Math.min(rows.length, LIMIT))
console.log(`Embedding ${items.length} ayahs with ${MODEL} (batch ${BATCH})…`)

const embed = await makeEmbedder()
let dims = 0
let q8, scales
const t0 = Date.now()
for (let i = 0; i < items.length; i += BATCH) {
  const batch = items.slice(i, i + BATCH)
  const out = await embed(batch.map(passageText))
  if (!dims) {
    dims = out.dims
    q8 = new Int8Array(items.length * dims)
    scales = new Float32Array(items.length)
  }
  const data = out.data
  for (let b = 0; b < batch.length; b++) {
    let max = 0
    for (let d = 0; d < dims; d++) max = Math.max(max, Math.abs(data[b * dims + d]))
    const scale = max / 127 || 1
    scales[i + b] = scale
    for (let d = 0; d < dims; d++) q8[(i + b) * dims + d] = Math.round(data[b * dims + d] / scale)
  }
  if ((i / BATCH) % 25 === 0) {
    const done = i + batch.length
    const eta = ((Date.now() - t0) / done) * (items.length - done) / 1000
    console.log(`  ${done}/${items.length}  (${((Date.now() - t0) / 1000).toFixed(0)}s, eta ${eta.toFixed(0)}s)`)
  }
}

const buf = Buffer.concat([Buffer.from(q8.buffer, q8.byteOffset, q8.byteLength), Buffer.from(scales.buffer, scales.byteOffset, scales.byteLength)])
await mkdir(OUT, { recursive: true })
await writeFile(path.join(OUT, 'embeddings.bin'), buf)
const header = {
  model: MODEL,
  dims,
  count: items.length,
  dtype: 'int8',
  scale: 'per-vector float32 after the int8 block (v ≈ q * scale)',
  kind: FAMILY.kind,
  modelDtype: FAMILY.dtype,
  normalized: true,
  queryPrefix: FAMILY.queryPrefix,
  passage: `${FAMILY.passagePrefix}{Saheeh International English} {Taisirul Quran Bangla}`,
  bytes: buf.length,
  sha256: createHash('sha256').update(buf).digest('hex').slice(0, 16),
  built: new Date().toISOString().slice(0, 10),
}
await writeFile(path.join(OUT, 'embeddings.json'), JSON.stringify(header, null, 2) + '\n')
console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(0)}s → ${OUT}/embeddings.bin (${(buf.length / 1e6).toFixed(2)} MB)`)
