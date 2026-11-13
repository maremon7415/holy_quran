/**
 * Recall@10 of Ask the Quran on tests/fixtures/ask-eval.json — semantic vs lexical vs hybrid.
 * Runs the real embedding model: `pnpm eval:ask` (set ASK_TUNE=1 to grid-search the hybrid weights
 * on the `tune` split; the `holdout` split is only reported, never tuned on).
 */
import { describe, it, expect } from 'vitest'
import fixture from '../fixtures/ask-eval.json'
import { askQuran } from '@/lib/ask'
import { embedQuery, setEmbedder } from '@/lib/ask/embed'
import { DEFAULT_WEIGHTS, type Weights } from '@/lib/ask/rank'
import { searchQuran } from '@/lib/quran/search'
import { contentTerms } from '@/lib/ask/text'

type Q = (typeof fixture.queries)[number]
const K = 10

function covered(results: { surah: number; from: number; to: number }[]) {
  const s = new Set<string>()
  for (const r of results.slice(0, K)) for (let a = r.from; a <= r.to; a++) s.add(`${r.surah}:${a}`)
  return s
}
const recall = (got: Set<string>, q: Q) => q.expected.filter((e) => got.has(e)).length / q.expected.length

async function hybrid(q: Q, w: Partial<Weights>) {
  return covered((await askQuran(q.q, { limit: K, weights: w, withText: false })).results)
}
/** the existing /search (all words must match) on the raw question */
async function lexical(q: Q) {
  const { hits } = await searchQuran(q.q, K)
  return new Set(hits.map((h) => h.key))
}
/** fairer lexical baseline: /search on the question's content words only (stop-words removed) */
async function lexicalContent(q: Q) {
  const terms = contentTerms(q.q)
  if (!terms.length) return new Set<string>()
  const { hits } = await searchQuran(terms.map((t) => t.raw).join(' '), K)
  return new Set(hits.map((h) => h.key))
}
const SEMANTIC_ONLY: Partial<Weights> = { overlap: 0, lexical: 0, topic: 0 }

async function table(w: Partial<Weights>) {
  const rows: Record<string, { n: number; lex: number; lexc: number; sem: number; hyb: number }> = {}
  for (const q of fixture.queries) {
    const [l, lc, s, h] = [recall(await lexical(q), q), recall(await lexicalContent(q), q), recall(await hybrid(q, SEMANTIC_ONLY), q), recall(await hybrid(q, w), q)]
    for (const k of [q.split, `${q.split}/${q.lang}`, 'all']) {
      const r = (rows[k] ??= { n: 0, lex: 0, lexc: 0, sem: 0, hyb: 0 })
      r.n++; r.lex += l; r.lexc += lc; r.sem += s; r.hyb += h
    }
    if (process.env.ASK_VERBOSE) console.log(`${q.id.padEnd(18)} lex ${l.toFixed(2)} lexc ${lc.toFixed(2)} sem ${s.toFixed(2)} hyb ${h.toFixed(2)}`)
  }
  const f = (x: number, n: number) => +(x / n).toFixed(3)
  return Object.fromEntries(Object.entries(rows).sort().map(([k, r]) => [k, { n: r.n, lexical: f(r.lex, r.n), 'lexical (content words)': f(r.lexc, r.n), semantic: f(r.sem, r.n), hybrid: f(r.hyb, r.n) }]))
}

describe('Ask the Quran eval (real model)', () => {
  it('recall@10', async () => {
    const vecs = new Map<string, Float32Array>()
    for (const q of fixture.queries) vecs.set(q.q.trim(), await embedQuery(q.q.trim()))
    setEmbedder(async (t) => vecs.get(t) ?? embedQuery(t))

    if (process.env.ASK_TUNE) {
      const tune = fixture.queries.filter((q) => q.split === 'tune')
      let best = { score: -1, w: DEFAULT_WEIGHTS as Partial<Weights> }
      for (const overlap of [0, 0.02, 0.04, 0.06, 0.08])
        for (const lexical of [0, 0.01, 0.02, 0.04])
          for (const topic of [0, 0.025, 0.05, 0.075, 0.1]) {
            const w = { overlap, lexical, topic }
            let s = 0
            for (const q of tune) s += recall(await hybrid(q, w), q)
            if (s > best.score + 1e-9) best = { score: s, w }
          }
      console.log('best tune weights', best.w, 'recall', (best.score / tune.length).toFixed(3))
    }
    const t = await table(process.env.ASK_WEIGHTS ? JSON.parse(process.env.ASK_WEIGHTS) : DEFAULT_WEIGHTS)
    console.table(t)
    expect(t.all.hybrid).toBeGreaterThanOrEqual(t.all.lexical)
  })
})
