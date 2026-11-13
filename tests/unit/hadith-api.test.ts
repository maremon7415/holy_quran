import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { allIndexes, bookNumbers, collectionIndex, corpusNumbers, isServable, neighbours } from '@/lib/hadith/data'
import { featured } from '@/lib/hadith/featured'
import { getBook, getCollections, getHadith } from '@/lib/hadith/hadith'
import { HadithFetchError } from '@/lib/hadith/fetch'
import { _resetSearchCache, searchHadith } from '@/lib/hadith/search'
import { hadithSitemapChunk, hadithSitemapUrls, HADITH_SITEMAP_CHUNK, HADITH_SITEMAP_FILES } from '@/lib/hadith/sitemap'
import { duaSlugsForHadith } from '@/lib/hadith/dua-sources'

describe('data/hadith/index.json', () => {
  it('stays small (compact metadata only, no hadith texts)', () => {
    const size = fs.statSync(path.join(__dirname, '../../data/hadith/index.json')).size
    expect(size).toBeLessThan(2 * 1024 * 1024)
  })
  it('has the nine collections with the expected totals', () => {
    const c = Object.fromEntries(getCollections().map((x) => [x.slug, x]))
    expect(Object.keys(c).sort()).toEqual(['abudawud', 'bukhari', 'ibnmajah', 'malik', 'muslim', 'nasai', 'nawawi40', 'qudsi40', 'tirmidhi'])
    expect(c.bukhari).toMatchObject({ first: 1, last: 7563 })
    expect(c.muslim).toMatchObject({ first: 8, last: 3033 })
    expect(c.abudawud.last).toBe(5274)
    expect(c.tirmidhi.last).toBe(3956)
    expect(c.nasai.last).toBe(5758)
    expect(c.ibnmajah.last).toBe(4341)
    expect(c.malik.last).toBe(1858)
    expect(c.nawawi40.last).toBe(42)
    expect(c.qudsi40.last).toBe(40)
    expect(c.bukhari.langs).toEqual({ ar: true, en: true, bn: true })
    expect(c.malik.langs.bn).toBe(false)
  })
  it('Muslim numbers are Abd al-Baqi numbers: 2564 is the Allah-looks-at-hearts hadith made of 3 narrations', () => {
    expect(corpusNumbers('muslim', 2564)).toEqual([6541, 6542, 6543])
    expect(corpusNumbers('muslim', 8)).toHaveLength(5) // "8a…8e", the hadith of Jibril
    expect(corpusNumbers('bukhari', 1)).toEqual([1])
  })
  it('serves only numbers inside the ranges, skips gaps and blank entries', () => {
    expect(isServable('bukhari', 1)).toBe(true)
    expect(isServable('bukhari', 7563)).toBe(true)
    expect(isServable('bukhari', 0)).toBe(false)
    expect(isServable('bukhari', 7564)).toBe(false)
    expect(isServable('bukhari', 1.5)).toBe(false)
    expect(isServable('bukhari', 5710)).toBe(false) // blank in every language of the corpus
    expect(isServable('muslim', 7)).toBe(false) // introduction, below the Abd al-Baqi range
    expect(isServable('muslim', 8)).toBe(true)
    expect(isServable('muslim', 2564)).toBe(true)
    expect(isServable('muslim', 3033)).toBe(true)
    expect(isServable('muslim', 3034)).toBe(false)
    const gap = Array.from({ length: 3033 }, (_, i) => i + 8).find((n) => !isServable('muslim', n))!
    expect(isServable('muslim', gap)).toBe(false)
    expect(isServable('nawawi40', 42)).toBe(true)
    expect(isServable('nawawi40', 43)).toBe(false)
  })
  it('every dead number is not servable and every other number in range is (non-sparse collections)', () => {
    for (const { slug, index } of allIndexes()) {
      if (index.map) { for (const n of Object.keys(index.map).map(Number)) expect(isServable(slug, n) === !index.dead.includes(n)).toBe(true); continue }
      expect(index.count).toBe(index.last - index.first + 1)
      for (const n of index.dead) expect(isServable(slug, n)).toBe(false)
      expect(isServable(slug, index.first)).toBe(!index.dead.includes(index.first))
    }
  })
  it('prev / next skip gaps', () => {
    expect(neighbours('bukhari', 1)).toEqual({ prev: null, next: 2 })
    expect(neighbours('bukhari', 5709)).toEqual({ prev: 5708, next: 5712 })
    expect(neighbours('bukhari', 7563)).toEqual({ prev: 7562, next: null })
    expect(neighbours('muslim', 8)).toEqual({ prev: null, next: 9 })
    expect(neighbours('muslim', 3033).next).toBeNull()
    const gap = Array.from({ length: 3033 }, (_, i) => i + 8).find((n) => !isServable('muslim', n))!
    expect(neighbours('muslim', gap - 1).next).toBe(gap + 1)
    expect(neighbours('muslim', gap + 1).prev).toBe(gap - 1)
  })
  it('books partition each collection and have English names', () => {
    for (const { slug, index } of allIndexes()) {
      expect(index.books.length).toBeGreaterThan(0)
      for (const b of index.books) { expect(b[1].length).toBeGreaterThan(2); expect(b[2]).toBeLessThanOrEqual(b[3]); expect(b[4]).toBeGreaterThan(0) }
      if (slug !== 'muslim') expect(index.books.reduce((a, b) => a + b[4], 0)).toBe(index.count)
    }
    expect(bookNumbers('bukhari', 1)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(bookNumbers('muslim', 1)).toBeNull() // sparse: derived from the section data
  })
  it('every curated hadith is servable', () => {
    for (const f of featured) expect(isServable(f.c as never, f.n), `${f.c} ${f.n}`).toBe(true)
  })
  it('summarises grades per collection (Al-Albani) for the sunan', () => {
    const g = collectionIndex('abudawud').grades!
    expect(g.by).toBe('Al-Albani')
    expect(g.sahih + g.hasan + g.daif + g.other + g.ungraded).toBe(5274)
    expect(collectionIndex('bukhari').grades).toBeUndefined()
  })
})

describe('sitemap URLs', () => {
  it('contains only servable hadiths, no duplicates, and chunks under the sitemap limit', () => {
    const urls = hadithSitemapUrls()
    expect(new Set(urls.map((u) => u.path)).size).toBe(urls.length)
    const hadiths = urls.filter((u) => /^\/hadith\/[a-z0-9]+\/\d+$/.test(u.path))
    for (const u of hadiths) { const [, , c, n] = u.path.split('/'); expect(isServable(c as never, Number(n)), u.path).toBe(true) }
    const total = getCollections().reduce((a, c) => a + c.count, 0)
    expect(hadiths.length).toBeLessThanOrEqual(total)
    expect(hadiths.length).toBeGreaterThan(30000)
    expect(urls[0].path).toBe('/hadith')
    for (let i = 0; i < HADITH_SITEMAP_FILES(); i++) expect(hadithSitemapChunk(i).length).toBeLessThanOrEqual(HADITH_SITEMAP_CHUNK)
    expect(hadithSitemapChunk(HADITH_SITEMAP_FILES())).toEqual([])
  })
})

describe('dua sources → hadith pages', () => {
  it('finds the duas that cite a hadith', () => {
    expect(duaSlugsForHadith('bukhari', 6306).length).toBeGreaterThan(0)
    expect(duaSlugsForHadith('bukhari', 7563)).toEqual([])
  })
})

/* ───────────── mocked network ───────────── */
const B = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1'
const h = (n: number, text: string, extra: Record<string, unknown> = {}) => ({ hadithnumber: n, arabicnumber: n, text, grades: [], reference: { book: 1, hadith: n }, ...extra })
type Route = (url: string) => unknown | Response | undefined
function mockFetch(route: Route) {
  const calls: string[] = []
  const fn = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    calls.push(url)
    const r = route(url)
    if (r instanceof Response) return r
    if (r === undefined) return new Response('nope', { status: 404 })
    return new Response(JSON.stringify(r), { status: 200, headers: { 'content-type': 'application/json' } })
  })
  vi.stubGlobal('fetch', fn)
  return calls
}
afterEach(() => { vi.unstubAllGlobals(); _resetSearchCache() })

