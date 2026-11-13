/**
 * Ask the Quran — precomputed ayah embeddings (client + server safe, no Node APIs).
 *
 * `data/quran/embeddings.bin` = [count × dims int8][count float32 per-vector scales], mushaf order,
 * built offline by `scripts/build-embeddings.mjs`. The header lives in `data/quran/embeddings.json`.
 */
import { chapters } from '@/lib/quran/chapters'

export interface EmbeddingHeader {
  model: string
  dims: number
  count: number
  queryPrefix: string
  bytes: number
  sha256: string
}

export interface VectorIndex {
  dims: number
  count: number
  q8: Int8Array
  scales: Float32Array
}

/** "s:a" key for every ayah in mushaf order (index = row in the vector file). */
let _keys: string[] | null = null
export function ayahKeys(): string[] {
  if (_keys) return _keys
  const keys: string[] = []
  for (const c of chapters) for (let a = 1; a <= c.versesCount; a++) keys.push(`${c.id}:${a}`)
  return (_keys = keys)
}

/** Row offset of the first ayah of each surah (index = surah id - 1). */
let _offsets: number[] | null = null
export function surahOffsets(): number[] {
  if (_offsets) return _offsets
  const o: number[] = []
  let n = 0
  for (const c of chapters) { o.push(n); n += c.versesCount }
  return (_offsets = o)
}
export const rowOf = (surah: number, ayah: number) => surahOffsets()[surah - 1] + ayah - 1

export function decodeIndex(buf: ArrayBuffer | Uint8Array, header: Pick<EmbeddingHeader, 'dims' | 'count'>): VectorIndex {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  const { dims, count } = header
  const qBytes = dims * count
  if (u8.byteLength !== qBytes + count * 4) throw new Error(`Embedding file size ${u8.byteLength} ≠ expected ${qBytes + count * 4}`)
  const q8 = new Int8Array(u8.buffer, u8.byteOffset, qBytes)
  // Float32Array needs 4-byte alignment: copy the (small) scale block
  const scales = new Float32Array(count)
  new Uint8Array(scales.buffer).set(u8.subarray(qBytes, qBytes + count * 4))
  return { dims, count, q8, scales }
}

/** Cosine similarity of an L2-normalised query vector against every ayah (dequantised on the fly). */
export function cosineAll(index: VectorIndex, q: ArrayLike<number>): Float32Array {
  const { dims, count, q8, scales } = index
  if (q.length !== dims) throw new Error(`Query vector has ${q.length} dims, index has ${dims}`)
  const out = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    let s = 0
    const base = i * dims
    for (let d = 0; d < dims; d++) s += q8[base + d] * q[d]
    out[i] = s * scales[i]
  }
  return out
}

export function normalize(v: ArrayLike<number>): Float32Array {
  let n = 0
  for (let i = 0; i < v.length; i++) n += v[i] * v[i]
  n = Math.sqrt(n) || 1
  const out = new Float32Array(v.length)
  for (let i = 0; i < v.length; i++) out[i] = v[i] / n
  return out
}

/** Indices of the `k` largest values (descending). */
export function topK(scores: ArrayLike<number>, k: number): number[] {
  const idx: number[] = []
  let min = -Infinity
  for (let i = 0; i < scores.length; i++) {
    const s = scores[i]
    if (idx.length < k) {
      idx.push(i)
      if (idx.length === k) { idx.sort((a, b) => scores[b] - scores[a]); min = scores[idx[k - 1]] }
    } else if (s > min) {
      let j = k - 1
      while (j > 0 && scores[idx[j - 1]] < s) j--
      idx.splice(j, 0, i)
      idx.pop()
      min = scores[idx[k - 1]]
    }
  }
  if (idx.length < k) idx.sort((a, b) => scores[b] - scores[a])
  return idx
}

/* ── query vector transport (client-side embedding → server ranking: ?qv=) ── */

/** int8 + float32 scale, base64url: ~520 chars for 384 dims. */
export function encodeQueryVector(v: ArrayLike<number>): string {
  let max = 0
  for (let i = 0; i < v.length; i++) max = Math.max(max, Math.abs(v[i]))
  const scale = max / 127 || 1
  const bytes = new Uint8Array(4 + v.length)
  new DataView(bytes.buffer).setFloat32(0, scale, true)
  for (let i = 0; i < v.length; i++) bytes[4 + i] = Math.round(v[i] / scale) & 0xff
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeQueryVector(s: string, dims: number): Float32Array | null {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(s)) return null
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
    if (bin.length !== 4 + dims) return null
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    const scale = new DataView(bytes.buffer).getFloat32(0, true)
    if (!Number.isFinite(scale) || scale <= 0 || scale > 1) return null
    const v = new Float32Array(dims)
    const i8 = new Int8Array(bytes.buffer, 4)
    for (let i = 0; i < dims; i++) v[i] = i8[i] * scale
    return normalize(v)
  } catch {
    return null
  }
}
