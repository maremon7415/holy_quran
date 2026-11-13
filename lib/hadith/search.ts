import 'server-only'
// Server-side hadith search: English, Bangla and Arabic (normalised with lib/quran/normalize.ts).
// Each collection/language edition is downloaded once (jsDelivr .min.json), reduced to {number, text} rows and kept in a
// size-bounded in-memory LRU, so memory stays reasonable and repeat searches are instant. Search one collection or all.
import { normalizeArabic } from '@/lib/quran/normalize'
import { COLLECTIONS, collectionMeta, type CollectionSlug, type HadithLang } from './collections'
import { isServable } from './data'
import { fetchApi, type ApiHadith } from './fetch'
import { urlNumberOf } from './numbering'
import { cleanEnglish } from './text'
import { hadithUrl } from './url'
import { parseHadithReference, parseQuery, tokenRegex, detectLang } from './search-utils'

const EDITION: Record<HadithLang, string> = { ar: 'ara', en: 'eng', bn: 'ben' }
/** Max characters kept across all cached editions (≈ 70 MB of text). Least-recently-used editions are evicted. */
export const SEARCH_CACHE_CHARS = 70_000_000

interface Row { n: number; t: string }
interface Loaded { rows: Row[]; chars: number; used: number }
const loaded = new Map<string, Loaded>()
const inflight = new Map<string, Promise<Loaded>>()
let tick = 0

function evict(keep: string) {
  let total = 0
  for (const v of loaded.values()) total += v.chars
  while (total > SEARCH_CACHE_CHARS) {
    let oldest: string | null = null
    for (const [k, v] of loaded) if (k !== keep && (oldest === null || v.used < loaded.get(oldest)!.used)) oldest = k
    if (!oldest) break
    total -= loaded.get(oldest)!.chars
    loaded.delete(oldest)
  }
}

/** Test hook. */
export function _resetSearchCache() { loaded.clear(); inflight.clear() }

async function loadRows(slug: CollectionSlug, lang: HadithLang): Promise<Loaded | null> {
  const meta = collectionMeta(slug)!
  if (!meta.langs[lang]) return null
  const key = `${lang}:${slug}`
  const hit = loaded.get(key)
  if (hit) { hit.used = ++tick; return hit }
  let p = inflight.get(key)
  if (!p) {
    p = (async () => {
      // `revalidate: false` → no Next data cache (editions are several MB, above its 2 MB item limit); we keep our own copy.
      const r = await fetchApi<{ hadiths: ApiHadith[] }>(`editions/${EDITION[lang]}-${meta.api}`, { revalidate: false, timeoutMs: 90_000 })
      const rows: Row[] = []
      let chars = 0
      for (const h of r.hadiths) {
        const n = urlNumberOf(slug, h)
        const raw = h.text?.trim()
        if (n == null || !raw || !isServable(slug, n)) continue
        const t = lang === 'ar' ? normalizeArabic(raw.replace(/[\u200e\u200f]/g, '')) : lang === 'en' ? cleanEnglish(raw) : raw.replace(/\s+/g, ' ').replace(/\s*\[\d+\]\s*/g, ' ')
        rows.push({ n, t })
        chars += t.length
      }
      const v: Loaded = { rows, chars, used: ++tick }
      loaded.set(key, v)
      evict(key)
      return v
    })().finally(() => inflight.delete(key))
    inflight.set(key, p)
  }
  return p
}

export interface SearchOptions {
  /** Restrict to one collection (recommended for speed); default all collections that have the language. */
  collection?: CollectionSlug | string
  /** Force the search language; default is detected from the script of the query. */
  lang?: HadithLang
  limit?: number
  offset?: number
}
export interface SearchHit {
  collection: CollectionSlug
  number: number
  /** Canonical English path (use hadithUrl(…, locale) for /bn). */
  url: string
  /** Text excerpt around the match, in the search language (Arabic is returned without diacritics). */
  snippet: string
  score: number
}
export interface SearchResponse {
  query: string
  lang: HadithLang
  terms: string[]
  /** When the query is a reference such as "Sahih Bukhari hadith 1" or "বুখারী হাদিস ১". */
  exact: { collection: CollectionSlug; number: number; url: string } | null
  collections: CollectionSlug[]
  total: number
  results: SearchHit[]
  /** Collections that could not be loaded (network). */
  failed: CollectionSlug[]
}

