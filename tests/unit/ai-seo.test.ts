import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy } from '@/proxy'
import { parseAyahRef, resolveName, resolveTafsirEdition, resolveTopic, getTafsir } from '@/lib/api/corpus'
import { citations, ayahCitation } from '@/lib/content/cite'
import { firstSentences, tafsirSummary, topicQuickAnswer } from '@/lib/content/answers'
import { surahSameAs, surahWikidata } from '@/lib/seo/wikidata'
import wikidata from '@/lib/seo/wikidata-surahs.json'
import { ayahQuotationLd, corpusDatasetLd, nameTermLd, namesTermSetLd, organizationLd, surahChapterRef } from '@/lib/seo/structured'
import { verificationMeta } from '@/lib/seo/verification'
import { indexNowKey } from '@/lib/seo/indexnow'
import { markdownFor } from '@/lib/api/markdown'
import { GET as mdRoute } from '@/app/md/[...path]/route'
import { GET as keyRoute } from '@/app/api/indexnow/[key]/route'
import { buildMeta } from '@/lib/content/seo'
import { llmsFullTxt, llmsTxt } from '@/lib/content/llms'
import { topicBySlug } from '@/data/content/topics'
import { asmaUlHusna } from '@/data/content/asma-ul-husna'
import { chapters } from '@/lib/quran/chapters'
import { chunk, locs } from '@/scripts/indexnow.mjs'

const TAFSIR_HTML = '<h2>The Virtue of Ayat Al-Kursi</h2><p>This is Ayat Al-Kursi, and it is the greatest Ayah in the Book of Allah, as is recorded in the Sahih collection. A second sentence follows here.</p>'
const stubTafsir = () =>
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ tafsir: { text: TAFSIR_HTML, verses: { '2:255': {} } } }), { status: 200 }))
afterEach(() => vi.restoreAllMocks())

describe('reference parsing & resolvers', () => {
  it.each([
    ['2:255', { surah: 2, from: 255, to: 255 }],
    ['2:255-257', { surah: 2, from: 255, to: 257 }],
    ['2.255', { surah: 2, from: 255, to: 255 }],
    ['2/255', { surah: 2, from: 255, to: 255 }],
    ['al-baqarah 255', { surah: 2, from: 255, to: 255 }],
    ['Surah Yasin 1', { surah: 36, from: 1, to: 1 }],
    ['2:255–257', { surah: 2, from: 255, to: 257 }],
  ])('%s', (input, out) => expect(parseAyahRef(input)).toEqual(out))
  it.each(['', '2', '2:', '2:287', '115:1', '2:5-1', 'foo 1', '%E0%A4'])('rejects %j', (s) => expect(parseAyahRef(s)).toBeNull())
  it('names, topics, tafsir editions', () => {
    expect(resolveName('Al-Wadud')?.slug).toBe('al-wadud')
    expect(resolveName(asmaUlHusna[33].ar)?.n).toBe(34)
    expect(resolveName('nonsense')).toBeNull()
    expect(resolveTopic('anxiety')?.slug).toBe('anxiety')
    expect(resolveTopic('What does the Quran say about patience?')?.slug).toBe('patience')
    expect(resolveTafsirEdition(undefined)).toBe('ibn-kathir')
    expect(resolveTafsirEdition('bn')).toBe('ahsanul-bayaan')
    expect(resolveTafsirEdition('16')).toBe('muyassar')
    expect(resolveTafsirEdition('xyz')).toBeNull()
  })
})

