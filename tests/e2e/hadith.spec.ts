import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

const ARABIC = /[؀-ۿ]{3,}/
const BANGLA = /[ঀ-৿]{3,}/

const jsonLd = async (page: Page) => (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((t) => { const j = JSON.parse(t); return Array.isArray(j) ? j : [j] })
const hreflangs = async (page: Page) => Object.fromEntries(await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) => els.map((e) => [e.getAttribute('hreflang'), new URL((e as HTMLLinkElement).href).pathname])))
const canonical = (page: Page) => page.locator('link[rel="canonical"]').getAttribute('href').then((h) => new URL(h!).pathname)

test.describe('hadith library', () => {
  test('/hadith lists all collections, hadith of the day and a working search form', async ({ page, problems }) => {
    await page.goto('/hadith')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hadith Library')
    for (const slug of ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik', 'nawawi40', 'qudsi40']) await expect(page.locator(`main a[href="/hadith/${slug}"]`).first()).toBeVisible()
    await expect(page.getByText('Hadith of the day')).toBeVisible()
    await expect(page.getByRole('search').first()).toBeVisible()
    expect(await canonical(page)).toBe('/hadith')
    expect(await hreflangs(page)).toEqual({ en: '/hadith', bn: '/bn/hadith', 'x-default': '/hadith' })
    expect(problems.list).toEqual([])
  })

  test('single hadith: Arabic RTL + English + Bangla, reference, cite box, JSON-LD, hreflang', async ({ page, problems }) => {
    const res = await page.goto('/hadith/bukhari/1')
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sahih al-Bukhari 1')
    await expect(page).toHaveTitle(/Sahih al-Bukhari 1 — Actions are judged by intentions \| সহীহ বুখারী ১/)
    const ar = page.locator('article p[lang="ar"][dir="rtl"]').first()
    await expect(ar).toHaveText(ARABIC)
    await expect(ar).toHaveCSS('direction', 'rtl')
    await expect(page.locator('article blockquote[lang="en"]').first()).toContainText('intentions')
    await expect(page.locator('article figure[lang="bn"]').first()).toContainText(BANGLA)
    await expect(page.getByText('Book 1, Hadith 1').first()).toBeVisible()
    await expect(page.getByText('authentic by consensus')).toBeVisible()
    await expect(page.getByRole('link', { name: /^2$/ }).first()).toHaveAttribute('href', '/hadith/bukhari/2')
    // cite box
    await expect(page.getByRole('heading', { name: 'Cite this hadith' })).toBeVisible()
    await expect(page.getByText('Sahih al-Bukhari 1', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('[Sahih al-Bukhari 1](')).toBeVisible()
    // seo
    expect(await canonical(page)).toBe('/hadith/bukhari/1')
    expect(await hreflangs(page)).toEqual({ en: '/hadith/bukhari/1', bn: '/bn/hadith/bukhari/1', 'x-default': '/hadith/bukhari/1' })
    const ld = await jsonLd(page)
    const q = ld.find((j) => JSON.stringify(j['@type']).includes('Quotation'))!
    expect(q.isPartOf).toMatchObject({ '@type': 'Book', name: 'Sahih al-Bukhari' })
    expect(q.url).toMatch(/\/hadith\/bukhari\/1$/)
    expect(q.text).toContain('intentions')
    expect(ld.some((j) => j['@type'] === 'BreadcrumbList')).toBe(true)
    expect(ld.some((j) => j['@type'] === 'FAQPage')).toBe(true)
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
    expect(problems.list).toEqual([])
  })

  test('Bangla twin: /bn/hadith/bukhari/1 is Bangla, self-canonical and linked by hreflang', async ({ page }) => {
    const res = await page.goto('/bn/hadith/bukhari/1')
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('সহীহ বুখারী হাদিস ১')
    await expect(page).toHaveTitle(/সহীহ বুখারী হাদিস ১/)
    await expect(page.locator('article figure[lang="bn"]').first()).toContainText(BANGLA)
    expect(await canonical(page)).toBe('/bn/hadith/bukhari/1')
    expect(await hreflangs(page)).toEqual({ en: '/hadith/bukhari/1', bn: '/bn/hadith/bukhari/1', 'x-default': '/hadith/bukhari/1' })
    await expect(page.locator('main a[href="/bn/hadith/bukhari/2"]').first()).toBeVisible()
  })

  test('Sahih Muslim uses Abd al-Baqi numbers: 2564 has three narrations (a, b, c)', async ({ page }) => {
    await page.goto('/hadith/muslim/2564')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sahih Muslim 2564')
    await expect(page.locator('article [data-entry]')).toHaveCount(3)
    await expect(page.getByRole('heading', { name: 'Sahih Muslim 2564c' })).toBeVisible()
    await expect(page.locator('article')).toContainText('looks to your hearts')
    await expect(page.getByText('Muhammad Fu’ad ‘Abd al-Baqi (as cited worldwide)')).toBeVisible()
  })

  test('graded collections show per-scholar grades with clear labels', async ({ page }) => {
    await page.goto('/hadith/abudawud/5095')
    await expect(page.getByRole('heading', { name: 'Authenticity & grade' })).toBeVisible()
    await expect(page.locator('main').getByText(/Sahih|Hasan|Da.if/).first()).toBeVisible()
    await expect(page.getByText('Al-Albani').first()).toBeVisible()
  })

  test('out-of-range, gap, introduction and malformed numbers return 404', async ({ request }) => {
    for (const p of ['/hadith/bukhari/7564', '/hadith/bukhari/99999', '/hadith/bukhari/0', '/hadith/muslim/7', '/hadith/muslim/3034', '/hadith/nawawi40/43', '/hadith/qudsi40/41', '/hadith/bukhari/abc', '/hadith/bukhari/01', '/hadith/bukhari/1.5', '/hadith/unknown/1', '/hadith/unknown', '/bn/hadith/bukhari/99999', '/hadith/bukhari/book/999', '/hadith/bukhari/book/1/page/2', '/hadith/bukhari/book/1/page/1', '/hadith/bukhari/5710',
      // blank in Arabic + English (only the unused Bangla edition has text): was in the sitemap and prerendered as an error page
      '/hadith/malik/470', '/hadith/malik/1762', '/bn/hadith/malik/994', '/hadith/malik/470.md']) {
      expect((await request.get(p)).status(), p).toBe(404)
    }
  })

  test('collection alias redirects to the canonical slug', async ({ request }) => {
    const res = await request.get('/hadith/nawawi/1', { maxRedirects: 0 })
    expect([301, 308]).toContain(res.status())
    expect(res.headers().location).toContain('/hadith/nawawi40/1')
  })

  test('collection page lists books with hadith ranges; book page lists hadiths with pagination', async ({ page }) => {
    await page.goto('/hadith/bukhari')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sahih al-Bukhari')
    await expect(page.getByRole('link', { name: /Revelation/ })).toHaveAttribute('href', '/hadith/bukhari/book/1')
    await expect(page.getByText('Hadith 1–7')).toBeVisible()
    expect(await canonical(page)).toBe('/hadith/bukhari')
    await page.goto('/hadith/bukhari/book/1')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Revelation')
    await expect(page.locator('main ol[data-list="hadiths"] > li')).toHaveCount(7)
    await expect(page.locator('main ol[data-list] a[href="/hadith/bukhari/1"]')).toBeVisible()
    await page.goto('/hadith/abudawud/book/2') // 770 hadiths → several pages
    await expect(page.locator('main ol[data-list="hadiths"] > li')).toHaveCount(25)
    await page.getByRole('link', { name: '2', exact: true }).first().click()
    await expect(page).toHaveURL(/\/hadith\/abudawud\/book\/2\/page\/2$/)
    expect(await canonical(page)).toBe('/hadith/abudawud/book/2/page/2')
  })

  test('search: reference jump, English, Bangla and Arabic queries; results are noindex', async ({ page }) => {
    await page.goto('/hadith/search?q=intended&c=nawawi40')
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1)
    await expect(page.locator('main ol[data-list] a[href="/hadith/nawawi40/1"]')).toBeVisible()
    await expect(page.locator('main mark').first()).toContainText(/intended/i)

    await page.goto('/hadith/search?q=Sahih+Bukhari+hadith+1')
    await expect(page.getByRole('link', { name: /Go to hadith/ })).toHaveAttribute('href', '/hadith/bukhari/1')
    await page.goto(`/bn/hadith/search?q=${encodeURIComponent('বুখারী হাদিস ১')}`)
    await expect(page.getByRole('link', { name: /হাদিসে যান/ })).toHaveAttribute('href', '/bn/hadith/bukhari/1')

    await page.goto(`/hadith/search?q=${encodeURIComponent('الأعمال بالنيات')}&c=nawawi40`) // Arabic: normalised on both sides
    await expect(page.locator('main ol[data-list] a[href="/hadith/nawawi40/1"]')).toBeVisible()
    await page.goto(`/bn/hadith/search?q=${encodeURIComponent('নিয়ত')}&c=nawawi40`)
    await expect(page.locator('main ol[data-list] a[href="/bn/hadith/nawawi40/1"]')).toBeVisible()
    await page.goto('/hadith/search?q=zzzzqqqq&c=nawawi40')
    await expect(page.getByRole('status').filter({ hasText: 'No hadith found' })).toBeVisible()
  })

  test('the search form submits (works as a plain GET)', async ({ page }) => {
    await page.goto('/hadith/bukhari')
    await page.waitForLoadState('networkidle')
    const form = page.getByRole('search').first()
    await form.getByRole('searchbox').fill('Bukhari 1')
    await form.getByRole('button', { name: 'Search' }).click()
    await expect(page).toHaveURL(/\/hadith\/search\?q=Bukhari\+1&c=bukhari/)
    await expect(page.getByRole('link', { name: /Go to hadith/ })).toHaveAttribute('href', '/hadith/bukhari/1')
  })

  test('dua sources link to hadith pages', async ({ page }) => {
    await page.goto('/dua/dua-morning-asbahna')
    const a = page.locator('main a[href^="/hadith/"]').first()
    await expect(a).toBeVisible()
    await a.click()
    await expect(page).toHaveURL(/\/hadith\/[a-z0-9]+\/\d+$/)
    await expect(page.getByRole('heading', { name: 'Related duas' })).toBeVisible()
  })

  test('sitemaps include hadith pages with hreflang; llms.txt documents the URLs', async ({ request }) => {
    const idx = await (await request.get('/sitemap.xml')).text()
    const files = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((p) => /^\/sitemap\/\d+\.xml$/.test(p))
    let en = '', bn = ''
    for (const f of files.slice(6)) {
      const xml = await (await request.get(f)).text()
      const first = xml.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? ''
      if (!first.includes('/hadith')) continue // Quran sitemaps
      if (first.includes('/bn/hadith')) bn += xml
      else en += xml
    }
    expect(en).toContain('/hadith/bukhari/1</loc>')
    expect(en).toContain('/hadith/muslim/2564</loc>')
    expect(en).toMatch(/hreflang="bn"\s+href="[^"]*\/bn\/hadith\/bukhari\/1"/)
    expect(bn).toContain('/bn/hadith/muslim/2564</loc>')
    expect(en).not.toContain('/hadith/muslim/7</loc>')
    for (const n of [470, 485, 522, 671, 694, 994, 1389, 1597, 1762]) expect(en, `malik ${n}`).not.toContain(`/hadith/malik/${n}</loc>`)
    const llms = await (await request.get('/llms.txt')).text()
    expect(llms).toContain('/hadith/{collection}/{number}')
    expect(llms).toContain('/hadith/muslim/2564')
  })

  test('UI strings are available in Arabic', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('quran-store', JSON.stringify({ state: { language: 'ar' }, version: 0 })))
    await page.goto('/hadith')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('مكتبة الحديث')
    await expect(page.getByRole('heading', { name: 'كتب الحديث' })).toBeVisible()
  })

  test('mobile: no horizontal scroll on a hadith page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto('/hadith/muslim/2564')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
})
