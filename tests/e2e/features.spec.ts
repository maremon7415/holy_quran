import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

/** In the recall step, reveal words one by one until the grade bar shows, then press `grade`. */
async function gradeRecall(page: Page, grade: RegExp) {
  const btn = page.getByRole('button', { name: grade })
  const reveal = page.getByRole('button', { name: 'Reveal next word' })
  for (let i = 0; i < 80; i++) {
    if (await btn.isVisible()) {
      // the bar re-renders while the previous chunk animates out; retry the click if it detaches
      const ok = await btn.click({ timeout: 1500 }).then(() => true, () => false)
      if (ok) return
    }
    await reveal.click({ timeout: 500 }).catch(() => {})
  }
  throw new Error('grade bar never appeared')
}

test.describe('hifz studio', () => {
  test('start session → fade → recall → grade → complete; progress persisted', async ({ page }) => {
    await page.goto('/hifz')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /^Learn Al-Ikhlas 1–4/ }).click() // default prefs: surah 112, ayahs 1-4, chunks of 2

    // step 1 (listen) is shown first; the surah text is fetched from /api/hifz/verses/112
    await expect(page.getByRole('button', { name: /1\. Listen/ })).toBeVisible()
    await page.getByRole('button', { name: /2\. Read/ }).click()
    await expect(page.locator('#main [lang="ar"]').first()).toContainText(/[؀-ۿ]{3,}/, { timeout: 15_000 })

    // fade step: hidden words can be revealed
    await page.getByRole('button', { name: /3\. Fade/ }).click()
    await expect(page.getByRole('button', { name: 'Reveal all' })).toBeVisible()
    await page.getByRole('button', { name: 'Reveal all' }).click()

    // recall step → reveal word by word until the grade bar appears
    await page.getByRole('button', { name: /4\. Recall/ }).click()
    await gradeRecall(page, /^Good/)
    await expect(page.getByText('2/2')).toBeVisible()
    await page.getByRole('button', { name: /4\. Recall/ }).click()
    await expect(page.getByRole('button', { name: /^Good/ })).toBeHidden() // fresh chunk: nothing revealed yet
    await gradeRecall(page, /^Good/)
    await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/4 ayahs? in memory/)).toBeVisible()

    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('noor-hifz') || '{}').state)
    expect(Object.keys(state.cards).sort()).toEqual(['112:1', '112:2', '112:3', '112:4'])
    expect(state.cards['112:1']).toMatchObject({ reps: 1, interval: 1, lapses: 0 })

    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.getByRole('button', { name: /^Learn Al-Ikhlas/ })).toBeVisible()
  })

  test('grading "Again" records a lapse and brings the card back soon', async ({ page }) => {
    await page.goto('/hifz')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /^Learn Al-Ikhlas 1–4/ }).click()
    await page.getByRole('button', { name: /4\. Recall/ }).click()
    await gradeRecall(page, /^Again/)
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('noor-hifz') || '{}').state)
    expect(state.cards['112:1'].lapses).toBe(1)
    expect(state.cards['112:1'].due - state.cards['112:1'].last).toBe(10 * 60_000)
  })
})

test.describe('journey / khatam planner', () => {
  test('creates a 30-day plan and shows today’s portion', async ({ page }) => {
    await page.goto('/journey')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Khatam planner').first()).toBeVisible()
    await page.getByRole('button', { name: 'In N days' }).click()
    const days = page.getByLabel('Days')
    await days.fill('30')
    await expect(page.getByText(/30 days · about 21 pages a day/)).toBeVisible()
    await page.getByRole('button', { name: 'Start my Khatam' }).click()

    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('noor-journey') || '{}').state)
    expect(state.khatams).toHaveLength(1)
    expect(state.khatams[0]).toMatchObject({ kind: 'days', days: 30, donePage: 0, finishedAt: null })
    expect(state.activeId).toBe(state.khatams[0].id)
    await expect(page.getByRole('button', { name: 'Start my Khatam' })).toBeHidden()
    await expect(page.getByText(/page(s)? 1/i).first()).toBeVisible()

    await page.reload()
    await expect(page.getByRole('button', { name: 'Start my Khatam' })).toBeHidden() // plan survives reload
  })
  test('pages-per-day plan computes days', async ({ page }) => {
    await page.goto('/journey')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Pages per day' }).click()
    await page.getByLabel('Pages per day').fill('20')
    await page.getByRole('button', { name: 'Start my Khatam' }).click()
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('noor-journey') || '{}').state)
    expect(state.khatams[0]).toMatchObject({ kind: 'pages', pagesPerDay: 20, days: 31 })
  })
})

test.describe('prayer times', () => {
  test('granted geolocation (Dhaka) shows the five daily prayers', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL, geolocation: { latitude: 23.8103, longitude: 90.4125 }, permissions: ['geolocation'], timezoneId: 'Asia/Dhaka', locale: 'en-US' })
    const page = await ctx.newPage()
    await page.goto('/prayer-times')
    await page.getByRole('button', { name: /use my location/i }).click()
    const main = page.locator('#main')
    await expect(main).toContainText('Dhaka', { timeout: 15_000 })
    for (const name of ['Fajr', 'Asr', 'Maghrib', 'Isha']) await expect(main.getByText(name, { exact: true }).first()).toBeVisible()
    await expect(main.getByText(/^(Dhuhr|Jumu’ah)$/).first()).toBeVisible() // Dhuhr is shown as Jumu’ah on Fridays
    await expect(main.getByText(/\b\d{1,2}:\d{2}\s?(AM|PM)\b/).first()).toBeVisible()
    // all five times are rendered
    expect(await main.getByText(/^\d{1,2}:\d{2}\s?(AM|PM)$/).count()).toBeGreaterThanOrEqual(5)
    await ctx.close()
  })

  test('without permission the page asks for a location and does not crash', async ({ page, problems }) => {
    await page.goto('/prayer-times')
    await expect(page.getByRole('button', { name: /use my location/i })).toBeVisible()
    expect(problems.list).toEqual([])
  })
})

test.describe('mobile (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('bottom tab bar navigates between sections; desktop nav is hidden', async ({ page }) => {
    await page.goto('/')
    const bar = page.getByRole('navigation', { name: 'Primary' })
    await expect(bar).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden()
    for (const [label, path] of [['Quran', '/quran'], ['Hifz', '/hifz'], ['Duas', '/dua'], ['Home', '/']] as const) {
      await bar.getByRole('link', { name: label }).click()
      await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/$' : path}`))
    }
  })

  test('"More" drawer opens with extra destinations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'More' }).click()
    const drawer = page.getByRole('dialog')
    await expect(drawer.getByRole('link', { name: 'Prayer Times' })).toBeVisible()
    await drawer.getByRole('link', { name: 'Prayer Times' }).click()
    await expect(page).toHaveURL(/\/prayer-times/)
  })

  test('no horizontal overflow on key pages', async ({ page }) => {
    for (const p of ['/', '/quran', '/surah/al-mulk', '/dua', '/topics', '/hifz']) {
      await page.goto(p)
      await page.waitForLoadState('networkidle')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, `${p} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(1)
    }
  })

  test('reader tab bar highlights Quran for /surah routes', async ({ page }) => {
    await page.goto('/surah/al-mulk')
    await expect(page.locator('article[data-ayah]').first()).toBeAttached()
    await expect(page.locator('html')).toHaveAttribute('data-show-en', /[01]/)
  })
})
