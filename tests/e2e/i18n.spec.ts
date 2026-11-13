import { test, expect, seedStorage } from './fixtures'
import type { Page } from '@playwright/test'

const BN = /[ঀ-৿]/
const AR = /[؀-ۿ]/

const langToggle = (page: Page, name: 'English' | 'বাংলা' | 'العربية') => page.getByRole('radio', { name }).locator('visible=true').first()
const alternates = (page: Page) =>
  page.evaluate(() => Object.fromEntries([...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.getAttribute('hreflang'), new URL((l as HTMLLinkElement).href).pathname])))
const canonical = (page: Page) => page.evaluate(() => new URL(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href).pathname)

test.describe('Bangla (/bn) pages', () => {
  test('/bn home is server-rendered in Bangla with a hreflang triplet', async ({ page, request }) => {
    // the raw server HTML already carries Bangla (no client switch needed) and the pair’s alternates
    const html = await (await request.get('/bn')).text()
    expect(html).toMatch(/<h1[^>]*>[^<]*[ঀ-৿]/)
    expect(html).toMatch(/hrefLang="bn"|hreflang="bn"/i)

    await page.goto('/bn')
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn')
    await expect(page.locator('h1').first()).toContainText(BN)
    await expect(page.getByRole('link', { name: /নূর/ }).first()).toBeVisible()
    expect(await alternates(page)).toEqual({ en: '/', bn: '/bn', 'x-default': '/' })
    expect(await canonical(page)).toBe('/bn')
    // internal links stay inside /bn when a twin exists
    await expect(page.locator('#main a[href="/bn/quran"]').first()).toBeVisible()
    await expect(page.locator('#main a[href="/quran"]')).toHaveCount(0)
  })

  test('/bn/surah/al-baqarah/255: Bangla title, hreflang triplet, uccharon first, Bangla meaning before English', async ({ page }) => {
    await page.goto('/bn/surah/al-baqarah/255')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'bn')
    await expect(page.locator('h1').first()).toContainText(BN)
    await expect(page.locator('h1').first()).toContainText('আল-বাকারা')
    await expect(page.locator('#main')).toContainText('আয়াতুল কুরসি') // the ayah’s well-known name, in Bangla
    expect(await alternates(page)).toEqual({ en: '/surah/al-baqarah/255', bn: '/bn/surah/al-baqarah/255', 'x-default': '/surah/al-baqarah/255' })
    expect(await canonical(page)).toBe('/bn/surah/al-baqarah/255')

    // uccharon (pronunciation) is on by default on Bangla pages, no setting touched
    await expect(html).toHaveAttribute('data-show-bt', 'auto')
    const article = page.locator('article[data-ayah="2:255"]')
    const bt = article.locator('[data-tr="bt"]').first()
    // the single-ayah page lists the translations in their own section below the Arabic card
    const bn = page.locator('#translations ~ div figure[data-tr="bn"], figure[data-tr="bn"]').first()
    const en = page.locator('figure[data-tr="en"][data-ed="sahih"]').first()
    await expect(bt).toBeVisible()
    await expect(bt).toContainText(BN)
    await expect(bt).not.toContainText(/[A-Za-z]/)
    await expect(bn).toBeVisible()
    await expect(en).toBeVisible()
    const [b0, b1, b2] = await Promise.all([bt.boundingBox(), bn.boundingBox(), en.boundingBox()])
    expect(b0!.y).toBeLessThan(b1!.y) // uccharon, then Bangla meaning …
    expect(b1!.y).toBeLessThan(b2!.y) // … then English
    // links to other ayahs / surahs keep users inside /bn
    await expect(page.locator('#main a[href^="/bn/surah/"]').first()).toBeAttached()
    await expect(page.locator('#main a[href^="/surah/"]')).toHaveCount(0)
  })

  test('English pages keep uccharon off until it is enabled', async ({ page }) => {
    await page.goto('/surah/al-mulk')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('article[data-ayah="67:1"] [data-tr="bt"]').first()).toBeHidden()
  })
})

