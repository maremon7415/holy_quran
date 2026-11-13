import { test, expect } from '@playwright/test'

test.describe('crawler files', () => {
  test('robots.txt allows crawling, blocks /api/, lists sitemaps that resolve', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('text/plain')
    const body = await res.text()
    expect(body).toMatch(/User-Agent: \*\s+Allow: \//i)
    expect(body).toContain('Disallow: /api/')
    expect(body).toMatch(/User-Agent: GPTBot/i)
    expect(body).toMatch(/User-Agent: ClaudeBot/i)
    const maps = [...body.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1])
    expect(maps.length).toBeGreaterThanOrEqual(2)
    for (const m of maps) {
      const r = await request.get(new URL(m).pathname)
      expect(r.status(), m).toBe(200)
      expect(r.headers()['content-type']).toContain('xml')
    }
  })

  test('sitemap/0.xml lists core pages, 114 surahs, 30 juz', async ({ request }) => {
    const xml = await (await request.get('/sitemap/0.xml')).text()
    expect(xml).toContain('<urlset')
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
    expect(new Set(locs).size).toBe(locs.length) // no duplicates
    for (const p of ['/', '/quran', '/topics', '/dua', '/names-of-allah', '/surah/al-baqarah', '/juz/30']) expect(locs).toContain(p)
    expect(locs.filter((p) => /^\/surah\/[a-z-]+$/.test(p))).toHaveLength(114)
    expect(locs.filter((p) => /^\/juz\/\d+$/.test(p))).toHaveLength(30)
    expect(locs.filter((p) => p.startsWith('/names-of-allah/'))).toHaveLength(99)
    expect(locs.some((p) => p.startsWith('/search') || p.startsWith('/api'))).toBe(false)
  })

  test('ayah sitemaps together cover all 6,236 ayahs', async ({ request }) => {
    let n = 0
    for (const id of [1, 2]) {
      const r = await request.get(`/sitemap/${id}.xml`)
      expect(r.status()).toBe(200)
      n += [...(await r.text()).matchAll(/<loc>[^<]*\/surah\/[a-z-]+\/\d+<\/loc>/g)].length
    }
    expect(n).toBe(6236)
  })

  test('sitemap URLs resolve (sample)', async ({ request }) => {
    const xml = await (await request.get('/sitemap/0.xml')).text()
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
    const sample = paths.filter((_, i) => i % 23 === 0)
    for (const p of sample) expect((await request.get(p)).status(), p).toBe(200)
  })

  test('llms.txt and llms-full.txt', async ({ request }) => {
    const a = await request.get('/llms.txt')
    expect(a.status()).toBe(200)
    expect(a.headers()['content-type']).toContain('text/plain')
    const t = await a.text()
    expect(t).toMatch(/^# Noor Quran/)
    expect(t).toMatch(/\/surah\//)
    const b = await request.get('/llms-full.txt')
    expect(b.status()).toBe(200)
    const full = await b.text()
    expect(full.length).toBeGreaterThan(t.length)
    expect(full).toMatch(/Base URL: https?:\/\//)
  })

  test('/api/search responds with JSON and CDN cache headers', async ({ request }) => {
    const r = await request.get('/api/search?q=mercy&limit=3')
    expect(r.status()).toBe(200)
    expect((await r.json()).hits).toHaveLength(3)
    expect(r.headers()['cache-control']).toMatch(/s-maxage/)
  })
  test('unknown path → 404 page (not a soft 404)', async ({ page }) => {
    const res = await page.goto('/definitely/not/a/page')
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/lost its direction/i)
  })
})
