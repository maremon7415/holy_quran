import 'server-only'
import { cache } from 'react'
import { collectionMeta, resolveCollectionSlug, type CollectionSlug, type HadithLang } from './collections'
import { allIndexes, bookNumbers, bookRow, collectionIndex, corpusNumbers, isServable, neighbours, type BookRow } from './data'
import { fetchApi, HadithFetchError, type ApiHadith, type ApiSection } from './fetch'
import { normalizeGrades, type Grade } from './grades'
import { subLetter, urlNumberOf } from './numbering'
import { cleanArabic, cleanBangla, cleanEnglish, deriveTitle, extractNarrator } from './text'
import { featured } from './featured'
import { BOOK_PAGE_SIZE, hadithUrl } from './url'

export const ALL_LANGS: HadithLang[] = ['ar', 'en', 'bn']
const EDITION: Record<HadithLang, string> = { ar: 'ara', en: 'eng', bn: 'ben' }

export interface HadithEntry {
  /** "a", "b"… when several narrations share one citation number; '' for a single entry. */
  sub: string
  /** Corpus running number (internal). */
  id: number
  ar?: string
  en?: string
  bn?: string
  narrator?: string
  grades: Grade[]
  /** In-book reference: Book {book}, Hadith {hadith}. */
  ref: { book: number; hadith: number }
}

export interface Hadith {
  collection: CollectionSlug
  number: number
  /** Canonical English path, e.g. /hadith/bukhari/1 */
  url: string
  book: { n: number; name: string } | null
  entries: HadithEntry[]
  prev: number | null
  next: number | null
  /** Short factual title (curated for famous hadiths, else from the first sentence of the English matn); '' if none. */
  title: string
  titleBn: string
  /** Languages that could not be loaded (network); the rest are present. */
  failed: HadithLang[]
}

export interface CollectionSummary {
  slug: CollectionSlug
  name: { en: string; bn: string; ar: string }
  count: number
  books: number
  first: number
  last: number
  url: string
  langs: { ar: boolean; en: boolean; bn: boolean }
  grades?: { by: string; sahih: number; hasan: number; daif: number; other: number; ungraded: number }
}

export function getCollections(): CollectionSummary[] {
  return allIndexes().map(({ slug, meta, index }) => ({
    slug, name: meta.name, count: index.count, books: index.books.length, first: index.first, last: index.last,
    url: `/hadith/${slug}`, langs: meta.langs, grades: index.grades,
  }))
}

const featuredMap = new Map(featured.map((f) => [`${f.c}:${f.n}`, f]))
export const featuredFor = (c: string, n: number) => featuredMap.get(`${c}:${n}`)

function build(slug: CollectionSlug, data: Partial<Record<HadithLang, ApiHadith[]>>): HadithEntry[] {
  const byId = new Map<number, HadithEntry>()
  for (const l of ALL_LANGS) {
    for (const h of data[l] ?? []) {
      let e = byId.get(h.hadithnumber)
      if (!e) byId.set(h.hadithnumber, (e = { sub: '', id: h.hadithnumber, grades: [], ref: h.reference }))
      const text = (h.text ?? '').trim()
      if (text) e[l] = l === 'ar' ? cleanArabic(text) : l === 'en' ? cleanEnglish(text) : cleanBangla(text)
      if (!e.grades.length && h.grades?.length) e.grades = normalizeGrades(h.grades)
    }
  }
  const entries = [...byId.values()].sort((a, b) => a.id - b.id)
  // drop entries that are blank in every language (keeps numbering letters meaningful)
  const live = entries.filter((e) => e.ar || e.en || e.bn)
  live.forEach((e, i) => { e.sub = live.length > 1 ? subLetter(i) : ''; if (e.en) e.narrator = extractNarrator(e.en) })
  return live
}

async function loadLang(slug: CollectionSlug, n: number, lang: HadithLang): Promise<ApiHadith[]> {
  const meta = collectionMeta(slug)!
  const ed = `${EDITION[lang]}-${meta.api}`
  if (slug !== 'muslim') {
    const r = await fetchApi<ApiSection>(`editions/${ed}/${n}`)
    return r.hadiths.filter((h) => Math.floor(h.hadithnumber) === n)
  }
  const ids = corpusNumbers(slug, n)
  const rs = await Promise.all(ids.map((id) => fetchApi<ApiSection>(`editions/${ed}/${id}`)))
  return rs.flatMap((r, i) => r.hadiths.filter((h) => h.hadithnumber === ids[i] && urlNumberOf(slug, h) === n))
}

