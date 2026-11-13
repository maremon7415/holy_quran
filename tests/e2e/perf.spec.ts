import { test, expect } from './fixtures'

/**
 * Generous performance budgets — they exist to catch order-of-magnitude regressions (e.g. someone inlining the whole
 * Quran into the home page or shipping a 3 MB client bundle), not to chase milliseconds. Meaningful against the
 * production build (CI); the dev server is slower, so the time budgets are relaxed when BASE is not production.
 */
const SLOW = process.env.E2E_BASE_URL?.includes('3100') ? 3 : 1 // 3100 = dev server

const PAGES: { path: string; htmlKB: number; lcpMs: number }[] = [
  { path: '/', htmlKB: 150, lcpMs: 4000 },
  { path: '/quran', htmlKB: 200, lcpMs: 4000 },
  { path: '/surah/al-baqarah', htmlKB: 800, lcpMs: 6000 }, // 286 ayahs of Arabic + 3 translations, server rendered
]

for (const { path, htmlKB, lcpMs } of PAGES) {
  test(`perf budget: ${path}`, async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as any).__lcp = 0
      new PerformanceObserver((list) => {
        const e = list.getEntries().at(-1) as PerformanceEntry | undefined
        if (e) (window as any).__lcp = e.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    })
    const res = await page.goto(path, { waitUntil: 'load' })
    expect(res?.status()).toBe(200)

    // transferred HTML (compressed when the server compresses) and raw document size
    const sizes = await res!.request().sizes()
    const rawKB = (await res!.body()).length / 1024
    expect(sizes.responseBodySize / 1024, `${path} transferred HTML`).toBeLessThan(htmlKB)
    expect(rawKB, `${path} raw HTML`).toBeLessThan(htmlKB * 6)

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(300)
    const lcp = await page.evaluate(() => (window as any).__lcp as number)
    expect(lcp, `${path} LCP element should be reported`).toBeGreaterThan(0)
    expect(lcp, `${path} LCP ${Math.round(lcp)}ms`).toBeLessThan(lcpMs * SLOW)

    // client JavaScript budget (all same-origin scripts transferred for this page)
    const js = await page.evaluate(() =>
      performance.getEntriesByType('resource').filter((r) => (r as PerformanceResourceTiming).initiatorType === 'script' || r.name.endsWith('.js')).reduce((a, r) => a + ((r as PerformanceResourceTiming).encodedBodySize || 0), 0)
    )
    if (SLOW === 1) expect(js / 1024, `${path} JS transferred`).toBeLessThan(1800)
  })
}

test('perf: static assets are cacheable', async ({ request }) => {
  const r = await request.get('/icons/ui/search.png')
  expect(r.status()).toBe(200)
  expect(r.headers()['cache-control']).toMatch(/max-age=31536000/)
})

test('perf: layout shift on the home page stays small', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as any).__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  const cls = await page.evaluate(() => (window as any).__cls as number)
  expect(cls, `CLS ${cls.toFixed(3)}`).toBeLessThan(0.25)
})