const fixtures: Record<string, ReturnType<typeof h>[]> = {
  'ara-bukhari/1': [h(1, 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ')],
  'eng-bukhari/1': [h(1, "Narrated 'Umar bin Al-Khattab: I heard Allah's Messenger (ﷺ) saying, \"The reward of deeds depends upon the intentions and every person will get what he intended.")],
  'ben-bukhari/1': [h(1, 'উমর ইবনুল খাত্তাব (রাঃ) থেকে বর্ণিত। নিয়তের উপরই কাজের ফলাফল নির্ভরশীল।')],
}
const section = (hadiths: unknown[]) => ({ metadata: { name: 'x' }, hadiths })

describe('getHadith (mocked network)', () => {
  beforeEach(() => vi.useRealTimers())

  it('loads Arabic, English and Bangla for Sahih al-Bukhari 1 and derives narrator, title, neighbours, book', async () => {
    const calls = mockFetch((u) => { const m = u.match(/editions\/(.*)\.min\.json$/); return m && fixtures[m[1]] ? section(fixtures[m[1]]) : undefined })
    const r = await getHadith('bukhari', 1)
    expect(r).not.toBeNull()
    expect(r!.url).toBe('/hadith/bukhari/1')
    expect(r!.book).toEqual({ n: 1, name: 'Revelation' })
    expect(r!.prev).toBeNull(); expect(r!.next).toBe(2)
    expect(r!.title).toBe('Actions are judged by intentions') // curated
    expect(r!.entries).toHaveLength(1)
    expect(r!.entries[0]).toMatchObject({ sub: '', narrator: "'Umar bin Al-Khattab", ref: { book: 1, hadith: 1 } })
    expect(r!.entries[0].ar).toContain('النِّيَّاتِ')
    expect(r!.entries[0].bn).toContain('নিয়ত')
    expect(r!.failed).toEqual([])
    expect(calls.sort()).toEqual(['ara-bukhari', 'ben-bukhari', 'eng-bukhari'].map((e) => `${B}/editions/${e}/1.min.json`).sort())
  })

  it('does not hit the network for numbers outside the index ranges (→ null)', async () => {
    const calls = mockFetch(() => undefined)
    expect(await getHadith('bukhari', 0)).toBeNull()
    expect(await getHadith('bukhari', 7564)).toBeNull()
    expect(await getHadith('muslim', 7)).toBeNull()
    expect(await getHadith('nope', 1)).toBeNull()
    expect(await getHadith('bukhari', NaN)).toBeNull()
    expect(calls).toHaveLength(0)
  })

  it('Muslim 2564: fetches by corpus number (6541–6543) and returns a/b/c narrations under the Abd al-Baqi number', async () => {
    const calls = mockFetch((u) => {
      const m = u.match(/editions\/(ara|eng|ben)-muslim\/(\d+)\.min\.json$/)
      if (!m) return undefined
      const id = Number(m[2]); const i = id - 6540
      return section([{ hadithnumber: id, arabicnumber: `2564.0${i}`, text: `${m[1]} text ${i}`, grades: [], reference: { book: 45, hadith: 39 + i } }])
    })
    const r = (await getHadith('muslim', 2564))!
    expect(r.entries.map((e) => e.sub)).toEqual(['a', 'b', 'c'])
    expect(r.entries.map((e) => e.en)).toEqual(['eng text 1', 'eng text 2', 'eng text 3'])
    expect(r.book?.n).toBe(45)
    expect(calls.filter((c) => c.includes('eng-muslim'))).toHaveLength(3)
    expect(calls.some((c) => /muslim\/2564\./.test(c))).toBe(false)
  })

  it('groups decimal sub-numbers (Bukhari 402 and 402.2) under one page', async () => {
    mockFetch((u) => (/editions\/(ara|eng|ben)-bukhari\/402\.min\.json$/.test(u) ? section([h(402, 'first', { reference: { book: 8, hadith: 53 } }), h(402.2, 'second', { arabicnumber: 402.2, reference: { book: 8, hadith: 54 } }), h(403, 'other')]) : undefined))
    const r = (await getHadith('bukhari', 402))!
    expect(r.entries.map((e) => [e.sub, e.en])).toEqual([['a', 'first'], ['b', 'second']])
  })

  it('normalises grades and leaves Bukhari ungraded', async () => {
    mockFetch((u) => (/abudawud\/6\.min\.json$/.test(u) ? section([h(6, 'Narrated Zayd ibn Arqam: These privies', { grades: [{ name: 'Al-Albani', grade: 'Sahih' }, { name: 'Zubair Ali Zai', grade: 'Isnaad Hasan' }] })]) : undefined))
    const r = (await getHadith('abudawud', 6))!
    expect(r.entries[0].grades.map((g) => g.category)).toEqual(['sahih', 'hasan'])
  })

  it('falls back from .min.json to .json', async () => {
    const calls = mockFetch((u) => (u.endsWith('/editions/eng-nawawi/1.json') ? section([h(1, 'Actions are judged by intentions')]) : u.includes('/editions/') && u.endsWith('.json') && !u.endsWith('.min.json') ? section([]) : undefined))
    const r = await getHadith('nawawi40', 1, ['en'])
    expect(r?.entries[0].en).toBe('Actions are judged by intentions')
    expect(calls[0]).toMatch(/1\.min\.json$/)
    expect(calls[1]).toMatch(/1\.json$/)
  })

  it('skips languages a collection does not have (no Bangla Muwatta)', async () => {
    const calls = mockFetch((u) => (/(ara|eng)-malik\/1\.min\.json$/.test(u) ? section([h(1, 'text')]) : undefined))
    const r = await getHadith('malik', 1)
    expect(r?.failed).toEqual([])
    expect(calls.some((c) => c.includes('ben-malik'))).toBe(false)
  })

  it('reports partial failures but still returns what loaded', async () => {
    mockFetch((u) => (u.includes('ara-bukhari/1.') ? section(fixtures['ara-bukhari/1']) : undefined))
    const r = (await getHadith('bukhari', 1))!
    expect(r.failed.sort()).toEqual(['bn', 'en'])
    expect(r.entries[0].ar).toBeTruthy()
    expect(r.entries[0].en).toBeUndefined()
  })

  it('throws HadithFetchError (not a crash) when the corpus is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down') }))
    await expect(getHadith('bukhari', 2)).rejects.toBeInstanceOf(HadithFetchError)
  })

  it('treats malformed JSON as a failed fetch', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>oops', { status: 200 })))
    await expect(getHadith('bukhari', 3)).rejects.toBeInstanceOf(HadithFetchError)
  })

  it('sends next.revalidate = 30 days to the data cache', async () => {
    mockFetch(() => section(fixtures['ara-bukhari/1']))
    await getHadith('bukhari', 5, ['ar'])
    const init = (vi.mocked(fetch).mock.calls[0] as unknown as [unknown, RequestInit & { next?: { revalidate: number } }])[1]
    expect(init.next?.revalidate).toBe(2592000)
  })
})

