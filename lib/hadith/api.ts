import 'server-only'
// Adapters over lib/hadith for the public API (/api/v1/hadith), the MCP server and markdown alternates.
import type { HadithItem, HadithProvider } from '@/lib/mcp/extensions'
import { absoluteUrl, site } from '@/lib/site'
import { collectionMeta, resolveCollectionSlug, COLLECTIONS, type CollectionSlug } from './collections'
import { isServable } from './data'
import { getCollections, getHadith, type Hadith } from './hadith'
import { parseHadithReference } from './search-utils'
import { searchHadith } from './search'
import { hadithUrl } from './url'

const join = (a: (string | undefined)[]) => a.filter(Boolean).join('\n\n') || undefined

export const hadithCitation = (collection: CollectionSlug, number: number) => `${collectionMeta(collection)!.cite} ${number} — ${site.name}, ${absoluteUrl(hadithUrl(collection, number))}`

export function toHadithItem(h: Hadith): HadithItem {
  const meta = collectionMeta(h.collection)!
  const multi = h.entries.length > 1
  const part = (k: 'ar' | 'en' | 'bn') => join(h.entries.map((e) => (e[k] ? (multi ? `[${h.number}${e.sub}] ${e[k]}` : e[k]) : undefined)))
  const grades = h.entries.flatMap((e) => e.grades)
  const grade = meta.authenticity === 'consensus' ? 'Sahih (authentic by consensus of the scholars)' : grades.length ? [...new Set(grades.map((g) => `${g.grader}: ${g.grade}`))].join('; ') : undefined
  return {
    id: `${h.collection}:${h.number}`,
    collection: h.collection,
    collectionName: meta.name.en,
    number: String(h.number),
    arabic: part('ar'),
    english: part('en'),
    bangla: part('bn'),
    grade,
    narrator: h.entries.find((e) => e.narrator)?.narrator,
    title: h.title || undefined,
    book: h.book ? { number: h.book.n, name: h.book.name } : undefined,
    narrations: h.entries.length,
    url: absoluteUrl(hadithUrl(h.collection, h.number)),
    urlBn: absoluteUrl(hadithUrl(h.collection, h.number, 'bn')),
    citation: hadithCitation(h.collection, h.number),
  }
}

export async function getHadithItem(collection: string, number: number): Promise<HadithItem | null> {
  const h = await getHadith(collection, number)
  return h ? toHadithItem(h) : null
}

export function collectionList() {
  return getCollections().map((c) => ({ id: c.slug, name: c.name.en, nameArabic: c.name.ar, nameBangla: c.name.bn, hadiths: c.count, books: c.books, languages: Object.entries(c.langs).filter(([, v]) => v).map(([k]) => k), url: absoluteUrl(`/hadith/${c.slug}`) }))
}

export const isCollectionId = (s: string) => !!resolveCollectionSlug(s)

/** Search → API items (snippets in the search language; open `url` for the full text). */
export async function searchHadithItems(q: string, opts: { collection?: string; limit?: number; offset?: number; lang?: 'en' | 'bn' | 'ar' } = {}) {
  const r = await searchHadith(q, opts)
  const field = r.lang === 'ar' ? 'arabic' : r.lang === 'bn' ? 'bangla' : 'english'
  const results: HadithItem[] = r.results.map((x) => ({
    id: `${x.collection}:${x.number}`, collection: x.collection, collectionName: collectionMeta(x.collection)!.name.en, number: String(x.number),
    [field]: x.snippet, url: absoluteUrl(hadithUrl(x.collection, x.number)), citation: hadithCitation(x.collection, x.number), score: x.score,
  }))
  // `failed`: collections that could not be searched right now (corpus unreachable) → the results are partial
  return { query: r.query, language: r.lang, total: r.total, exact: r.exact ? { ...r.exact, url: absoluteUrl(r.exact.url) } : null, results, failed: r.failed }
}

/** MCP provider (lib/mcp/providers.ts). */
export const hadithMcpProvider: HadithProvider = {
  async getHadith(reference) {
    const ref = parseHadithReference(reference)
    if (!ref || !isServable(ref.collection, ref.number)) return null
    return getHadithItem(ref.collection, ref.number)
  },
  async searchHadith(query, opts = {}) {
    const col = opts.collection && resolveCollectionSlug(opts.collection)?.slug
    const r = await searchHadithItems(query, { collection: col || undefined, lang: opts.lang, limit: opts.limit })
    return { total: r.total, ...(r.failed.length ? { failed: r.failed } : {}), results: r.exact ? [(await getHadithItem(r.exact.collection, r.exact.number))!, ...r.results].filter(Boolean) : r.results }
  },
  collections: () => COLLECTIONS.map((c) => ({ id: c.slug, name: c.name.en, url: absoluteUrl(`/hadith/${c.slug}`) })),
}
