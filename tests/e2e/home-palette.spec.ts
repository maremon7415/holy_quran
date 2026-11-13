import { test, expect } from './fixtures'

test.describe('home', () => {
  test('renders hero, ayah of the day and feature cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Holy Quran')
    await expect(page.getByRole('link', { name: /start reading/i })).toHaveAttribute('href', '/quran')
    const votd = page.locator('section[aria-labelledby="votd"]')
    await expect(votd).toBeVisible()
    await expect(votd.getByRole('heading', { name: /ayah of the day/i })).toBeVisible()
    await expect(votd.locator('.quran-text')).toContainText(/[؀-ۿ]{3,}/)
    await expect(votd.getByRole('link', { name: /read in context/i })).toHaveAttribute('href', /^\/surah\/[a-z-]+#ayah-\d+$/)
    await expect(page.locator('section[aria-labelledby="explore"] a').first()).toBeVisible()
  })

  test('title and meta description are set', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Quran/i)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/)
  })
})

test.describe('command palette', () => {
  test('Ctrl+K opens; "2:255" finds Al-Baqarah and navigates', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    const input = page.getByPlaceholder(/Search surah/i)
    await expect(input).toBeVisible()
    await input.fill('2:255')
    const item = page.locator('[cmdk-item]').first()
    await expect(item).toBeVisible()
    await expect(item).toContainText(/Baqarah|2:255/)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/surah\/al-baqarah(\/255|#ayah-255)/)
  })

  test('"patience" returns ayah hits; selecting one opens the reader at that ayah', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    await page.getByPlaceholder(/Search surah/i).fill('patience')
    const hits = page.locator('[cmdk-item]')
    await expect(hits.first()).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('[cmdk-group-heading]', { hasText: /Ayahs/ })).toBeVisible()
    expect(await hits.count()).toBeGreaterThan(3)
    await hits.first().click()
    await expect(page).toHaveURL(/\/surah\/[a-z-]+#ayah-\d+/)
  })

  test('nonsense query shows an empty state', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    const input = page.getByPlaceholder(/Search surah/i)
    await input.fill('zzqxzzqx')
    await expect(page.locator('[cmdk-empty]')).toBeVisible({ timeout: 10_000 })
  })

  test('Escape closes the palette; it is a modal dialog and focus returns', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    const input = page.getByPlaceholder(/Search surah/i)
    await expect(input).toBeVisible()
    const dlg = page.getByRole('dialog', { name: /search the quran/i })
    await expect(dlg).toHaveAttribute('aria-modal', 'true')
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(input).toBeHidden()
    await expect(dlg).toBeHidden()
  })
})