describe('getBook (mocked network)', () => {
  it('returns the hadiths of a book, paginated, grouped by number', async () => {
    const hs = Array.from({ length: 7 }, (_, i) => h(i + 1, `text ${i + 1}`))
    const calls = mockFetch((u) => (/editions\/(ara|eng|ben)-bukhari\/sections\/1\.min\.json$/.test(u) ? section(hs) : undefined))
    const b = (await getBook('bukhari', 1))!
    expect(b.book).toMatchObject({ n: 1, name: 'Revelation', first: 1, last: 7 })
    expect(b.items.map((i) => i.number)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(b.pages).toBe(1)
    expect(calls).toHaveLength(3)
    expect(await getBook('bukhari', 1, 2)).toBeNull() // page out of range
    expect(await getBook('bukhari', 999)).toBeNull()
    expect(await getBook('bukhari', 1, 0)).toBeNull()
  })
  it('paginates a large book at 25 per page', async () => {
    const hs = Array.from({ length: 51 }, (_, i) => h(8 + i, `text ${8 + i}`, { reference: { book: 2, hadith: i + 1 } }))
    mockFetch((u) => (/bukhari\/sections\/2\.min\.json$/.test(u) ? section(hs) : undefined))
    const p1 = (await getBook('bukhari', 2, 1))!
    const p3 = (await getBook('bukhari', 2, 3))!
    expect(p1.items).toHaveLength(25)
    expect(p3.items.map((i) => i.number)).toEqual([58])
    expect(p1.pages).toBe(3)
  })
  it('throws HadithFetchError when the section cannot be fetched', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('x', { status: 503 })))
    await expect(getBook('bukhari', 1)).rejects.toBeInstanceOf(HadithFetchError)
  })
})

