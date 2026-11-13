import { test, expect } from './fixtures'

/**
 * Every advertised markdown alternate (`<link rel="alternate" type="text/markdown">`) must be served: hadith pages
 * advertised `/hadith/bukhari/1.md` while proxy.ts had no matcher for it (404). Also: malformed percent-encoding is a
 * 404 (it was a 500), and /api/mcp refuses large JSON-RPC batches (a 100-call batch used to return 43 MB).
 */

const SAMPLE = [
  '/surah/al-baqarah/255', '/surah/al-mulk', '/juz/30', '/topics/patience', '/dua/dua-for-anxiety', '/names-of-allah/ar-rahman',
  '/hadith/bukhari/1', '/hadith/muslim/2564', '/learn/salah', '/learn/tajweed/ikhfa', '/events', '/events/eid-al-adha',
  '/bn/surah/al-fatihah/1', '/bn/topics/patience', '/bn/hadith/bukhari/1', '/bn/learn',
]

/** hrefs of `<link … rel="alternate" … type="text/markdown" …>` in the server HTML (attribute order independent). */
const mdAlternates = (html: string) =>
  [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).filter((t) => /rel="alternate"/.test(t) && /type="text\/markdown"/.test(t)).map((t) => t.match(/href="([^"]+)"/)?.[1]).filter((h): h is string => !!h)

test.describe('markdown alternates', () => {
  test('every rel=alternate text/markdown link on a sample of pages returns 200 text/markdown', async ({ request }) => {
    test.setTimeout(120_000)
    for (const p of SAMPLE) {
      const page = await request.get(p)
      expect(page.status(), p).toBe(200)
      const hrefs = mdAlternates(await page.text())
      expect(hrefs.length, `${p} advertises a markdown alternate`).toBeGreaterThan(0)
      for (const href of hrefs) {
        const path = new URL(href, 'http://x').pathname
        expect(path, p).toMatch(/\.md$/)
        const md = await request.get(path)
        expect(md.status(), `${p} → ${path}`).toBe(200)
        expect(md.headers()['content-type'], path).toContain('text/markdown')
        expect(await md.text(), path).toMatch(/^# /)
      }
    }
  })
})

test.describe('API hardening', () => {
  test('malformed percent-encoding is a 404, not a 500', async ({ request }) => {
    for (const p of ['/topics/%E0%A4.md', '/md/topics/%E0%A4', '/api/v1/ayah/%E0%A4', '/api/v1/events/%E0%A4', '/api/v1/names/%E0%A4', '/api/v1/hadith/bukhari/%E0%A4', '/hadith/%E0%A4/1.md', '/topics/%E0%A4', '/hadith/bukhari/%E0%A4', '/bn/dua/%E0%A4', '/surah/%E0%A4']) {
      expect((await request.get(p)).status(), p).toBe(404)
    }
    expect((await request.get('/api/v1/ayah/2%3A255')).status()).toBe(200)
  })

  test('/api/mcp rejects JSON-RPC batches over 5 messages and truncates huge documents', async ({ request }) => {
    const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }
    const call = (id: number) => ({ jsonrpc: '2.0', id, method: 'tools/call', params: { name: 'fetch', arguments: { id: '/surah/al-baqarah' } } })
    const big = await request.post('/api/mcp', { headers, data: Array.from({ length: 100 }, (_, i) => call(i + 1)) })
    expect(big.status()).toBe(400)
    expect((await big.json()).error.code).toBe(-32600)
    const one = await request.post('/api/mcp', { headers, data: call(1) })
    expect(one.status()).toBe(200)
    const body = await one.body()
    expect(body.length).toBeLessThan(120_000)
    expect(JSON.parse(JSON.parse(body.toString()).result.content[0].text).metadata.truncated).toBe(true)
  })
})
