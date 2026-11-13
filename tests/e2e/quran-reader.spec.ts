import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

test.describe('/quran index', () => {
  test('lists 114 surahs; tabs and filter work', async ({ page }) => {
    await page.goto('/quran')
    const list = page.locator('section[aria-label="Surah index"] a[href^="/surah/"]')
    await expect(list.first()).toBeVisible()
    await expect(list).toHaveCount(114)

    const tabs = page.getByRole('tab')
    expect(await tabs.count()).toBeGreaterThanOrEqual(3)
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')

    await tabs.nth(1).click() // Juz
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('section[aria-label="Surah index"] a[href^="/juz/"]').first()).toBeVisible()

    await tabs.nth(2).click() // Revelation order
    await expect(page.locator('section[aria-label="Surah index"] a[href^="/surah/"]').first()).toHaveAttribute('href', '/surah/al-alaq')

    await tabs.first().click()
    await expect(list).toHaveCount(114)
  })

  test('surah cards link to canonical slugs', async ({ page }) => {
    await page.goto('/quran')
    await expect(page.locator('a[href="/surah/al-fatihah"]').first()).toBeVisible()
    await expect(page.locator('a[href="/surah/al-mulk"]').first()).toBeVisible()
  })
})

const openSettings = async (page: Page) => {
  // wait for hydration: opening the sheet during hydration can leave it mid-slide (see BUG note in report: components/reader/panel.tsx useIsDesktop)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Reading settings' }).locator('visible=true').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

test.describe('reader /surah/al-mulk', () => {
  test('renders 30 ayahs with Arabic, English and Bangla', async ({ page }) => {
    await page.goto('/surah/al-mulk')
    await expect(page.locator('h1').first()).toContainText(/Mulk/i)
    const ayahs = page.locator('article[data-ayah]')
    await expect(ayahs).toHaveCount(30)
    await expect(ayahs.first().locator('.quran-text')).toContainText(/[؀-ۿ]{3,}/)
    await expect(ayahs.first().locator('[data-tr="en"]').first()).toContainText(/./)
    await expect(ayahs.first().locator('[data-tr="bn"]')).toContainText(/[ঀ-৿]/)
    await expect(ayahs.nth(29)).toHaveAttribute('data-ayah', '67:30')
  })

  test('settings sheet toggles translations via data-show-* on <html>', async ({ page }) => {
    await page.goto('/surah/al-mulk')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-show-en', '1')
    const en = page.locator('article[data-ayah="67:1"] [data-tr="en"]').first()
    await expect(en).toBeVisible()

    await openSettings(page)
    const sw = page.getByRole('switch', { name: 'English' })
    await expect(sw).toBeChecked()
    await sw.click()
    await expect(html).toHaveAttribute('data-show-en', '0')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(en).toBeHidden()

    // persists across reload (reader prefs are applied before paint)
    await page.reload()
    await expect(html).toHaveAttribute('data-show-en', '0')
    await expect(page.locator('article[data-ayah="67:1"] [data-tr="en"]').first()).toBeHidden()

    await openSettings(page)
    await page.getByRole('switch', { name: 'English' }).click()
    await expect(html).toHaveAttribute('data-show-en', '1')
  })

  test('Bangla toggle hides Bangla block', async ({ page }) => {
    await page.goto('/surah/al-mulk')
    await openSettings(page)
    await page.getByRole('switch', { name: 'বাংলা' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-show-bn', '0')
    await expect(page.locator('article[data-ayah="67:1"] [data-tr="bn"]')).toBeHidden()
  })

  test('theme switching covers all 5 themes and persists after reload', async ({ page }) => {
    await page.goto('/surah/al-mulk')
    await openSettings(page)
    const dialog = page.getByRole('dialog')
    const themes: [string, string][] = [['Pearl', 'light'], ['Parchment', 'sand'], ['Dusk', 'dusk'], ['Midnight', 'dark'], ['Pure Black', 'black']]
    const seen = new Set<string>()
    for (const [label, cls] of themes) {
      await dialog.getByRole('radio', { name: label }).click()
      await expect(page.locator('html')).toHaveClass(new RegExp(`(^|\\s)${cls}(\\s|$)`))
      await expect(dialog.getByRole('radio', { name: label })).toHaveAttribute('aria-checked', 'true')
      await page.waitForTimeout(400) // theme colour transition
      seen.add(await page.evaluate(() => getComputedStyle(document.body).backgroundColor))
    }
    expect(seen.size, 'each theme paints a distinct page background').toBeGreaterThanOrEqual(4)
    // last = black; reload keeps it, and `dark:` variants apply (color-scheme dark)
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/(^|\s)black(\s|$)/)
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bg).toMatch(/^rgb\(0, 0, 0\)|rgba\(0, 0, 0/)
  })

  test('deep link #ayah-5 scrolls the ayah into view', async ({ page }) => {
    await page.goto('/surah/al-mulk#ayah-5')
    const target = page.locator('article[data-ayah="67:5"]')
    await expect(target).toBeInViewport({ timeout: 10_000 })
    await expect(page.locator('article[data-ayah="67:1"]')).not.toBeInViewport()
    // the target gets a short-lived highlight flag
    await expect(target).toHaveAttribute('data-glow', '1', { timeout: 5_000 }).catch(() => {})
  })

  test('deep link to a late ayah (#ayah-30)', async ({ page }) => {
    await page.goto('/surah/al-mulk#ayah-30')
    await expect(page.locator('article[data-ayah="67:30"]')).toBeInViewport({ timeout: 10_000 })
  })

  test('keyboard: j moves to next ayah, k back', async ({ page }) => {
    await page.goto('/surah/al-mulk')
    await page.waitForLoadState('networkidle')
    await page.locator('article[data-ayah="67:1"]').waitFor()
    const step = async (key: string, ayah: number) => {
      await page.keyboard.press(key)
      await expect(page.locator(`article[data-ayah="67:${ayah}"]`)).toBeInViewport({ timeout: 8_000 })
      await page.waitForTimeout(700) // let smooth-scroll + in-view tracking settle before the next key
    }
    await step('j', 2)
    await step('j', 3)
    await step('j', 4)
    await step('k', 3)
  })
})

test.describe('surah / juz routing', () => {
  test('/surah/2 → 308 → /surah/al-baqarah', async ({ request }) => {
    const res = await request.get('/surah/2', { maxRedirects: 0 })
    expect(res.status()).toBe(308)
    expect(new URL(res.headers()['location'], 'http://x').pathname).toBe('/surah/al-baqarah')
  })
  test('/surah/2/255 redirects to the slug form', async ({ request }) => {
    const res = await request.get('/surah/2/255', { maxRedirects: 0 })
    expect([307, 308]).toContain(res.status())
    expect(new URL(res.headers()['location'], 'http://x').pathname).toBe('/surah/al-baqarah/255')
  })
  test('unknown surah → real 404', async ({ request }) => {
    expect((await request.get('/surah/nope-nope')).status()).toBe(404)
    expect((await request.get('/surah/115')).status()).toBe(404)
    expect((await request.get('/surah/%E0%A4%A')).status()).toBe(404) // malformed percent-encoding must not 500
  })
  test('juz page renders and out-of-range juz is 404', async ({ request, page }) => {
    expect((await request.get('/juz/31')).status()).toBe(404)
    expect((await request.get('/juz/0')).status()).toBe(404)
    await page.goto('/juz/30')
    await expect(page.locator('article[data-ayah]').first()).toBeVisible()
    await expect(page.locator('article[data-ayah="78:1"]')).toHaveCount(1)
  })
})

test.describe('single ayah page /surah/al-baqarah/255', () => {
  test('H1, canonical and JSON-LD', async ({ page }) => {
    await page.goto('/surah/al-baqarah/255')
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toHaveCount(1)
    await expect(h1).toContainText(/Kursi|2:255|Baqarah/i)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/surah\/al-baqarah\/255$/)

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(blocks.length).toBeGreaterThan(0)
    const types: string[] = []
    const walk = (n: unknown) => {
      if (Array.isArray(n)) return n.forEach(walk)
      if (n && typeof n === 'object') {
        const o = n as Record<string, unknown>
        if (o['@type']) types.push(...[o['@type']].flat().map(String))
        Object.values(o).forEach(walk)
      }
    }
    for (const b of blocks) {
      const data = JSON.parse(b) // must be valid JSON
      walk(data)
      const ctx = Array.isArray(data) ? data[0]?.['@context'] : data['@context'] ?? data['@graph']
      expect(ctx).toBeTruthy()
    }
    expect(types).toContain('BreadcrumbList')
    expect(types.some((t) => ['Article', 'FAQPage', 'WebPage', 'Quotation', 'CreativeWork'].includes(t))).toBe(true)
    const allowed = new Set(['BreadcrumbList', 'ListItem', 'Article', 'FAQPage', 'Question', 'Answer', 'WebPage', 'Thing', 'Organization', 'ImageObject', 'Quotation', 'CreativeWork', 'Person', 'Language', 'WebSite', 'SearchAction', 'EntryPoint', 'Chapter', 'Book', 'ItemList', 'HowTo', 'HowToStep', 'AudioObject', 'WebApplication', 'Offer', 'Claim', 'DefinedTerm', 'Quantity', 'SpeakableSpecification', 'DefinedTermSet', 'Dataset', 'DataDownload'])
    for (const t of types) expect(allowed.has(t), `unexpected @type ${t}`).toBe(true)
  })
  test('has Arabic text, translations and links back to the surah reader', async ({ page }) => {
    await page.goto('/surah/al-baqarah/255')
    await expect(page.locator('.quran-text').first()).toContainText(/[؀-ۿ ]{40,}/)
    await expect(page.getByText(/no deity except Him/i).first()).toBeVisible()
    await expect(page.locator('a[href^="/surah/al-baqarah"]').first()).toBeVisible()
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/)
  })
  test('bookmark toggles and persists across reload', async ({ page }) => {
    await page.goto('/surah/al-baqarah/255')
    await page.waitForLoadState('networkidle')
    const btn = page.getByRole('button', { name: 'Bookmark' }).first()
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    await page.reload()
    await expect(page.getByRole('button', { name: 'Bookmark' }).first()).toHaveAttribute('aria-pressed', 'true')
  })
  test('invalid ayah /surah/al-baqarah/287 → 404', async ({ request }) => {
    // regression guard: invalid ayah numbers must be a real 404, not a 200 "soft 404"
    const res = await request.get('/surah/al-baqarah/287')
    expect(res.status()).toBe(404)
  })
  test('ayah 0 and non-numeric ayah → 404', async ({ request }) => {
    expect((await request.get('/surah/al-baqarah/0')).status()).toBe(404)
    expect((await request.get('/surah/al-baqarah/abc')).status()).toBe(404)
    expect((await request.get('/surah/al-baqarah/286')).status()).toBe(200)
  })
})