describe('searchHadith (mocked network)', () => {
  const ed = {
    'eng-bukhari': [
      h(1, 'Narrated Umar: The reward of deeds depends upon the intentions.'),
      h(2, 'Narrated Aisha: The Prophet said, Be patient, for patience is a light in hardship.'),
      h(3, 'Narrated Anas: The Prophet loved patience when the calamity first strikes. Patient people, patient hearts, patience.'),
      h(5710, 'blank entry should never be returned: patience'),
      h(4, 'Narrated Abu Huraira: Mercy of Allah.'),
    ],
    'ara-bukhari': [h(1, 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ'), h(2, 'إِنَّ الصَّبْرَ عِنْدَ الصَّدْمَةِ الأُولَى'), h(3, 'ضِيَاءٌ'), h(4, '')],
    'ben-bukhari': [h(1, 'নিয়তের উপরই কাজের ফলাফল নির্ভরশীল।'), h(2, 'ধৈর্য হলো আলো। আর হাদীসটি সহীহ।'), h(4, 'আল্লাহর দয়া।')],
  } as Record<string, ReturnType<typeof h>[]>
  const net = () => mockFetch((u) => { const m = u.match(/editions\/([a-z-]+)\.min\.json$/); return m ? (ed[m[1]] ? { hadiths: ed[m[1]] } : undefined) : undefined })

  it('English: all words must match, ranked by relevance, blank/unservable entries excluded', async () => {
    net()
    const r = await searchHadith('hadith about patience', { collection: 'bukhari' })
    expect(r.lang).toBe('en')
    expect(r.terms).toEqual(['patience'])
    expect(r.results.map((x) => x.number)).toEqual([3, 2]) // 3 mentions it more; 5710 is not servable
    expect(r.total).toBe(2)
    expect(r.results[0]).toMatchObject({ collection: 'bukhari', url: '/hadith/bukhari/3' })
    expect(r.results[0].snippet).toMatch(/patience/i)
    const two = await searchHadith('patient hardship', { collection: 'bukhari' })
    expect(two.results.map((x) => x.number)).toEqual([2])
  })

  it('paginates with limit / offset', async () => {
    net()
    const p1 = await searchHadith('patience', { collection: 'bukhari', limit: 1, offset: 0 })
    const p2 = await searchHadith('patience', { collection: 'bukhari', limit: 1, offset: 1 })
    expect(p1.total).toBe(2)
    expect([p1.results[0].number, p2.results[0].number]).toEqual([3, 2])
  })

  it('Arabic: normalises diacritics and letter variants on both query and text', async () => {
    net()
    const r = await searchHadith('الصَّبْر', { collection: 'bukhari' })
    expect(r.lang).toBe('ar')
    expect(r.results.map((x) => x.number)).toEqual([2])
    const r2 = await searchHadith('انما الاعمال بالنيات', { collection: 'bukhari' })
    expect(r2.results.map((x) => x.number)).toEqual([1])
    expect(r2.results[0].snippet).not.toMatch(/[ً-ْ]/) // returned without diacritics
  })

  it('Bangla: tolerates হাদিস/হাদীস spelling', async () => {
    net()
    const r = await searchHadith('হাদিস সহীহ', { collection: 'bukhari' })
    expect(r.lang).toBe('bn')
    expect(r.results.map((x) => x.number)).toEqual([2])
    const r2 = await searchHadith('ধৈর্য', { collection: 'bukhari' })
    expect(r2.results.map((x) => x.number)).toEqual([2])
  })

  it('recognises direct references and returns them as `exact` (even with no text hits)', async () => {
    net()
    const r = await searchHadith('Sahih Bukhari hadith 1', { collection: 'bukhari' })
    expect(r.exact).toEqual({ collection: 'bukhari', number: 1, url: '/hadith/bukhari/1' })
    const calls0 = vi.mocked(fetch).mock.calls.length
    const bn = await searchHadith('মুসলিম শরীফ ২৫৬৪', { collection: 'bukhari' })
    expect(vi.mocked(fetch).mock.calls.length).toBe(calls0 + 0 + (calls0 === 0 ? 0 : 0))
    expect(bn.exact).toEqual({ collection: 'muslim', number: 2564, url: '/hadith/muslim/2564' })
    expect((await searchHadith('bukhari 99999')).exact).toBeNull()
    expect(r.results).toEqual([]) // a pure reference jumps instead of text-searching every collection
  })

  it('searches only collections that have the language and reports failed ones instead of throwing', async () => {
    const calls = mockFetch((u) => (u.includes('eng-bukhari') ? { hadiths: ed['eng-bukhari'] } : undefined))
    const r = await searchHadith('patience', { lang: 'bn', collection: 'malik' })
    expect(r.collections).toEqual([]) // Bangla not available for Muwatta
    const all = await searchHadith('patience')
    expect(all.collections).toHaveLength(9)
    expect(all.failed).toHaveLength(8) // everything but Bukhari failed to download
    expect(all.results.map((x) => x.number)).toEqual([3, 2])
    expect(calls.length).toBeGreaterThan(0)
  })

  it('caches downloaded editions in memory (second search makes no requests)', async () => {
    const calls = net()
    await searchHadith('patience', { collection: 'bukhari' })
    const n = calls.length
    await searchHadith('mercy', { collection: 'bukhari' })
    expect(calls.length).toBe(n)
  })

  it('ignores too-short / empty queries', async () => {
    const calls = net()
    expect((await searchHadith('', {})).results).toEqual([])
    expect((await searchHadith(' a ', {})).results).toEqual([])
    expect(calls).toHaveLength(0)
  })

  it('treats regex metacharacters in the query literally', async () => {
    net()
    const r = await searchHadith('(patience', { collection: 'bukhari' })
    expect(r.results.map((x) => x.number)).toEqual([3, 2])
    await expect(searchHadith('.*+?^${}()|[]\\', { collection: 'bukhari' })).resolves.toBeDefined()
  })
})
