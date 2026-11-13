import 'server-only'
/**
 * Ask the Quran — meaning-based search over all 6,236 ayahs (server).
 * Embeds the question (lib/ask/embed.ts, or a client-computed vector), ranks by cosine similarity
 * against the precomputed ayah vectors, adds small lexical/topic boosts (lib/ask/rank.ts) and groups
 * consecutive ayahs. Never throws for a model problem: it degrades to lexical ranking (`mode: 'lexical'`).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import header from '@/data/quran/embeddings.json'
import { chapters, readerHref, surahHref, surahNamesBn } from '@/lib/quran/chapters'
import { getUccharon, getVerses } from '@/lib/quran/data'
import { searchQuran } from '@/lib/quran/search'
import { topics } from '@/data/content/topics'
import { absoluteUrl } from '@/lib/site'
import { ayahCitation } from '@/lib/content/cite'
import { cosineAll, decodeIndex, decodeQueryVector, rowOf, type VectorIndex } from './vectors'
import { contentTerms, matchTopics, prepareAyahText, scriptOf, type AyahText, type Script } from './text'
import { groupConsecutive, rank, type Weights } from './rank'
import { embedModel, embedQuery } from './embed'
import type { Verse } from '@/lib/quran/types'

export type AskLang = 'en' | 'bn' | 'ar'

export interface AskAyah {
  key: string
  ayah: number
  arabic: string
  /** Saheeh International */
  en: string
  /** Taisirul Quran */
  bn: string
  /** Bangla pronunciation guide (only when lang = bn) */
  uccharon?: string
}

export interface AskResult {
  ref: string
  surah: number
  from: number
  to: number
  surahName: string
  surahNameBn: string
  surahNameAr: string
  /** hybrid score of the best ayah in the range (cosine + boosts) */
  score: number
  /** cosine similarity of the best ayah (0 in lexical mode) */
  similarity: number
  why: { words: string[]; topics: { slug: string; title: { en: string; bn: string; ar?: string } }[] }
  ayahs: AskAyah[]
  /** reader link (relative), e.g. /surah/al-baqarah#ayah-153 */
  href: string
  /** canonical single-ayah page */
  url: string
  citation: string
}

export interface AskResponse {
  query: string
  lang: AskLang
  mode: 'semantic' | 'lexical'
  /** explanation when semantic ranking was unavailable */
  note?: string
  model: string
  tookMs: number
  results: AskResult[]
}

export interface AskOptions {
  lang?: AskLang
  limit?: number
  /** base64url query vector computed in the browser (see encodeQueryVector) — skips the server model */
  queryVector?: string | null
  weights?: Partial<Weights>
  /** include ayah text (default true) */
  withText?: boolean
}

let indexP: Promise<VectorIndex> | null = null
export function loadIndex(): Promise<VectorIndex> {
  indexP ??= fs.readFile(path.join(process.cwd(), 'data/quran/embeddings.bin')).then((b) => decodeIndex(new Uint8Array(b), header))
  indexP.catch(() => { indexP = null })
  return indexP
}

let versesP: Promise<Verse[]> | null = null
function allVerses(): Promise<Verse[]> {
  versesP ??= (async () => {
    const all: Verse[] = []
    for (let s = 1; s <= 114; s++) all.push(...(await getVerses(s)))
    return all
  })()
  return versesP
}
const textCache = new Map<number, AyahText>()

export const MAX_QUERY = 300

/** Embed (or decode) the query vector; null + reason when unavailable. */
async function queryVector(q: string, qv?: string | null): Promise<{ v: Float32Array | null; note?: string }> {
  if (qv) {
    const v = decodeQueryVector(qv, header.dims)
    if (v) return { v }
  }
  try {
    return { v: await embedQuery(q) }
  } catch (e) {
    if (process.env.ASK_DEBUG) console.warn('[ask] embedding failed:', e)
    return { v: null, note: 'Meaning-based search is unavailable right now, so these results come from word matching.' }
  }
}

