import 'server-only'
/**
 * Public server API of the hadith library (used by the pages, and by MCP / /api/v1).
 *
 *   getCollections()                       → the 9 collections with counts (sync, from data/hadith/index.json)
 *   getBook(collection, book, page?)       → the hadiths of one book (section), paginated (25 per page)
 *   getHadith(collection, number, langs?)  → one hadith in ar/en/bn (null = not found; throws HadithFetchError if the corpus is unreachable)
 *   searchHadith(q, opts)                  → Arabic / English / Bangla search (see search.ts)
 *   hadithUrl(collection, number, locale)  → canonical path ('/hadith/bukhari/1' or '/bn/hadith/bukhari/1')
 *
 * Numbering: the URL number is the commonly cited number (sunnah.com). For Sahih Muslim this is the Muhammad Fu'ad
 * 'Abd al-Baqi number (corpus `arabicnumber`), not the corpus running index. Several narrations may share a number
 * ("Sahih Muslim 2564a/b/c"): they are returned together as `entries`. See lib/hadith/numbering.ts.
 */
export { getCollections, getHadith, getBook, featuredFor, ALL_LANGS } from './hadith'
export type { Hadith, HadithEntry, CollectionSummary, BookPage } from './hadith'
export { searchHadith } from './search'
export type { SearchOptions, SearchHit, SearchResponse } from './search'
export { HadithFetchError } from './fetch'
export { isServable, neighbours, collectionIndex, allIndexes, bookRow, indexMeta } from './data'
export { hadithUrl, collectionUrl, bookUrl, hadithIndexUrl, searchUrl, BOOK_PAGE_SIZE } from './url'
export { COLLECTIONS, collectionMeta, resolveCollectionSlug, isCollectionSlug } from './collections'
export type { CollectionSlug, CollectionMeta, HadithLang } from './collections'
export { featured, hadithOfTheDay, dayPool } from './featured'
export { parseHadithSource } from './source'
export { parseHadithReference } from './search-utils'
export { urlNumberOf, parseHadithNumber } from './numbering'
