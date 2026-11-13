import { test, expect } from './fixtures'
import fs from 'node:fs/promises'

test.describe('accounts (no auth env configured)', () => {
  test('/account says accounts are not enabled and offers the local backup tools', async ({ page, problems }) => {
    await page.goto('/account')
    await expect(page.getByRole('heading', { name: 'Accounts not enabled on this deployment' })).toBeVisible()
    await expect(page.locator('#main')).toContainText(/stays on this device|backup/i)
    expect(problems.list).toEqual([])
  })

  test('/login says accounts are not enabled and has no credential form', async ({ page, problems }) => {
    await page.goto('/login')
    await expect(page.getByText('Accounts not enabled', { exact: false }).first()).toBeVisible()
    await expect(page.locator('input[type="password"]')).toHaveCount(0)
    await page.goto('/register')
    await expect(page.getByText('Accounts not enabled', { exact: false }).first()).toBeVisible()
    await expect(page.locator('input[type="password"]')).toHaveCount(0)
    expect(problems.list).toEqual([])
  })

  test('/account is localised', async ({ page }) => {
    await page.goto('/account')
    await page.evaluate(() => localStorage.setItem('quran-store', JSON.stringify({ state: { language: 'ar' }, version: 0 })))
    await page.reload()
    await expect(page.getByRole('heading', { name: /الحسابات غير مفعّلة/ })).toBeVisible()
  })
})

test.describe('offline & downloads', () => {
  test('/downloads renders the download controls and explains when the service worker is not running', async ({ page, problems }) => {
    await page.goto('/downloads')
    await expect(page.getByRole('heading', { level: 1, name: 'Downloads' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Read the whole Quran offline' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Recitation for offline listening' })).toBeVisible()
    await expect(page.getByText(/0\/114 surahs saved|surahs saved/).first()).toBeVisible()
    await expect(page.getByTestId('audio-list').locator('li')).toHaveCount(114)

    const start = page.getByRole('button', { name: /^(Download Quran|Resume download|Update)$/ })
    await expect(start).toBeVisible()
    // development server: no service worker → the page must say so and the button is disabled;
    // production build: the worker registers and downloading is possible.
    const note = page.getByText('Offline mode switches on in the installed / production app')
    await expect.poll(async () => (await note.isVisible()) || (await start.isEnabled()), { timeout: 15_000 }).toBe(true)
    if (await note.isVisible()) await expect(start).toBeDisabled()
    expect(problems.list).toEqual([])
  })

  test('shows an offline pill while the browser is offline and hides it again', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const pill = page.getByRole('status').filter({ hasText: 'Offline — saved content only' })
    await expect(pill).toBeHidden()
    await context.setOffline(true)
    await expect(pill).toBeVisible()
    await context.setOffline(false)
    await expect(pill).toBeHidden()
  })

  test('the pill is localised', async ({ page, context }) => {
    await page.goto('/bn')
    await page.waitForLoadState('networkidle')
    await context.setOffline(true)
    await expect(page.getByRole('status').filter({ hasText: 'অফলাইন — শুধু সংরক্ষিত কনটেন্ট' })).toBeVisible()
    await context.setOffline(false)
  })
})

test.describe('prayer reminders', () => {
  test.use({ geolocation: { latitude: 23.8103, longitude: 90.4125 }, permissions: ['geolocation'], timezoneId: 'Asia/Dhaka', locale: 'en-US' })

  test('the Reminders card renders and the .ics download has valid content', async ({ page, problems }) => {
    await page.goto('/prayer-times')
    await page.getByRole('button', { name: /use my location/i }).click()
    const card = page.locator('section[aria-labelledby="reminders-h"]')
    await expect(card.getByRole('heading', { name: 'Reminders' })).toBeVisible({ timeout: 15_000 })
    // one switch per reminder kind, none enabled by default
    for (const n of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Jumu’ah', 'Tahajjud']) await expect(card.getByRole('switch', { name: `${n} reminder` })).toBeVisible()
    await expect(card.getByRole('switch', { name: 'Fajr reminder' })).not.toBeChecked()
    await expect(card.getByText('Add prayer times to my calendar')).toBeVisible()

    const [download] = await Promise.all([page.waitForEvent('download'), card.getByRole('button', { name: 'Download calendar (.ics)' }).click()])
    expect(download.suggestedFilename()).toMatch(/^noor-prayer-times-\d{4}-\d{2}-\d{2}\.ics$/)
    const text = await fs.readFile((await download.path())!, 'utf8')

    expect(text.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(text.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(/(?<!\r)\n/.test(text), 'CRLF line endings').toBe(false)
    const unfolded = text.replace(/\r\n[ \t]/g, '')
    expect(unfolded).toContain('VERSION:2.0')
    expect(unfolded).toMatch(/X-WR-CALNAME:Prayer times — /)
    const events = (unfolded.match(/BEGIN:VEVENT/g) ?? []).length
    expect(events).toBe(30 * 5) // 30 days × five prayers (Sunrise / Tahajjud are off)
    expect((unfolded.match(/BEGIN:VALARM/g) ?? []).length).toBe(events)
    expect((unfolded.match(/END:VEVENT/g) ?? []).length).toBe(events)
    for (const name of ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) expect(unfolded).toContain(`SUMMARY:${name}`)
    expect(unfolded).toContain('SUMMARY:Jumu’ah')
    for (const l of unfolded.match(/^DT(START|END|STAMP):.*$/gm)!) expect(l).toMatch(/:\d{8}T\d{6}Z$/)
    for (const physical of text.split('\r\n')) expect(Buffer.byteLength(physical, 'utf8')).toBeLessThanOrEqual(75)
    expect(problems.list).toEqual([])
  })

  test('enabled reminders are persisted and reflected in the calendar export', async ({ page }) => {
    await page.goto('/prayer-times')
    await page.getByRole('button', { name: /use my location/i }).click()
    const card = page.locator('section[aria-labelledby="reminders-h"]')
    await expect(card.getByRole('heading', { name: 'Reminders' })).toBeVisible({ timeout: 15_000 })
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('noor-prayer-prefs') || '{}')
      s.state = { ...(s.state ?? {}), reminders: { ...(s.state?.reminders ?? {}), tahajjud: { on: true, before: 0, sound: 'silent' } } }
      localStorage.setItem('noor-prayer-prefs', JSON.stringify(s))
    })
    await page.reload()
    await page.getByRole('button', { name: /use my location/i }).click().catch(() => {})
    await expect(card.getByRole('switch', { name: 'Tahajjud reminder' })).toBeChecked({ timeout: 15_000 })
    const [download] = await Promise.all([page.waitForEvent('download'), card.getByRole('button', { name: 'Download calendar (.ics)' }).click()])
    const text = await fs.readFile((await download.path())!, 'utf8')
    expect((text.match(/BEGIN:VEVENT/g) ?? []).length).toBe(30 * 6)
    expect(text).toContain('SUMMARY:Tahajjud')
  })
})
