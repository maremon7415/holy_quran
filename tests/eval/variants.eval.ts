import { it } from 'vitest'
import { readFileSync } from 'node:fs'
import fixture from '../fixtures/ask-eval.json'
import { embedQuery } from '@/lib/ask/embed'
import { cosineAll, decodeIndex, topK, ayahKeys } from '@/lib/ask/vectors'
const S = process.env.ASK_VARIANTS_DIR!
const load = (d: string) => decodeIndex(new Uint8Array(readFileSync(`${S}/${d}/embeddings.bin`)), { dims: 384, count: 6236 })
it('variants', async () => {
  const idx = { both: load('e5small'), en: load('e5en'), bn: load('e5bn') }
  const res: Record<string, number[]> = {}
  for (const q of fixture.queries) {
    const v = await embedQuery(q.q)
    const s = { both: cosineAll(idx.both, v), en: cosineAll(idx.en, v), bn: cosineAll(idx.bn, v) }
    const max = s.en.map((x, i) => Math.max(x, s.bn[i]))
    const avg = s.en.map((x, i) => (x + s.bn[i]) / 2)
    const avg3 = s.en.map((x, i) => (x + s.bn[i] + s.both[i]) / 3)
    for (const [name, arr] of Object.entries({ ...s, max, avg, avg3 })) {
      const top = new Set(topK(arr, 10).map((i) => ayahKeys()[i]))
      ;(res[`${name}/${q.lang}`] ??= []).push(q.expected.filter((e) => top.has(e)).length / q.expected.length)
      ;(res[`${name}/all`] ??= []).push(q.expected.filter((e) => top.has(e)).length / q.expected.length)
    }
  }
  console.log(Object.entries(res).sort().map(([k, v]) => `${k.padEnd(12)} ${(v.reduce((a, b) => a + b) / v.length).toFixed(3)}`).join('\n'))
})