function snippetOf(text: string, re: RegExp, len = 260): string {
  const m = re.exec(text)
  const pos = m?.index ?? 0
  if (text.length <= len) return text
  let start = pos > 110 ? pos - 90 : 0
  if (start > 0) { const sp = text.indexOf(' ', start); if (sp !== -1 && sp < pos) start = sp + 1 }
  let end = Math.min(text.length, start + len)
  if (end < text.length) { const sp = text.lastIndexOf(' ', end); if (sp > start + 40) end = sp }
  return (start > 0 ? '… ' : '') + text.slice(start, end).trim() + (end < text.length ? ' …' : '')
}

export async function searchHadith(q: string, opts: SearchOptions = {}): Promise<SearchResponse> {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100)
  const offset = Math.max(opts.offset ?? 0, 0)
  const lang = opts.lang ?? detectLang(q)
  const query = parseQuery(q, lang)
  const ref = parseHadithReference(q)
  const exact = ref && isServable(ref.collection, ref.number) ? { ...ref, url: hadithUrl(ref.collection, ref.number) } : null
  const only = opts.collection ? COLLECTIONS.find((c) => c.slug === opts.collection || c.api === opts.collection)?.slug : undefined
  const slugs = (only ? [only] : COLLECTIONS.map((c) => c.slug)).filter((s) => collectionMeta(s)!.langs[lang])
  const base: SearchResponse = { query: query.raw, lang, terms: query.tokens, exact, collections: slugs, total: 0, results: [], failed: [] }
  if (!query.tokens.length || query.raw.length < 2) return base
  if (exact) return base // a pure reference ("Bukhari 1"): jump to it instead of text-searching every collection

  const regs = query.tokens.map((t) => tokenRegex(t, lang))
  const gregs = regs.map((r) => new RegExp(r.source, 'gi'))
  const phrase = query.tokens.length > 1 ? tokenRegex(query.tokens.join(' '), lang) : null
  const hits: (SearchHit & { text: string })[] = []

  // load sequentially-ish (max 3 at a time) to bound peak memory and bandwidth
  const results: ({ slug: CollectionSlug; data: Loaded | null; err?: true })[] = []
  for (let i = 0; i < slugs.length; i += 3) {
    const batch = slugs.slice(i, i + 3)
    const got = await Promise.all(batch.map((slug) => loadRows(slug, lang).then((data) => ({ slug, data }), () => ({ slug, data: null, err: true as const }))))
    for (const g of got) {
      results.push(g)
      if (!g.data) continue
      const seen = new Map<number, number>() // number → index in hits (a number can have several narrations)
      for (const row of g.data.rows) {
        let score = 0
        let ok = true
        for (const re of gregs) {
          const m = row.t.match(re)
          if (!m) { ok = false; break }
          score += Math.min(m.length, 5)
        }
        if (!ok) continue
        if (phrase && phrase.test(row.t)) score += 6
        score += Math.min(3, 400 / (row.t.length + 80)) // shorter, more focused hadiths first
        const prev = seen.get(row.n)
        if (prev !== undefined) { if (score > hits[prev].score) { hits[prev].score = score; hits[prev].text = row.t } continue }
        seen.set(row.n, hits.length)
        hits.push({ collection: g.slug, number: row.n, url: hadithUrl(g.slug, row.n), snippet: '', score, text: row.t })
      }
    }
  }
  base.failed = results.filter((r) => r.err).map((r) => r.slug)
  hits.sort((a, b) => b.score - a.score || a.number - b.number)
  base.total = hits.length
  const first = regs[0]
  base.results = hits.slice(offset, offset + limit).map(({ text, ...h }) => ({ ...h, snippet: snippetOf(text, new RegExp(first.source, 'i')) }))
  return base
}