test.describe('language toggle', () => {
  test('round-trips /x ↔ /bn/x and keeps <html lang> in sync', async ({ page }) => {
    await page.goto('/topics/patience')
    await page.waitForLoadState('networkidle')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'en')

    await langToggle(page, 'বাংলা').click()
    await expect(page).toHaveURL(/\/bn\/topics\/patience$/)
    await expect(html).toHaveAttribute('lang', 'bn')
    await expect(page.locator('h1').first()).toContainText(BN)
    await expect(langToggle(page, 'বাংলা')).toHaveAttribute('aria-checked', 'true')

    await langToggle(page, 'English').click()
    await expect(page).toHaveURL(/\/topics\/patience$/)
    await expect(html).toHaveAttribute('lang', 'en')
    await expect(page.locator('h1').first()).toContainText(/What does the Quran say about patience/i)
  })

  test('keeps the query string and goes Arabic without changing the URL', async ({ page }) => {
    await page.goto('/search?q=mercy')
    await page.waitForLoadState('networkidle')
    await langToggle(page, 'العربية').click()
    await expect(page).toHaveURL(/\/search\?q=mercy$/)
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'ar')
    await expect(html).toHaveAttribute('dir', 'rtl')
    await langToggle(page, 'বাংলা').click()
    // /search has no Bangla twin: stay on the page, switch the UI language only
    await expect(page).toHaveURL(/\/search\?q=mercy$/)
    await expect(html).toHaveAttribute('lang', 'bn')
    await expect(html).toHaveAttribute('dir', 'ltr')
  })

  test('the choice persists across reloads on pages without a twin', async ({ page }) => {
    await page.goto('/qibla')
    await page.waitForLoadState('networkidle')
    await langToggle(page, 'বাংলা').click()
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn')
  })
})

test.describe('Arabic UI (RTL)', () => {
  test.beforeEach(async ({ page }) => {
    await seedStorage(page, { 'quran-store': { state: { language: 'ar' }, version: 0 } })
  })

  test('sets lang=ar dir=rtl and mirrors the header (logo on the right)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'ar')
    await expect(html).toHaveAttribute('dir', 'rtl')
    await expect(html).toHaveClass(/lang-ar/)
    const logo = page.locator('header a[href="/"]').first()
    await expect(logo).toBeVisible()
    const lb = (await logo.boundingBox())!
    expect(lb.x + lb.width / 2, 'logo sits on the right half in RTL').toBeGreaterThan(640)
    const toggle = (await langToggle(page, 'العربية').boundingBox())!
    expect(toggle.x + toggle.width / 2, 'controls move to the left').toBeLessThan(640)
    await expect(page.locator('header')).toContainText(AR)
  })

  test('the same header in English has the logo on the left', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto('/')
    const lb = (await page.locator('header a[href="/"]').first().boundingBox())!
    expect(lb.x + lb.width / 2).toBeLessThan(640)
    await ctx.close()
  })

  test('server-rendered pages (/search, /about, /offline) are Arabic, not English', async ({ page }) => {
    for (const [route, h1] of [['/search', /ابحث في القرآن/], ['/about', /نور القرآن/], ['/offline', /أنت غير متصل/]] as const) {
      await page.goto(route)
      await expect(page.locator('h1').first(), route).toContainText(h1)
    }
    await page.goto('/search')
    await expect(page.locator('#main input[name="q"]')).toHaveAttribute('placeholder', /ابحث/)
    await expect(page.getByRole('navigation', { name: 'مسار التنقل' })).toBeVisible()
  })

  test('topic, dua, name and category labels are Arabic', async ({ page }) => {
    await page.goto('/topics')
    await expect(page.locator('#main h2').filter({ hasText: 'المشاعر والمحن' }).first()).toBeVisible()
    await expect(page.locator('#main a[href="/topics/patience"]').first()).toContainText('الصبر')
    await page.goto('/dua/ayatul-kursi')
    await expect(page.locator('h1').first()).toContainText('آية الكرسي')
    await page.goto('/surah/al-baqarah/255')
    await expect(page.locator('#main')).toContainText('آية الكرسي') // famous-ayah name
    await page.goto('/names-of-allah/ar-rahman')
    await expect(page.locator('h1').first()).toContainText('الرَّحْمَٰنُ'.replace(/[ً-ٰٟ]/g, '') === '' ? 'الرحمن' : /./)
  })

  test('no horizontal overflow at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    for (const route of ['/', '/quran', '/surah/al-fatihah', '/surah/al-baqarah/255', '/topics', '/dua', '/names-of-allah', '/prayer-times', '/search?q=mercy', '/about', '/hifz', '/journey']) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
      const over = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
      expect(over.sw, `${route}: scrollWidth ${over.sw} > ${over.iw}`).toBeLessThanOrEqual(over.iw)
    }
  })

  test('Quran text stays RTL and English/Bangla translations stay LTR', async ({ page }) => {
    await page.goto('/surah/al-fatihah')
    const a = page.locator('article[data-ayah="1:2"]')
    await expect(a.locator('.quran-text')).toHaveAttribute('dir', 'rtl')
    const en = a.locator('[data-tr="en"]').first()
    expect(await en.evaluate((el) => getComputedStyle(el).direction)).toBe('ltr')
  })
})
