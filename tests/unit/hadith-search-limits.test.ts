/**
 * Regression tests:
 *  - /api/v1/hadith/search dropped `failed` collections and returned 200 partial results cached for a day.
 *  - parseHadithReference ran `/(\d{1,5})(?!.*\d)/` (quadratic) on unsliced input: "1 " × 2500 took > 1 s.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET as searchGet } from '@/app/api/v1/hadith/search/route'
import { _resetSearchCache, searchHadith } from '@/lib/hadith/search'
import { lastDigitRun, MAX_HADITH_QUERY, parseHadithReference } from '@/lib/hadith/search-utils'
import { retryDelay } from '@/lib/hadith/fetch'
import { HadithSearchPage } from '@/components/pages/hadith-search'

afterEach(() => { vi.unstubAllGlobals(); _resetSearchCache() })
const h = (n: number, text: string) => ({ hadithnumber: n, arabicnumber: n, text, grades: [], reference: { book: 1, hadith: n } })

describe('hadith search API: partial results are flagged and cached briefly', () => {
  it('includes `failed` and uses a short cache when some collections are unreachable', async () => {
    retryDelay.base = 1
    vi.stubGlobal('fetch', vi.fn(async (u: RequestInfo | URL) => {
      const url = String(u)
      if (/editions\/eng-bukhari\.min\.json$/.test(url)) return new Response(JSON.stringify({ metadata: { name: 'x' }, hadiths: [h(1, 'Be patient, patience is light.')] }))
      return new Response('down', { status: 503 })
    }))
    const res = await searchGet(new Request('http://x/api/v1/hadith/search?q=patience'))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.results.map((r: { id: string }) => r.id)).toEqual(['bukhari:1'])
    expect(j.failed.length).toBeGreaterThan(0)
    expect(j.failed).not.toContain('bukhari')
    const cc = res.headers.get('cache-control')!
    expect(cc).toMatch(/s-maxage=60\b/)
    expect(cc).not.toMatch(/stale-while-revalidate|86400/)
  })
  it('complete results keep the normal long cache and an empty `failed`', async () => {
    vi.stubGlobal('fetch', vi.fn(async (u: RequestInfo | URL) => (/editions\/eng-bukhari\.min\.json$/.test(String(u)) ? new Response(JSON.stringify({ metadata: { name: 'x' }, hadiths: [h(1, 'Be patient.')] })) : new Response('no', { status: 404 }))))
    const res = await searchGet(new Request('http://x/api/v1/hadith/search?q=patient&collection=bukhari'))
    const j = await res.json()
    expect(j.failed).toEqual([])
    expect(res.headers.get('cache-control')).toMatch(/s-maxage=86400/)
  })
})

describe('reference parsing is linear and input is capped', () => {
  it('lastDigitRun == the old regex on many inputs', () => {
    const old = (s: string) => { const m = s.match(/(\d{1,5})(?!.*\d)/); return m ? { digits: m[1], index: m.index! } : null }
    const samples = ['Bukhari 1', 'muslim 2564', 'x', '', '1234567', 'a 12 b 345', '12 abc', 'abc 9', 'n 123456789 z', 'bukhari:7.', '1 2 3', '00012']
    for (let i = 0; i < 300; i++) samples.push(Array.from({ length: 1 + (i % 17) }, (_, k) => '0a 9b12345678c'[(i * 7 + k * 3) % 14]).join(''))
    for (const s of samples) expect(lastDigitRun(s), JSON.stringify(s)).toEqual(old(s))
  })
  it('a 5,000-character "1 1 1 …" query completes quickly at every entry point', async () => {
    const long = '1 '.repeat(2500)
    let t = performance.now()
    for (let i = 0; i < 20; i++) parseHadithReference(long)
    expect(performance.now() - t).toBeLessThan(100)
    expect(parseHadithReference(`${'x'.repeat(5000)} bukhari 1`)).toBeNull() // only the first 200 characters are read
    expect(parseHadithReference('Sahih al-Bukhari 1')).toEqual({ collection: 'bukhari', number: 1 })

    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ metadata: { name: 'x' }, hadiths: [h(1, '1 1 text')] }))))
    t = performance.now()
    const r = await searchHadith(long, { collection: 'nawawi40' })
    expect(r.query.length).toBeLessThanOrEqual(MAX_HADITH_QUERY)
    const res = await searchGet(new Request(`http://x/api/v1/hadith/search?q=${encodeURIComponent(long)}`))
    expect(res.status).toBe(400) // the API rejects > 200 characters
    await HadithSearchPage({ locale: 'en', searchParams: Promise.resolve({ q: long, c: 'nawawi40' }) })
    expect(performance.now() - t).toBeLessThan(1000)
  })
})
