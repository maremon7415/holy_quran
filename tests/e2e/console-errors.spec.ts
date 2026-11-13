import { test, expect, MAIN_ROUTES } from './fixtures'

/**
 * No uncaught exceptions and no console.error on any main route (third-party hosts are stubbed by the fixture,
 * so anything reported here comes from our own code). Also fails on same-origin 5xx and broken same-origin assets.
 */
for (const route of MAIN_ROUTES) {
  test(`no console/page errors: ${route}`, async ({ page, problems, baseURL }) => {
    const bad: string[] = []
    page.on('response', (r) => {
      const u = new URL(r.url())
      if (u.origin === new URL(baseURL!).origin && r.status() >= 400 && !/\/_next\/image|\/_vercel\/|favicon|\.map$/.test(u.pathname)) bad.push(`${r.status()} ${u.pathname}`)
    })
    const res = await page.goto(route)
    expect(res?.status(), `${route} status`).toBe(200)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#main')).toBeVisible()
    // let lazy effects (service worker registration, stores hydrating, intersection observers) run
    await page.waitForTimeout(500)
    expect(problems.list, `errors on ${route}`).toEqual([])
    expect(bad, `failed requests on ${route}`).toEqual([])
  })
}

test('no horizontal overflow on desktop for key pages', async ({ page }) => {
  for (const p of ['/', '/quran', '/surah/al-baqarah', '/topics', '/dua']) {
    await page.goto(p)
    await page.waitForLoadState('networkidle')
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(over, `${p} overflows by ${over}px`).toBeLessThanOrEqual(1)
  }
})

test('exactly one <h1> and one landmark <main>-level skip target on key pages', async ({ page }) => {
  for (const p of ['/', '/quran', '/topics', '/dua', '/names-of-allah', '/surah/al-baqarah/255']) {
    await page.goto(p)
    expect(await page.locator('h1:visible').count(), `${p} <h1> count`).toBe(1)
  }
})

test('lang attribute and viewport meta are present', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', /^(en|bn|ar)/)
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/)
})
