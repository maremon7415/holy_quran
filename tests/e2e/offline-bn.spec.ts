import { test, expect } from './fixtures'

/** Needs the production build (the service worker only registers there); skipped against a dev server. */
test.describe('offline: Bangla pages', () => {
  test('a visited /surah page is served for its /bn twin while offline (and vice versa)', async ({ page, context }) => {
    await page.goto('/surah/an-nas')
    await page.waitForLoadState('networkidle')
    const hasSw = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false
      for (let i = 0; i < 20; i++) { const r = await navigator.serviceWorker.getRegistration(); if (r?.active && navigator.serviceWorker.controller) return true; await new Promise((r) => setTimeout(r, 500)) }
      return false
    })
    test.skip(!hasSw, 'service worker only runs in the production build')
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.goto('/bn/surah/al-ikhlas')
    await page.waitForLoadState('networkidle')

    await context.setOffline(true)
    // only /surah/an-nas is cached in English: the Bangla URL falls back to it instead of the offline page
    await page.goto('/bn/surah/an-nas').catch(() => {})
    await expect(page.getByRole('heading', { level: 1 }).first()).not.toHaveText(/You’re offline|আপনি অফলাইনে আছেন/)
    await expect(page.locator('article[data-ayah="114:1"]').first()).toBeVisible()
    // only /bn/surah/al-ikhlas is cached: the English URL gets the Bangla twin
    await page.goto('/surah/al-ikhlas').catch(() => {})
    await expect(page.locator('article[data-ayah="112:1"]').first()).toBeVisible()
    // nothing cached for either language: the offline page
    await page.goto('/bn/surah/al-fil').catch(() => {})
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/You’re offline|আপনি অফলাইনে আছেন/)
    await context.setOffline(false)
  })

  test('/downloads offers to also save the other language', async ({ page }) => {
    await page.goto('/bn/downloads').catch(() => {})
    await page.goto('/downloads')
    await expect(page.getByRole('switch', { name: 'Also download the Bangla pages' })).toBeVisible()
  })
})
