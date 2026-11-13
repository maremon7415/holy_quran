import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

const BN = /[ঀ-৿]/

const openSettings = async (page: Page, label = 'Reading settings') => {
  await page.waitForLoadState('networkidle') // opening the sheet during hydration can leave it mid-slide
  // the reader’s top bar also holds a “Reading settings” button, but it is inert and parked above the viewport until you scroll
  await page.locator(`button[aria-label="${label}"]`).and(page.locator('xpath=//*[not(ancestor-or-self::*[@inert])]')).click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

test.describe('translation picker (Quran.com catalogue, mocked)', () => {
  test('adds an extra edition and renders it under every ayah', async ({ page }) => {
    const cors = { 'access-control-allow-origin': '*' }
    let chapterCalls = 0
    // page routes win over the fixture’s catch-all stub; nothing here touches the real api.quran.com
    await page.route('https://api.quran.com/api/v4/resources/translations', (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: cors,
        body: JSON.stringify({
          translations: [
            { id: 20, name: 'Saheeh International', author_name: 'Saheeh International', language_name: 'english' },
            { id: 9991, name: 'Mock Edition', author_name: 'Test Translator', language_name: 'testlang' },
            { id: 9992, name: 'Other Edition', author_name: 'Someone Else', language_name: 'otherlang' },
          ],
        }),
      }),
    )
    await page.route(/api\.quran\.com\/api\/v4\/verses\/by_chapter\/1\?translations=9991/, (r) => {
      chapterCalls++
      return r.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: cors,
        body: JSON.stringify({ verses: Array.from({ length: 7 }, (_, i) => ({ verse_key: `1:${i + 1}`, translations: [{ resource_id: 9991, text: `Mock translation of 1:${i + 1}<sup foot_note=1>1</sup>` }] })) }),
      })
    })

    await page.goto('/surah/al-fatihah')
    await openSettings(page)
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Add a translation' }).click()
    await dialog.getByLabel('Search translations').fill('mock')
    const option = dialog.getByRole('option', { name: /Mock Edition/ })
    await expect(option).toBeVisible()
    await expect(dialog.getByRole('option', { name: /Other Edition/ })).toHaveCount(0) // search filters the catalogue
    await option.click()
    await expect(option).toHaveAttribute('aria-selected', 'true')
    // the selected edition is listed as a removable chip and persisted by id
    await expect(dialog.getByRole('list', { name: 'Extra translations' })).toContainText('Mock Edition')
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('noor-reader') || '{}').state.extraTr)).toEqual([9991])
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    const first = page.locator('article[data-ayah="1:1"]')
    await expect(first.locator('.xt-text')).toHaveText('Mock translation of 1:1', { timeout: 15_000 }) // footnote markers stripped
    await expect(first.locator('.xt-name')).toContainText('Testlang · Mock Edition')
    await expect(page.locator('article[data-ayah="1:7"] .xt-text')).toHaveText('Mock translation of 1:7')
    expect(chapterCalls, 'one request per chapter, not per ayah').toBe(1)

    // removing the chip removes the blocks again
    await openSettings(page)
    await page.getByRole('dialog').getByRole('list', { name: 'Extra translations' }).getByRole('button').click()
    await page.keyboard.press('Escape')
    await expect(page.locator('.xt-text')).toHaveCount(0)
  })
})

test.describe('Bangla pronunciation (uccharon) toggle', () => {
  test('is off by default on English pages, switchable and persistent', async ({ page }) => {
    await page.goto('/surah/al-mulk')
    const html = page.locator('html')
    const bt = page.locator('article[data-ayah="67:1"] [data-tr="bt"]').first()
    await expect(html).toHaveAttribute('data-show-bt', 'auto')
    await expect(bt).toBeHidden()

    await openSettings(page)
    const sw = page.getByRole('switch', { name: 'Bangla pronunciation' })
    await expect(sw).not.toBeChecked()
    await sw.click()
    await expect(html).toHaveAttribute('data-show-bt', '1')
    await expect(sw).toBeChecked()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(bt).toBeVisible()
    await expect(bt).toContainText(BN)

    await page.reload()
    await expect(html).toHaveAttribute('data-show-bt', '1')
    await expect(page.locator('article[data-ayah="67:1"] [data-tr="bt"]').first()).toBeVisible()

    await openSettings(page)
    await page.getByRole('switch', { name: 'Bangla pronunciation' }).click()
    await expect(html).toHaveAttribute('data-show-bt', '0')
    await page.keyboard.press('Escape')
    await expect(page.locator('article[data-ayah="67:1"] [data-tr="bt"]').first()).toBeHidden()
  })

  test('an explicit “off” wins over the Bangla default on /bn pages', async ({ page }) => {
    await page.goto('/bn/surah/al-mulk')
    await expect(page.locator('article[data-ayah="67:1"] [data-tr="bt"]').first()).toBeVisible()
    await openSettings(page, 'সেটিংস')
    const sw = page.getByRole('switch', { name: 'বাংলা উচ্চারণ' })
    await expect(sw).toBeChecked()
    await sw.click()
    await expect(page.locator('html')).toHaveAttribute('data-show-bt', '0')
    await page.keyboard.press('Escape')
    await expect(page.locator('article[data-ayah="67:1"] [data-tr="bt"]').first()).toBeHidden()
  })
})
