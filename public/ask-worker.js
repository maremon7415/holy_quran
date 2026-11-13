/* Ask the Quran — opt-in on-device smart search (module Web Worker, plain JS on purpose: no bundling of onnxruntime-web).
 * Loads transformers.js from jsDelivr (pinned) and the same multilingual embedding model the server uses; the model
 * files are cached by the browser (Cache Storage "transformers-cache"), so the ~210 MB download happens once.
 * Also loads the precomputed ayah vectors (/ask/embeddings.bin) so meaning-based search keeps working offline.
 *
 * Messages in:  {type:'init', header, vectorsUrl} | {type:'embed', id, text} | {type:'search', id, vec, k}
 * Messages out: {type:'progress', loaded, total} | {type:'ready', device} | {type:'error', message}
 *               {type:'vec', id, vec} | {type:'hits', id, hits:[[row, score]…]} | {type:'fail', id, message}
 */
const TRANSFORMERS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1'

let header = null
let embedFn = null
let index = null
let initP = null

function decode(buf, dims, count) {
  const u8 = new Uint8Array(buf)
  const q8 = new Int8Array(buf, 0, dims * count)
  const scales = new Float32Array(count)
  new Uint8Array(scales.buffer).set(u8.subarray(dims * count, dims * count + count * 4))
  return { q8, scales, dims, count }
}

function normalize(v, dims) {
  let n = 0
  for (let i = 0; i < dims; i++) n += v[i] * v[i]
  n = Math.sqrt(n) || 1
  const out = new Float32Array(dims)
  for (let i = 0; i < dims; i++) out[i] = v[i] / n
  return out
}

async function init(h, vectorsUrl) {
  header = h
  const files = new Map()
  const progress = (p) => {
    if (p.status === 'progress' && p.file) {
      files.set(p.file, [p.loaded || 0, p.total || 0])
      let loaded = 0, total = 0
      for (const [l, t] of files.values()) { loaded += l; total += t }
      self.postMessage({ type: 'progress', loaded, total })
    }
  }
  const vectors = fetch(vectorsUrl).then((r) => { if (!r.ok) throw new Error(`vectors ${r.status}`); return r.arrayBuffer() })
  const { pipeline, AutoModel, AutoTokenizer, env } = await import(/* webpackIgnore: true */ TRANSFORMERS)
  env.allowLocalModels = false
  env.useBrowserCache = true
  const dtype = header.modelDtype || 'q8'
  // WebGPU only when an adapter really exists (navigator.gpu alone is not enough: headless/blocklisted GPUs)
  let gpu = false
  try { gpu = !!(navigator.gpu && (await navigator.gpu.requestAdapter())) } catch { gpu = false }
  const devices = gpu ? ['webgpu', 'wasm'] : ['wasm']
  let lastErr = null
  for (const device of devices) {
    try {
      if (header.kind === 'sentence_embedding') {
        const [tok, model] = await Promise.all([
          AutoTokenizer.from_pretrained(header.model, { progress_callback: progress }),
          AutoModel.from_pretrained(header.model, { dtype, device, progress_callback: progress }),
        ])
        embedFn = async (text) => {
          const out = await model(await tok([text], { padding: true, truncation: true }))
          return normalize(out.sentence_embedding.data, header.dims)
        }
      } else {
        const ex = await pipeline('feature-extraction', header.model, { dtype, device, progress_callback: progress })
        embedFn = async (text) => normalize((await ex([text], { pooling: 'mean', normalize: true })).data, header.dims)
      }
      await embedFn(header.queryPrefix + 'warm up') // compile shaders / kernels now, not on the first question
      index = decode(await vectors, header.dims, header.count)
      return device
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('Could not load the model')
}

function search(vec, k) {
  const { q8, scales, dims, count } = index
  const scores = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    let s = 0
    const b = i * dims
    for (let d = 0; d < dims; d++) s += q8[b + d] * vec[d]
    scores[i] = s * scales[i]
  }
  const idx = Array.from(scores.keys()).sort((a, b) => scores[b] - scores[a]).slice(0, k)
  return idx.map((i) => [i, scores[i]])
}

self.onmessage = async (e) => {
  const m = e.data || {}
  try {
    if (m.type === 'init') {
      initP ??= init(m.header, m.vectorsUrl)
      const device = await initP
      self.postMessage({ type: 'ready', device })
    } else if (m.type === 'embed') {
      await initP
      const vec = await embedFn(header.queryPrefix + m.text)
      self.postMessage({ type: 'vec', id: m.id, vec }, [vec.buffer])
    } else if (m.type === 'search') {
      await initP
      self.postMessage({ type: 'hits', id: m.id, hits: search(m.vec, m.k || 20) })
    }
  } catch (err) {
    const message = err && err.message ? err.message : String(err)
    if (m.type === 'init') { initP = null; self.postMessage({ type: 'error', message }) }
    else self.postMessage({ type: 'fail', id: m.id, message })
  }
}
