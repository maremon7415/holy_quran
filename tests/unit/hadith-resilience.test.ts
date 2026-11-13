/**
 * Regression tests for the hadith pages' handling of upstream (jsDelivr) failures and blank corpus entries:
 *  - a transient HadithFetchError must FAIL the render (→ 500, ISR keeps the last good page), never produce a cached
 *    "could not be loaded" page with noindex (components/pages/hadith-detail.tsx, components/pages/hadith.tsx);
 *  - fetchApi retries transient failures with backoff (a briefly flaky CDN must not fail `next build`);
 *  - a number that has no text in any served language is a 404, and is not in the sitemap (data/hadith/index.json
 *    `dead` is computed from the languages the app serves: Muwatta Malik's Bangla edition is not used).
 */
import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { fetchApi, HadithFetchError, retryDelay } from '@/lib/hadith/fetch'
import { getHadith } from '@/lib/hadith/hadith'
import { allIndexes, collectionIndex, isServable } from '@/lib/hadith/data'
import { collectionMeta } from '@/lib/hadith/collections'
import { featured } from '@/lib/hadith/featured'
import { hadithSitemapUrls } from '@/lib/hadith/sitemap'
import { HadithPage, hadithMeta, hadithParams } from '@/components/pages/hadith-detail'
import { BookPage, bookParams } from '@/components/pages/hadith'
import { GET as mdRoute } from '@/app/md/[...path]/route'

beforeAll(() => { retryDelay.base = 1 })
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

const h = (n: number, text: string) => ({ hadithnumber: n, arabicnumber: n, text, grades: [], reference: { book: 1, hadith: n } })
const section = (hadiths: unknown[]) => ({ metadata: { name: 'x' }, hadiths })
function stubFetch(route: (url: string, call: number) => Response | unknown | undefined) {
  let call = 0
  const fn = vi.fn(async (input: RequestInfo | URL) => {
    const r = route(String(input), call++)
    if (r instanceof Response) return r
    if (r === undefined) return new Response('nope', { status: 404 })
    return new Response(JSON.stringify(r), { status: 200 })
  })
  vi.stubGlobal('fetch', fn)
  return fn
}
const params = (collection: string, number: string) => ({ params: Promise.resolve({ collection, number }) })
const isNotFound = (e: unknown) => /NEXT_HTTP_ERROR_FALLBACK;404/.test(String((e as { digest?: string })?.digest ?? ''))

describe('fetchApi: retries transient failures, not missing files', () => {
  it('retries a 503 / network error round and then succeeds', async () => {
    const fn = stubFetch((_u, call) => (call < 3 ? new Response('busy', { status: 503 }) : { ok: 1 }))
    await expect(fetchApi('editions/eng-bukhari/1')).resolves.toEqual({ ok: 1 })
    expect(fn).toHaveBeenCalledTimes(4) // 3 URLs failed (503), the retry round's first URL answered
  })
  it('gives up after the configured rounds with HadithFetchError', async () => {
    const fn = stubFetch(() => { throw new TypeError('fetch failed') })
    await expect(fetchApi('editions/eng-bukhari/1', { retries: 2 })).rejects.toBeInstanceOf(HadithFetchError)
    expect(fn).toHaveBeenCalledTimes(9)
  })
  it('does not retry when every copy answers 404', async () => {
    const fn = stubFetch(() => undefined)
    await expect(fetchApi('editions/eng-bukhari/999999', { retries: 3 })).rejects.toBeInstanceOf(HadithFetchError)
    expect(fn).toHaveBeenCalledTimes(3)
  })
  it('retries more during `next build` (prerender) than at request time', async () => {
    vi.stubEnv('NEXT_PHASE', 'phase-production-build')
    const fn = stubFetch(() => new Response('x', { status: 502 }))
    await expect(fetchApi('x')).rejects.toBeInstanceOf(HadithFetchError)
    expect(fn).toHaveBeenCalledTimes(9)
  })
})

