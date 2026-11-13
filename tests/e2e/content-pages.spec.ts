import { test, expect } from './fixtures'

test.describe('topics', () => {
  test('index lists topics and a topic page renders verses + JSON-LD', async ({ page }) => {
    await page.goto('/topics')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Quran say about/i)
    const links = page.locator('a[href^="/topics/"]')
    expect(await links.count()).toBeGreaterThan(30)

    await page.goto('/topics/patience')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/patience/i)
    await expect(page.locator('.quran-text').first()).toContainText(/[؀-ۿ]{3,}/)
    expect(await page.locator('.quran-text').count()).toBeGreaterThanOrEqual(5)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/topics\/patience$/)
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(ld.length).toBeGreaterThan(0)
    for (const b of ld) JSON.parse(b)
  })
  test('unknown topic → 404', async ({ request }) => {
    expect((await request.get('/topics/this-does-not-exist')).status()).toBe(404)
  })
})

test.describe('duas', () => {
  test('library search + category filter', async ({ page }) => {
    await page.goto('/dua')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const cards = page.locator('ul li a[href^="/dua/"]')
    const all = await cards.count()
    expect(all).toBeGreaterThan(20)
    await page.getByPlaceholder(/Search duas/i).fill('sleep')
    await expect.poll(async () => cards.count()).toBeLessThan(all)
    expect(await cards.count()).toBeGreaterThan(0)
    await page.getByPlaceholder(/Search duas/i).fill('zzzzqqq')
    await expect(page.getByText('No duas match your search')).toBeVisible()
  })

  test('dua page renders Arabic + transliteration + source and JSON-LD', async ({ page }) => {
    await page.goto('/dua/dua-morning-asbahna')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('#main [lang="ar"]').first()).toContainText(/[؀-ۿ]{3,}/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/dua\/dua-morning-asbahna$/)
    for (const b of await page.locator('script[type="application/ld+json"]').allTextContents()) JSON.parse(b)
  })

  test('/saved shows a bookmarked dua, and removing it empties the list', async ({ page }) => {
    await page.goto('/dua')
    await page.waitForLoadState('networkidle')
    const first = page.locator('ul li').filter({ has: page.locator('a[href^="/dua/"]') }).first()
    const href = await first.locator('a[href^="/dua/"]').first().getAttribute('href')
    await first.getByRole('button', { name: 'Bookmark this dua' }).click()
    await expect(first.getByRole('button', { name: 'Remove bookmark' })).toHaveAttribute('aria-pressed', 'true')

    await page.goto('/saved')
    await page.getByRole('tab', { name: /duas/i }).click()
    await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()

    await page.getByRole('button', { name: 'Remove' }).first().click()
    await expect(page.getByText('No saved duas')).toBeVisible()
  })

  test('unknown dua → 404', async ({ request }) => {
    expect((await request.get('/dua/nope-nope')).status()).toBe(404)
  })
})

test.describe('99 names of Allah', () => {
  test('grid renders 99 names; search filters; detail page works', async ({ page }) => {
    await page.goto('/names-of-allah')
    const cards = page.locator('ul li button[aria-pressed]').filter({ hasText: /Flip card/ })
    await expect(cards).toHaveCount(99)
    await page.getByPlaceholder(/Search: Rahman/i).fill('Rahman')
    await expect.poll(() => cards.count()).toBeLessThan(10)
    expect(await cards.count()).toBeGreaterThan(0)

    await page.goto('/names-of-allah/ar-rahman')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('#main [lang="ar"]').first()).toContainText(/[؀-ۿ]{4,}/)
  })

  test('quiz: answering shows the transliteration, score updates, next round starts', async ({ page }) => {
    await page.goto('/names-of-allah')
    await page.waitForLoadState('networkidle')
    await page.getByRole('tab', { name: 'Quiz' }).click()
    await expect(page.getByText('What does this Name mean?')).toBeVisible()
    await expect(page.getByText(/Score: 0\/0/)).toBeVisible()
    const options = page.locator('div.grid.gap-2\\.5 > button')
    await expect(options).toHaveCount(4)
    await options.first().click()
    await expect(page.getByText(/Score: [01]\/1/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Next Name' })).toBeVisible()
    for (const o of await options.all()) await expect(o).toBeDisabled()
    await page.getByRole('button', { name: 'Next Name' }).click()
    await expect(page.getByRole('button', { name: 'Next Name' })).toBeHidden()
    await expect(options.first()).toBeEnabled()
  })

  test('unknown name → 404', async ({ request }) => {
    expect((await request.get('/names-of-allah/nope')).status()).toBe(404)
  })
})

test.describe('search page', () => {
  test('/search?q=mercy lists results and is noindex', async ({ page }) => {
    await page.goto('/search?q=mercy')
    await expect(page.getByText(/\d+ verses? found/)).toBeVisible()
    await expect(page.locator('a', { hasText: 'Read in context' }).first()).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })
  test('empty query does not crash', async ({ page, problems }) => {
    const res = await page.goto('/search')
    expect(res?.status()).toBe(200)
    await expect(page.locator('#main')).toBeVisible()
    expect(problems.list).toEqual([])
  })
  test('hostile query is rendered inertly', async ({ page, problems }) => {
    let dialog = false
    page.on('dialog', (d) => { dialog = true; void d.dismiss() })
    await page.goto('/search?q=' + encodeURIComponent('<img src=x onerror=alert(1)>'))
    await expect(page.locator('#main')).toBeVisible()
    expect(dialog).toBe(false)
    expect(problems.list).toEqual([])
  })
})
