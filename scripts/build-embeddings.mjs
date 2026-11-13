#!/usr/bin/env node
/**
 * Precompute "Ask the Quran" passage embeddings (semantic search) — run OFFLINE, commit the output.
 *
 *   node scripts/build-embeddings.mjs                     # → data/quran/embeddings.bin + embeddings.json
 *   node scripts/build-embeddings.mjs --limit 300 --out /tmp/x   # quick experiment
 *   EMBED_MODEL=Xenova/paraphrase-multilingual-MiniLM-L12-v2 node scripts/build-embeddings.mjs --out /tmp/y
 *
 * Passage text per ayah = English (Saheeh International) + Bangla (Taisirul Quran), prefixed "passage: "
 * for the e5 family. Vectors are mean-pooled + L2-normalised, then quantised to int8 with a per-vector
 * scale (v ≈ q * scale). Binary layout: [count*dims int8][count float32 scales] (little endian).
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

const MODEL = process.env.EMBED_MODEL || 'Xenova/multilingual-e5-small'
const OUT = path.resolve(arg('out', path.join(root, 'data/quran')))
const LIMIT = Number(arg('limit', '0')) || Infinity
const BATCH = Number(arg('batch', '16'))
const E5 = /e5/i.test(MODEL)

const { pipeline, env } = await import('@huggingface/transformers')
env.cacheDir = path.join(root, 'scripts/.cache/hf')
env.allowLocalModels = false

/** The passage text that gets embedded for an ayah (kept in sync with the header's `passage` field). */
function passageText(v) {
  const t = `${v.en}\n${v.bn}`.replace(/\s+/g, ' ').trim()
  return E5 ? `passage: ${t}` : t
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

const extractor = await pipeline('feature-extraction', MODEL, { dtype: 'q8' })
let dims = 0
let q8, scales
const t0 = Date.now()
for (let i = 0; i < items.length; i += BATCH) {
  const batch = items.slice(i, i + BATCH)
  const out = await extractor(batch.map(passageText), { pooling: 'mean', normalize: true })
  if (!dims) {
    dims = out.dims[1]
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
  pooling: 'mean',
  normalized: true,
  queryPrefix: E5 ? 'query: ' : '',
  passage: `${E5 ? 'passage: ' : ''}{Saheeh International English} {Taisirul Quran Bangla}`,
  bytes: buf.length,
  sha256: createHash('sha256').update(buf).digest('hex').slice(0, 16),
  built: new Date().toISOString().slice(0, 10),
}
await writeFile(path.join(OUT, 'embeddings.json'), JSON.stringify(header, null, 2) + '\n')
console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(0)}s → ${OUT}/embeddings.bin (${(buf.length / 1e6).toFixed(2)} MB)`)
