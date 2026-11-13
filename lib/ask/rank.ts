/**
 * Ask the Quran — hybrid ranking (client + server safe, pure).
 *
 * score = cosine(query, ayah)
 *       + W.overlap × share of the question's content words found in the ayah
 *       + W.lexical × (ayah is a hit of the strict full-text search on the content words)
 *       + W.topic   × topic-match strength (the question names a curated topic that lists the ayah)
 *
 * Weights were grid-searched on the `tune` half of tests/fixtures/ask-eval.json (`ASK_TUNE=1 pnpm eval:ask`, tests/eval/ask.eval.ts);
 * the `holdout` half is only reported.
 */
import { rowOf, ayahKeys, topK } from './vectors'
import { matchedTerms, type AyahText, type Script, type Term, type TopicMatch } from './text'

export interface Weights { overlap: number; lexical: number; topic: number; pool: number }
export const DEFAULT_WEIGHTS: Weights = { overlap: 0.04, lexical: 0, topic: 0.1, pool: 150 }
/** Without a query vector (model unavailable) the boosts are the whole score. */
export const LEXICAL_MODE_WEIGHTS: Weights = { overlap: 1, lexical: 0.5, topic: 0.6, pool: 0 }

export interface Scored {
  row: number
  key: string
  surah: number
  ayah: number
  score: number
  semantic: number
  words: string[]
  topics: string[]
}

export interface RankInput {
  /** cosine per ayah row (mushaf order); omit for lexical-only ranking */
  semantic?: Float32Array | null
  terms: Term[]
  script: Script
  text: (row: number) => AyahText
  /** rows matched by the strict full-text search (all content words) */
  lexicalRows?: Iterable<number>
  topics?: TopicMatch[]
  weights?: Partial<Weights>
}

export function expandRef(ref: string): [number, number][] {
  const m = ref.match(/^(\d+):(\d+)(?:-(\d+))?$/)
  if (!m) return []
  const s = +m[1], f = +m[2], t = m[3] ? +m[3] : f
  const out: [number, number][] = []
  for (let a = f; a <= t; a++) out.push([s, a])
  return out
}

export function rank(input: RankInput, limit = 15): Scored[] {
  const W = input.semantic ? { ...DEFAULT_WEIGHTS, ...input.weights } : LEXICAL_MODE_WEIGHTS
  const keys = ayahKeys()
  const lexical = new Set(input.lexicalRows ?? [])
  const topicStrength = new Map<number, { s: number; slugs: string[] }>()
  for (const t of input.topics ?? []) {
    for (const ref of t.refs) for (const [s, a] of expandRef(ref)) {
      const row = rowOf(s, a)
      const cur = topicStrength.get(row) ?? { s: 0, slugs: [] }
      cur.s = Math.max(cur.s, t.strength)
      cur.slugs.push(t.slug)
      topicStrength.set(row, cur)
    }
  }
  const pool = new Set<number>(input.semantic ? topK(input.semantic, W.pool) : [])
  for (const r of lexical) pool.add(r)
  for (const r of topicStrength.keys()) pool.add(r)

  const nTerms = input.terms.length
  const out: Scored[] = []
  for (const row of pool) {
    if (row < 0 || row >= keys.length) continue
    const sem = input.semantic ? input.semantic[row] : 0
    const words = nTerms ? matchedTerms(input.terms, input.text(row), input.script) : []
    const ts = topicStrength.get(row)
    const score = sem
      + (nTerms ? W.overlap * (words.length / nTerms) : 0)
      + (lexical.has(row) ? W.lexical : 0)
      + (ts ? W.topic * ts.s : 0)
    if (!input.semantic && !words.length && !ts && !lexical.has(row)) continue
    const [s, a] = keys[row].split(':').map(Number)
    out.push({ row, key: keys[row], surah: s, ayah: a, score, semantic: sem, words: words.map((w) => w.raw), topics: ts?.slugs ?? [] })
  }
  out.sort((a, b) => b.score - a.score || a.row - b.row)
  return out.slice(0, limit)
}

export interface Group {
  surah: number
  from: number
  to: number
  /** "2:155" or "2:155-157" */
  ref: string
  score: number
  items: Scored[]
}

/**
 * Merge hits on consecutive ayahs of the same surah into one range (ordered by the best member).
 * Keeps the first `limit` groups.
 */
export function groupConsecutive(hits: Scored[], limit = hits.length): Group[] {
  const byKey = new Map(hits.map((h) => [h.row, h]))
  const used = new Set<number>()
  const groups: Group[] = []
  for (const h of hits) {
    if (used.has(h.row)) continue
    let lo = h.row, hi = h.row
    while (byKey.has(lo - 1) && byKey.get(lo - 1)!.surah === h.surah && !used.has(lo - 1)) lo--
    while (byKey.has(hi + 1) && byKey.get(hi + 1)!.surah === h.surah && !used.has(hi + 1)) hi++
    const items: Scored[] = []
    for (let r = lo; r <= hi; r++) { used.add(r); items.push(byKey.get(r)!) }
    const from = items[0].ayah, to = items[items.length - 1].ayah
    groups.push({ surah: h.surah, from, to, ref: from === to ? `${h.surah}:${from}` : `${h.surah}:${from}-${to}`, score: h.score, items })
    if (groups.length >= limit) break
  }
  return groups
}
