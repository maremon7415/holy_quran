import { test, expect } from './fixtures'

const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)

test.describe('sitemaps', () => {
  test('/sitemap.xml is an index of 6 sitemaps that all resolve', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('xml')
    const xml = await res.text()
    expect(xml).toContain('<sitemapindex')
    expect(locs(xml)).toEqual([0, 1, 2, 3, 4, 5].map((i) => `/sitemap/${i}.xml`))
    expect((xml.match(/<sitemap>/g) ?? []).length).toBe(6)
    for (const p of locs(xml)) expect((await request.get(p)).status(), p).toBe(200)
  })

  test('/sitemap/3.xml lists the /bn pages with xhtml:link hreflang alternates', async ({ request }) => {
    const xml = await (await request.get('/sitemap/3.xml')).text()
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    const urls = locs(xml).filter((p) => !p.includes('xhtml'))
    for (const p of ['/bn', '/bn/quran', '/bn/topics', '/bn/dua', '/bn/names-of-allah', '/bn/surah/al-baqarah', '/bn/juz/30', '/bn/topics/patience', '/bn/dua/ayatul-kursi', '/bn/names-of-allah/ar-rahman']) {
      expect(urls, p).toContain(p)
    }
    expect(urls.every((p) => p === '/bn' || p.startsWith('/bn/'))).toBe(true)
    expect(new Set(urls).size).toBe(urls.length)

    // every entry carries the en / bn / x-default triplet pointing at the pair
    const entry = xml.split('<url>').find((u) => u.includes('/bn/surah/al-baqarah</loc>'))!
    const links = [...entry.matchAll(/<xhtml:link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)].map((m) => [m[1], new URL(m[2]).pathname])
    expect(Object.fromEntries(links)).toEqual({ en: '/surah/al-baqarah', bn: '/bn/surah/al-baqarah', 'x-default': '/surah/al-baqarah' })
    const all = xml.split('<url>').slice(1)
    expect(all.every((u) => (u.match(/<xhtml:link/g) ?? []).length === 3)).toBe(true)
  })

  test('the English sitemap links its Bangla twins and /sitemap/4.xml covers /bn ayah pages', async ({ request }) => {
    const en = await (await request.get('/sitemap/0.xml')).text()
    const entry = en.split('<url>').find((u) => u.includes('/surah/al-baqarah</loc>'))!
    expect(entry).toMatch(/hreflang="bn"\s+href="[^"]*\/bn\/surah\/al-baqarah"/)
    const ayahs = (await (await request.get('/sitemap/4.xml')).text()).match(/<loc>[^<]*\/bn\/surah\/[a-z-]+\/\d+<\/loc>/g) ?? []
    expect(ayahs.length).toBeGreaterThan(1000)
  })
})