/**
 * One hadith (all narrations that share the number) in the requested languages.
 * Returns null when the number does not exist / has no text; throws HadithFetchError when the corpus is unreachable.
 * Languages the collection does not have (Bangla for Muwatta Malik and Qudsi) are skipped silently.
 */
export const getHadith = cache(async (collection: string, number: number, langs: HadithLang[] = ALL_LANGS): Promise<Hadith | null> => {
  const slug = resolveCollectionSlug(collection)?.slug
  if (!slug || !isServable(slug, number)) return null
  const meta = collectionMeta(slug)!
  const want = langs.filter((l) => meta.langs[l])
  const settled = await Promise.allSettled(want.map((l) => loadLang(slug, number, l)))
  const data: Partial<Record<HadithLang, ApiHadith[]>> = {}
  const failed: HadithLang[] = []
  settled.forEach((r, i) => { if (r.status === 'fulfilled') data[want[i]] = r.value; else failed.push(want[i]) })
  if (failed.length === want.length && want.length) throw new HadithFetchError(`${slug}/${number}`)
  const entries = build(slug, data)
  if (!entries.length) {
    if (failed.length) throw new HadithFetchError(`${slug}/${number}`)
    return null
  }
  const bk = entries[0].ref.book
  const row = bookRow(slug, bk)
  const f = featuredFor(slug, number)
  const { prev, next } = neighbours(slug, number)
  return {
    collection: slug, number, url: hadithUrl(slug, number), book: row ? { n: row[0], name: row[1] } : null, entries, prev, next,
    title: f?.en ?? deriveTitle(entries.find((e) => e.en)?.en), titleBn: f?.bn ?? '', failed,
  }
})

export interface BookPage {
  collection: CollectionSlug
  book: { n: number; name: string; first: number; last: number; count: number }
  page: number
  pages: number
  items: { number: number; entries: HadithEntry[]; title: string }[]
  failed: HadithLang[]
}

/** The hadiths of one book (section), paginated by BOOK_PAGE_SIZE. null = unknown book / page out of range. */
export const getBook = cache(async (collection: string, bookNo: number, page = 1): Promise<BookPage | null> => {
  const slug = resolveCollectionSlug(collection)?.slug
  if (!slug || !Number.isInteger(bookNo) || !Number.isInteger(page) || page < 1) return null
  const row: BookRow | undefined = bookRow(slug, bookNo)
  if (!row) return null
  const meta = collectionMeta(slug)!
  const nums = bookNumbers(slug, bookNo)
  const pages = Math.max(1, Math.ceil((nums ? nums.length : row[4]) / BOOK_PAGE_SIZE))
  if (page > pages) return null
  const want = ALL_LANGS.filter((l) => meta.langs[l])
  const settled = await Promise.allSettled(want.map((l) => fetchApi<ApiSection>(`editions/${EDITION[l]}-${meta.api}/sections/${bookNo}`)))
  const failed: HadithLang[] = []
  const secs: Partial<Record<HadithLang, ApiHadith[]>> = {}
  settled.forEach((r, i) => { if (r.status === 'fulfilled') secs[want[i]] = r.value.hadiths; else failed.push(want[i]) })
  if (failed.length === want.length) throw new HadithFetchError(`${slug}/book/${bookNo}`)
  // group corpus entries by URL number
  const groups = new Map<number, Partial<Record<HadithLang, ApiHadith[]>>>()
  for (const l of want) for (const h of secs[l] ?? []) {
    const n = urlNumberOf(slug, h)
    if (n == null) continue
    const g = groups.get(n) ?? {}
    ;(g[l] ??= []).push(h)
    groups.set(n, g)
  }
  const all = [...groups.keys()].filter((n) => isServable(slug, n)).sort((a, b) => a - b)
  const slice = all.slice((page - 1) * BOOK_PAGE_SIZE, page * BOOK_PAGE_SIZE)
  if (!slice.length) return null
  const items = slice.map((n) => {
    const entries = build(slug, groups.get(n)!)
    return { number: n, entries, title: featuredFor(slug, n)?.en ?? deriveTitle(entries.find((e) => e.en)?.en) }
  }).filter((i) => i.entries.length)
  return { collection: slug, book: { n: row[0], name: row[1], first: row[2], last: row[3], count: row[4] }, page, pages: Math.max(pages, Math.ceil(all.length / BOOK_PAGE_SIZE)), items, failed }
})

export { collectionIndex }
