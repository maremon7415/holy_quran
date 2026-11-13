import { test, expect } from './fixtures'

/** AI / agent surfaces: MCP, JSON API, markdown alternates, citations, short URLs, structured data. */

const ldOf = async (page: import('@playwright/test').Page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((t) => {
    const j = JSON.parse(t) // throws → invalid JSON-LD fails the test
    return Array.isArray(j) ? j : [j]
  })

test.describe('AI & developer surfaces', () => {
  test('MCP endpoint answers initialize, tools/list and tools/call over HTTP', async ({ request }) => {
    const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }
    const init = await request.post('/api/mcp', { headers, data: { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'e2e', version: '1' } } } })
    expect(init.status()).toBe(200)
    expect((await init.json()).result.serverInfo.name).toBe('noor-quran')
    const list = await request.post('/api/mcp', { headers, data: { jsonrpc: '2.0', id: 2, method: 'tools/list' } })
    expect((await list.json()).result.tools.map((t: { name: string }) => t.name)).toContain('get_ayah')
    const call = await request.post('/api/mcp', { headers, data: { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'get_ayah', arguments: { reference: '112:1' } } } })
    const data = JSON.parse((await call.json()).result.content[0].text)
    expect(data.url).toMatch(/\/surah\/al-ikhlas\/1$/)
  })

  test('JSON API: CORS, cache headers, real 404s; openapi.json', async ({ request }) => {
    const r = await request.get('/api/v1/ayah/2:255')
    expect(r.status()).toBe(200)
    expect(r.headers()['access-control-allow-origin']).toBe('*')
    expect(r.headers()['cache-control']).toMatch(/s-maxage=86400/)
    expect((await r.json()).citation).toMatch(/Quran 2:255/)
    expect((await request.get('/api/v1/ayah/2:999')).status()).toBe(404)
    expect((await request.get('/api/v1/surah/115')).status()).toBe(404)
    expect((await request.get('/api/v1/search?q=x')).status()).toBe(400)
    const spec = await request.get('/openapi.json')
    expect((await spec.json()).openapi).toBe('3.1.0')
  })

  test('markdown alternates are served and advertised', async ({ request, page }) => {
    for (const p of ['/surah/al-baqarah/255.md', '/surah/al-mulk.md', '/juz/30.md', '/topics/patience.md', '/dua/dua-for-anxiety.md', '/names-of-allah/ar-rahman.md', '/bn/surah/al-baqarah/255.md']) {
      const r = await request.get(p)
      expect(r.status(), p).toBe(200)
      expect(r.headers()['content-type'], p).toContain('text/markdown')
      expect(await r.text(), p).toMatch(/^# .+[\s\S]*Canonical: https?:\/\//)
    }
    expect((await request.get('/surah/al-baqarah/999.md')).status()).toBe(404)
    await page.goto('/topics/patience')
    await expect(page.locator('link[rel="alternate"][type="text/markdown"]')).toHaveAttribute('href', /\/topics\/patience\.md$/)
  })

  test('short URLs redirect (308) to the canonical ayah page', async ({ request }) => {
    for (const p of ['/2:255', '/2/255', '/2.255']) {
      const r = await request.get(p, { maxRedirects: 0 })
      expect(r.status(), p).toBe(308)
      expect(new URL(r.headers()['location'], 'http://x').pathname).toBe('/surah/al-baqarah/255')
    }
    expect((await request.get('/2:999', { maxRedirects: 0 })).status()).toBe(404)
  })

  test('ayah page: Cite this block, Quotation JSON-LD with isPartOf + speakable, single h1', async ({ page, problems }) => {
    await page.goto('/surah/al-ikhlas/1')
    await expect(page.locator('h1')).toHaveCount(1)
    const cite = page.locator('[data-cite]')
    await expect(cite.getByRole('heading', { name: /Cite this/ })).toBeVisible()
    await expect(cite).toContainText('/surah/al-ikhlas/1')
    await expect(cite.getByRole('button', { name: /Copy APA/ })).toBeVisible()
    const ld = await ldOf(page)
    const q = ld.find((n) => n['@type'] === 'Quotation')
    expect(q.isPartOf['@type']).toBe('Chapter')
    expect(q.isPartOf.sameAs.some((s: string) => s.includes('wikidata.org'))).toBe(true)
    expect(q.mainEntityOfPage.speakable.cssSelector.length).toBeGreaterThan(1)
    expect(ld.some((n) => n['@type'] === 'BreadcrumbList')).toBe(true)
    expect(ld.some((n) => n['@type'] === 'Organization' && n.sameAs?.length)).toBe(true)
    expect(problems.list).toEqual([])
  })

  test('topic quick answer, surah key facts, names DefinedTerm, /bn variants', async ({ page }) => {
    await page.goto('/topics/patience')
    await expect(page.locator('#quick-answer')).toContainText(/The Quran speaks about patience/)
    await page.goto('/surah/al-mulk')
    const facts = page.getByRole('region', { name: 'Key facts' })
    await expect(facts.locator('dt')).toHaveCount(7)
    await expect(facts).toContainText('30')
    expect((await ldOf(page)).find((n) => n['@type'] === 'Chapter').sameAs[0]).toMatch(/wikidata/)
    await page.goto('/bn/names-of-allah/ar-rahman')
    const term = (await ldOf(page)).find((n) => n['@type'] === 'DefinedTerm')
    expect(term.inLanguage).toBe('bn')
    await page.goto('/bn/topics/patience')
    await expect(page.locator('#quick-answer')).toContainText(/কুরআন/)
  })

  test('/mcp and /developers pages (en + bn)', async ({ page }) => {
    for (const p of ['/mcp', '/developers', '/bn/mcp', '/bn/developers']) {
      const res = await page.goto(p)
      expect(res?.status(), p).toBe(200)
      await expect(page.locator('h1'), p).toHaveCount(1)
      await expect(page.locator('link[rel="alternate"][hreflang="bn"]'), p).toHaveCount(1)
    }
    await page.goto('/mcp')
    await expect(page.getByText(/\/api\/mcp/).first()).toBeVisible()
    await page.goto('/developers')
    expect((await ldOf(page)).some((n) => n['@type'] === 'Dataset')).toBe(true)
  })

  test('llms.txt lists the MCP server and markdown versions', async ({ request }) => {
    const t = await (await request.get('/llms.txt')).text()
    expect(t).toContain('/api/mcp')
    expect(t).toContain('.md')
  })
})