describe('citations & answer-first snippets', () => {
  it('citation formats all contain the canonical URL', () => {
    const c = citations({ title: 'Quran 2:255', url: 'https://x.test/surah/al-baqarah/255', note: 'Saheeh International translation', accessed: new Date(Date.UTC(2026, 10, 13)) })
    for (const v of Object.values(c)) expect(v).toContain('https://x.test/surah/al-baqarah/255')
    expect(c.apa).toContain('Retrieved November 13, 2026')
    expect(c.mla).toContain('Accessed 13 Nov. 2026.')
    expect(c.markdown).toMatch(/^\[Quran 2:255\]\(https:\/\/x\.test/)
    expect(ayahCitation('2:255', 'Al-Baqarah', 'https://x/y')).toBe('Quran 2:255 (Surah Al-Baqarah), Saheeh International translation — Noor Quran, https://x/y')
  })
  it('firstSentences / tafsirSummary', () => {
    expect(firstSentences('One. Two is here. Three.', 100, 5)).toBe('One. Two is here.')
    expect(firstSentences('x'.repeat(500), 50).length).toBeLessThanOrEqual(50)
    expect(tafsirSummary(TAFSIR_HTML)).toMatch(/^This is Ayat Al-Kursi, and it is the greatest Ayah/)
    expect(tafsirSummary(TAFSIR_HTML)).not.toContain('Virtue') // headings dropped
    expect(tafsirSummary('<p>Too short.</p>')).toBe('')
    expect(tafsirSummary(null)).toBe('')
  })
  it('topic quick answer cites refs inline and quotes the corpus (en + bn)', () => {
    const t = topicBySlug('patience')!
    const verses = [{ surah: 2, n: 153, en: 'O you who have believed, seek help through patience and prayer.', bn: 'হে মুমিনগণ! ধৈর্য ও নামাযের মাধ্যমে সাহায্য প্রার্থনা কর।' }]
    const en = topicQuickAnswer('en', t, verses)
    expect(en).toMatch(/^The Quran speaks about patience.* in verses such as .+ and .+\./)
    expect(en).toContain('“O you who have believed')
    expect(en.split(/(?<=[.!?”])\s+/).length).toBeLessThanOrEqual(4)
    expect(topicQuickAnswer('bn', t, verses)).toMatch(/^কুরআন ধৈর্য/)
  })
})

describe('structured data', () => {
  it('wikidata map: 114 verified surahs, unique Q-ids, Wikipedia links', () => {
    const s = wikidata.surahs as Record<string, { wikidata: string; en?: string }>
    expect(Object.keys(s)).toHaveLength(114)
    const ids = Object.values(s).map((x) => x.wikidata)
    expect(new Set(ids).size).toBe(114)
    for (const id of ids) expect(id).toMatch(/^Q\d+$/)
    expect(surahWikidata(1)?.wikidata).toBe('Q219669') // Al-Fatiha
    expect(surahWikidata(103)?.wikidata).toBe('Q233731') // Al-Asr
    expect(surahSameAs(2)[0]).toBe('https://www.wikidata.org/wiki/Q219675')
    expect(surahSameAs(2, 'bn')[1]).toMatch(/^https:\/\/bn\.wikipedia\.org\//)
  })
  it('LD builders produce JSON-serialisable schema.org nodes', () => {
    const nodes = [
      organizationLd(),
      ayahQuotationLd({ surah: 2, ayah: 255, ar: 'ٱللَّهُ', en: 'Allah', enH: 'God', bn: 'আল্লাহ', locale: 'bn', title: 't', summary: 's' }),
      corpusDatasetLd('en'),
      namesTermSetLd('en', asmaUlHusna),
      nameTermLd('bn', asmaUlHusna[0]),
      { '@context': 'https://schema.org', ...surahChapterRef(36) },
    ]
    for (const n of nodes) {
      const back = JSON.parse(JSON.stringify(n))
      expect(back['@context']).toBe('https://schema.org')
      expect(typeof back['@type']).toBe('string')
      expect(JSON.stringify(n)).not.toContain('undefined')
    }
    const q = nodes[1] as any
    expect(q.url).toMatch(/\/bn\/surah\/al-baqarah\/255$/)
    expect(q.isPartOf['@type']).toBe('Chapter')
    expect(q.isPartOf.sameAs[0]).toMatch(/wikidata/)
    expect(q.mainEntityOfPage.speakable.cssSelector).toContain('figure[data-tr="bn"] blockquote')
    expect((organizationLd() as any).sameAs).toContain('https://github.com/maremon7415/holy_quran')
    expect((nodes[3] as any).hasDefinedTerm).toHaveLength(99)
    expect((nodes[4] as any).name).toBe('আর-রহমান')
  })
  it('buildMeta emits a text/markdown alternate', () => {
    const m = buildMeta({ title: 't', description: 'd', path: '/topics/patience', locale: 'bn', markdown: true })
    expect(m.alternates?.types).toEqual({ 'text/markdown': '/bn/topics/patience.md' })
  })
})

describe('env-driven verification & IndexNow', () => {
  it('verification meta only for set vars', () => {
    expect(verificationMeta({})).toBeUndefined()
    expect(verificationMeta({ GOOGLE_SITE_VERIFICATION: 'g', BING_SITE_VERIFICATION: 'b', YANDEX_VERIFICATION: 'y' })).toEqual({ google: 'g', yandex: 'y', other: { 'msvalidate.01': 'b' } })
  })
  it('IndexNow key validation + key route', async () => {
    expect(indexNowKey({ INDEXNOW_KEY: 'short' })).toBeNull()
    expect(indexNowKey({ INDEXNOW_KEY: 'abcdef0123456789' })).toBe('abcdef0123456789')
    const prev = process.env.INDEXNOW_KEY
    process.env.INDEXNOW_KEY = 'abcdef0123456789'
    try {
      const ok = await keyRoute(new Request('http://x/abcdef0123456789.txt'), { params: Promise.resolve({ key: 'abcdef0123456789' }) })
      expect(ok.status).toBe(200)
      expect(await ok.text()).toBe('abcdef0123456789')
      expect((await keyRoute(new Request('http://x'), { params: Promise.resolve({ key: 'wrongwrongwrong' }) })).status).toBe(404)
    } finally {
      if (prev === undefined) delete process.env.INDEXNOW_KEY
      else process.env.INDEXNOW_KEY = prev
    }
  })
  it('indexnow script helpers batch ≤ 10k and parse <loc>', () => {
    expect(chunk(Array.from({ length: 25_001 }, (_, i) => i)).map((c: number[]) => c.length)).toEqual([10_000, 10_000, 5_001])
    expect(locs('<urlset><url><loc>https://a/b?x=1&amp;y=2</loc></url><url><loc> https://a/c </loc></url></urlset>')).toEqual(['https://a/b?x=1&y=2', 'https://a/c'])
  })
})

describe('markdown alternates', () => {
  it('ayah (en + bn) has title, Arabic, translations, uccharon, tafsir excerpt, citation, canonical', async () => {
    stubTafsir()
    const en = (await markdownFor('/surah/al-baqarah/255'))!
    expect(en.canonical).toMatch(/\/surah\/al-baqarah\/255$/)
    expect(en.body).toMatch(/^# Quran 2:255 — Surah Al-Baqarah, Ayah 255/)
    expect(en.body).toMatch(/> .*[؀-ۿ]{3,}/)
    expect(en.body).toContain('Saheeh International')
    expect(en.body).toContain('Bangla uccharon')
    expect(en.body).toContain('## Tafsir excerpt')
    expect(en.body).toContain('**Cite:** Quran 2:255')
    expect(en.body).toContain(`Canonical: ${en.canonical}`)
    const bn = (await markdownFor('/bn/surah/al-baqarah/255'))!
    expect(bn.canonical).toMatch(/\/bn\/surah\/al-baqarah\/255$/)
    expect(bn.body).toMatch(/^# সূরা/)
  })
  it('surah, juz, topic, dua, name docs exist; bad paths are null', async () => {
    for (const p of ['/surah/al-mulk', '/juz/30', '/topics/patience', '/dua/dua-for-anxiety', '/names-of-allah/ar-rahman', '/bn/names-of-allah/ar-rahman', '/bn/topics/anxiety']) {
      const d = await markdownFor(p)
      expect(d, p).not.toBeNull()
      expect(d!.body.startsWith('# '), p).toBe(true)
      expect(d!.body, p).toContain('Canonical: ')
    }
    expect((await markdownFor('/surah/al-mulk'))!.body).toContain('## Key facts')
    expect((await markdownFor('/topics/patience'))!.body).toContain('## Quick answer')
    for (const p of ['/surah/nope', '/surah/al-mulk/31', '/juz/31', '/topics/pat', '/dua/x', '/names-of-allah/1', '/quran', '/surah/al-mulk/1/2']) expect(await markdownFor(p), p).toBeNull()
  })
  it('md route: text/markdown + Link canonical; 404 for unknown', async () => {
    const ok = await mdRoute(new Request('http://x'), { params: Promise.resolve({ path: ['dua', 'dua-for-anxiety'] }) })
    expect(ok.status).toBe(200)
    expect(ok.headers.get('content-type')).toContain('text/markdown')
    expect(ok.headers.get('link')).toMatch(/\/dua\/dua-for-anxiety>; rel="canonical"/)
    expect((await mdRoute(new Request('http://x'), { params: Promise.resolve({ path: ['dua', 'nope'] }) })).status).toBe(404)
  })
  it('tafsir tool: summary + citation; upstream failure is an error object', async () => {
    stubTafsir()
    const t = await getTafsir('2:255', 'ibn-kathir')
    expect(t).toMatchObject({ reference: '2:255', edition: 'ibn-kathir', language: 'en' })
    expect((t as any).citation).toMatch(/Tafsir Ibn Kathir .* Quran 2:255/)
    vi.restoreAllMocks()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }))
    expect(await getTafsir('3:7', 'muyassar')).toHaveProperty('error')
  })
})

describe('proxy: short URLs + markdown rewrite (existing /surah behaviour intact)', () => {
  const run = (p: string) => proxy(new NextRequest(new URL(p, 'https://noor.test')))
  it.each([
    ['/2:255', '/surah/al-baqarah/255'],
    ['/2/255', '/surah/al-baqarah/255'],
    ['/2.255', '/surah/al-baqarah/255'],
    ['/2%3A255', '/surah/al-baqarah/255'],
    ['/2:255-257', '/surah/al-baqarah/255'],
    ['/bn/36:1', '/bn/surah/ya-sin/1'],
    ['/surah/2', '/surah/al-baqarah'],
  ])('%s → 308 %s', (from, to) => {
    const r = run(from)
    expect(r.status).toBe(308)
    expect(new URL(r.headers.get('location')!).pathname).toBe(to)
  })
  it.each(['/2:287', '/115:1', '/0:1', '/surah/nope', '/surah/al-baqarah/287'])('%s → 404', (p) => expect(run(p).status).toBe(404))
  it('.md → rewrite to /md', () => {
    const r = run('/bn/surah/al-baqarah/255.md')
    expect(r.headers.get('x-middleware-rewrite')).toMatch(/\/md\/bn\/surah\/al-baqarah\/255$/)
    expect(run('/topics/patience.md').headers.get('x-middleware-rewrite')).toMatch(/\/md\/topics\/patience$/)
    expect(run('/surah/al-baqarah/255').headers.get('x-middleware-next')).toBe('1')
  })
})

describe('llms.txt advertises the AI surfaces', () => {
  it('mcp, api, openapi, markdown alternates, short links', async () => {
    const t = llmsTxt()
    for (const s of ['/api/mcp', '/mcp', '/developers', '/openapi.json', '/surah/al-baqarah/255.md', '/topics/patience.md', '/2:255', 'text/markdown']) expect(t, s).toContain(s)
    const full = await llmsFullTxt()
    expect(full).toContain('/juz/30.md')
    expect((full.match(/\(markdown: /g) ?? []).length).toBeGreaterThan(114 + 99)
    expect(chapters).toHaveLength(114)
  })
})
