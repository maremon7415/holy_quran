// URL helpers (client-safe).
import { localeHref, type Locale } from '@/lib/i18n/routes'
import type { CollectionSlug } from './collections'

export const HADITH_BASE = '/hadith'
export const BOOK_PAGE_SIZE = 25

/** `/hadith/bukhari/1` (en) or `/bn/hadith/bukhari/1` (bn). */
export const hadithUrl = (collection: CollectionSlug | string, number: number | string, locale: Locale = 'en') => localeHref(locale, `${HADITH_BASE}/${collection}/${number}`)
export const collectionUrl = (collection: CollectionSlug | string, locale: Locale = 'en') => localeHref(locale, `${HADITH_BASE}/${collection}`)
/** Page 1 lives at `/book/{n}`, later pages at `/book/{n}/page/{p}`. */
export const bookUrl = (collection: CollectionSlug | string, book: number | string, locale: Locale = 'en', page = 1) =>
  localeHref(locale, `${HADITH_BASE}/${collection}/book/${book}${page > 1 ? `/page/${page}` : ''}`)
export const hadithIndexUrl = (locale: Locale = 'en') => localeHref(locale, HADITH_BASE)
export const searchUrl = (q: string, locale: Locale = 'en', opts: { collection?: string; page?: number } = {}) => {
  const sp = new URLSearchParams({ q })
  if (opts.collection) sp.set('c', opts.collection)
  if (opts.page && opts.page > 1) sp.set('page', String(opts.page))
  return `${localeHref(locale, `${HADITH_BASE}/search`)}?${sp.toString()}`
}
