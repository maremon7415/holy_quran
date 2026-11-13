/**
 * Offline stand-in for the Ask the Quran model in unit tests: a question maps to the stored vector of an ayah,
 * so semantic ranking is exercised for real (that ayah ranks first) without downloading anything.
 */
import { loadIndex } from '@/lib/ask'
import { rowOf } from '@/lib/ask/vectors'
import { setEmbedder } from '@/lib/ask/embed'

export async function vectorOf(key: string): Promise<Float32Array> {
  const idx = await loadIndex()
  const [s, a] = key.split(':').map(Number)
  const row = rowOf(s, a)
  const v = new Float32Array(idx.dims)
  for (let d = 0; d < idx.dims; d++) v[d] = idx.q8[row * idx.dims + d] * idx.scales[row]
  return v
}

/** `{ 'patience question': '2:153' }` — unknown questions get the vector of `fallback`. */
export function useFakeEmbedder(map: Record<string, string>, fallback = '1:1') {
  setEmbedder(async (q) => vectorOf(map[q] ?? fallback))
}

export const restoreEmbedder = () => setEmbedder(null)