export async function askQuran(question: string, opts: AskOptions = {}): Promise<AskResponse> {
  const t0 = Date.now()
  const q = question.trim().slice(0, MAX_QUERY)
  const script: Script = scriptOf(q)
  const lang: AskLang = opts.lang ?? (script === 'bn' ? 'bn' : script === 'ar' ? 'ar' : 'en')
  const limit = Math.max(1, Math.min(30, opts.limit ?? 12))
  const base = { query: q, lang, model: embedModel }
  if (q.length < 2) return { ...base, mode: 'lexical', tookMs: 0, results: [] }

  const terms = contentTerms(q, script)
  const [{ v, note }, index, verses, lex] = await Promise.all([
    queryVector(q, opts.queryVector),
    loadIndex().catch(() => null),
    allVerses(),
    terms.length ? searchQuran(terms.map((t) => t.raw).join(' '), 60).catch(() => ({ hits: [] })) : Promise.resolve({ hits: [] }),
  ])
  const semantic = v && index ? cosineAll(index, v) : null
  const text = (row: number) => {
    let t = textCache.get(row)
    if (!t) { t = prepareAyahText(verses[row]); textCache.set(row, t) }
    return t
  }
  const hits = rank({
    semantic,
    terms,
    script,
    text,
    lexicalRows: lex.hits.map((h) => rowOf(h.surah, h.ayah)),
    topics: matchTopics(q, topics),
    weights: opts.weights,
  }, Math.round(limit * 1.6))
  const groups = groupConsecutive(hits, limit)
  const topicTitle = new Map(topics.map((t) => [t.slug, { en: t.en, bn: t.bn, ar: t.ar }]))
  const needUcc = lang === 'bn' && opts.withText !== false
  const ucc = new Map<number, string[]>()
  if (needUcc) for (const g of groups) if (!ucc.has(g.surah)) ucc.set(g.surah, await getUccharon(g.surah))

  const results: AskResult[] = groups.map((g) => {
    const c = chapters[g.surah - 1]
    const best = g.items.reduce((a, b) => (b.score > a.score ? b : a))
    const words = [...new Set(g.items.flatMap((i) => i.words))]
    const slugs = [...new Set(g.items.flatMap((i) => i.topics))]
    const url = absoluteUrl(surahHref(g.surah, g.from))
    return {
      ref: g.ref, surah: g.surah, from: g.from, to: g.to,
      surahName: c.nameSimple, surahNameBn: surahNamesBn[g.surah - 1], surahNameAr: c.nameArabic,
      score: +best.score.toFixed(4), similarity: +best.semantic.toFixed(4),
      why: { words, topics: slugs.map((slug) => ({ slug, title: topicTitle.get(slug)! })).filter((t) => t.title) },
      ayahs: opts.withText === false ? [] : g.items.map((i) => {
        const vv = verses[i.row]
        const u = needUcc ? ucc.get(g.surah)?.[i.ayah - 1] : undefined
        return { key: i.key, ayah: i.ayah, arabic: vv.ar, en: vv.en, bn: vv.bn, ...(u ? { uccharon: u } : {}) }
      }),
      href: readerHref(g.surah, g.from),
      url,
      citation: ayahCitation(g.ref, c.nameSimple, url),
    }
  })
  return { ...base, mode: semantic ? 'semantic' : 'lexical', ...(semantic ? {} : { note }), tookMs: Date.now() - t0, results }
}

/** Public JSON API / MCP shape: every ayah range with canonical URLs (+ Bangla twin, markdown) and a citation. */
export async function askApi(question: string, opts: { lang?: AskLang; limit?: number } = {}) {
  const { links } = await import('@/lib/api/corpus')
  const r = await askQuran(question, { lang: opts.lang, limit: opts.limit ?? 10 })
  const lang = opts.lang
  return {
    query: r.query,
    mode: r.mode,
    ...(r.note ? { note: r.note } : {}),
    model: r.model,
    method: 'Cosine similarity between multilingual-e5-small embeddings of the question and of each ayah (English Saheeh International + Bangla Taisirul Quran), plus small boosts for shared words and curated topics. Consecutive matching ayahs are merged into ranges. No generated text.',
    results: r.results.map((g) => ({
      reference: g.ref,
      surah: { id: g.surah, name: g.surahName, nameArabic: g.surahNameAr, nameBangla: g.surahNameBn },
      score: g.score,
      similarity: g.similarity,
      matched: { words: g.why.words, topics: g.why.topics.map((t) => t.slug) },
      ayahs: g.ayahs.map((a) => ({
        key: a.key, arabic: a.arabic,
        ...(lang === 'bn' ? { bangla: a.bn, ...(a.uccharon ? { uccharon: a.uccharon } : {}) } : lang === 'ar' ? {} : lang === 'en' ? { saheeh: a.en } : { saheeh: a.en, bangla: a.bn }),
      })),
      ...links(surahHref(g.surah, g.from)),
      citation: g.citation,
    })),
    askPage: absoluteUrl(`/ask?q=${encodeURIComponent(r.query)}`),
  }
}