describe('hadith page on an upstream failure: error (500), never a cached noindex page', () => {
  it('the page render and its metadata throw HadithFetchError', async () => {
    stubFetch(() => { throw new TypeError('fetch failed') })
    await expect(HadithPage({ locale: 'en', ...params('bukhari', '11') })).rejects.toBeInstanceOf(HadithFetchError)
    await expect(hadithMeta('en', params('bukhari', '12'))).rejects.toBeInstanceOf(HadithFetchError)
    await expect(HadithPage({ locale: 'bn', ...params('bukhari', '13') })).rejects.toBeInstanceOf(HadithFetchError)
  })
  it('a loaded hadith is indexable (no noindex)', async () => {
    stubFetch((u) => (/(ara|eng|ben)-bukhari\/14\.min\.json$/.test(u) ? section([h(14, 'Narrated Anas: text')]) : undefined))
    const m = await hadithMeta('en', params('bukhari', '14'))
    expect(JSON.stringify(m.robots ?? {})).not.toMatch(/noindex|"index":false/)
    expect(m.title).toBeTruthy()
  })
  it('a number with no text in any served language is a 404 (not an error page)', async () => {
    stubFetch((u) => (/(ara|eng|ben)-bukhari\/15\.min\.json$/.test(u) ? section([h(15, '  ')]) : undefined))
    expect(await getHadith('bukhari', 15)).toBeNull()
    const e = await HadithPage({ locale: 'en', ...params('bukhari', '15') }).then(() => null, (x) => x)
    expect(isNotFound(e)).toBe(true)
    expect(await hadithMeta('en', params('bukhari', '15'))).toEqual({})
  })
  it('book pages also fail (500) instead of caching an error state', async () => {
    stubFetch(() => new Response('x', { status: 503 }))
    await expect(BookPage({ locale: 'en', params: Promise.resolve({ collection: 'bukhari', book: '2' }) })).rejects.toBeInstanceOf(HadithFetchError)
  })
  it('the hadith markdown alternate answers 503 (not a 404) while the corpus is unreachable', async () => {
    stubFetch(() => { throw new TypeError('fetch failed') })
    const res = await mdRoute(new Request('http://x'), { params: Promise.resolve({ path: ['hadith', 'bukhari', '16'] }) })
    expect(res.status).toBe(503)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(res.headers.get('retry-after')).toBeTruthy()
  })
})

describe('build-time prerendering stays small', () => {
  it('prerenders only the curated famous hadiths (each servable) and the first book of each collection', () => {
    const p = hadithParams()
    expect(p.length).toBeLessThanOrEqual(featured.length)
    expect(p).toContainEqual({ collection: 'bukhari', number: '1' })
    for (const x of p) expect(isServable(x.collection as never, Number(x.number))).toBe(true)
    expect(bookParams()).toHaveLength(9)
  })
  it('no prerender path is left that renders an error page', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../components/pages/hadith-detail.tsx'), 'utf8')
    expect(src).not.toMatch(/could not be loaded right now\. This is usually temporary/)
    expect(src).not.toMatch(/noindex: true/)
  })
})

describe('data/hadith/index.json integrity: no sitemap URL points at a blank hadith', () => {
  const BLANK_MALIK = [470, 485, 522, 671, 694, 994, 1389, 1597, 1762] // blank in Arabic + English, Bangla only (not served)
  it('Muwatta Malik numbers that only have (unused) Bangla text are dead, not servable and not in the sitemap', () => {
    expect(collectionMeta('malik')!.langs.bn).toBe(false)
    const dead = new Set(collectionIndex('malik').dead)
    for (const n of BLANK_MALIK) { expect(dead.has(n), `malik ${n}`).toBe(true); expect(isServable('malik', n)).toBe(false) }
    const paths = new Set(hadithSitemapUrls().map((u) => u.path))
    for (const n of BLANK_MALIK) expect(paths.has(`/hadith/malik/${n}`)).toBe(false)
  })
  it('dead lists are sorted, unique and inside each collection range', () => {
    for (const { slug, index } of allIndexes()) {
      expect([...index.dead].sort((a, b) => a - b), slug).toEqual(index.dead)
      expect(new Set(index.dead).size).toBe(index.dead.length)
      for (const n of index.dead) expect(n >= index.first && n <= index.last).toBe(true)
    }
  })
  // Full check against the downloaded corpus (scripts/.cache/hadith, created by scripts/build-hadith-index.mjs);
  // skipped where the cache is absent (CI) — the committed index is what the build script produced from it.
  const cache = path.join(__dirname, '../../scripts/.cache/hadith')
  const EDITION = { ar: 'ara', en: 'eng', bn: 'ben' } as const
  it.skipIf(!fs.existsSync(path.join(cache, 'ara-malik.json')))('every sitemap hadith has text in a language the app serves (corpus cache)', () => {
    const sitemap = hadithSitemapUrls().map((u) => u.path).filter((p) => /^\/hadith\/[a-z0-9]+\/\d+$/.test(p))
    const bySlug = new Map<string, number[]>()
    for (const p of sitemap) { const [, , c, n] = p.split('/'); (bySlug.get(c) ?? bySlug.set(c, []).get(c)!).push(Number(n)) }
    for (const { slug, meta } of allIndexes()) {
      const langs = (Object.keys(meta.langs) as (keyof typeof EDITION)[]).filter((l) => meta.langs[l])
      const has = new Set<number>()
      for (const l of langs) {
        const f = path.join(cache, `${EDITION[l]}-${meta.api}.json`)
        if (!fs.existsSync(f)) continue
        for (const x of JSON.parse(fs.readFileSync(f, 'utf8')).hadiths as { hadithnumber: number; arabicnumber?: number | string | null; text?: string }[]) {
          if (!x.text?.trim()) continue
          const n = slug === 'muslim' ? (x.arabicnumber == null ? NaN : Math.floor(parseFloat(String(x.arabicnumber)))) : Math.floor(x.hadithnumber)
          has.add(n)
        }
      }
      const blank = (bySlug.get(slug) ?? []).filter((n) => !has.has(n))
      expect(blank, `${slug}: sitemap hadiths without text in ${langs.join('/')}`).toEqual([])
    }
  }, 60_000)
})
