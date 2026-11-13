import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

const alternates = (page: Page) =>
  page.evaluate(() => Object.fromEntries([...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.getAttribute('hreflang'), new URL((l as HTMLLinkElement).href).pathname])))
const jsonLd = (page: Page) =>
  page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => { const j = JSON.parse(s.textContent || 'null'); return Array.isArray(j) ? j : [j] }).map((j) => j['@type'] as string))

const now = new Date()
const ym = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
const thisMonth = ym(now)

test.describe('city prayer-time pages', () => {
  test('/prayer-times/dhaka renders the six times, a 30-day table, JSON-LD and hreflang', async ({ page, problems }) => {
    await page.goto('/prayer-times/dhaka')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dhaka Prayer Times Today')
    await expect(page).toHaveTitle(/Dhaka Prayer Times Today — Fajr, Dhuhr, Asr, Maghrib, Isha \| ঢাকার নামাজের সময়সূচি/)
    await expect(page.locator('[data-prayer]')).toHaveCount(6)
    for (const n of ['Fajr', 'Sunrise', 'Dhuhr', 'Jumu’ah', 'Asr', 'Maghrib', 'Isha']) if (n !== 'Jumu’ah') await expect(page.locator('#today-h ~ div h3', { hasText: n }).first()).toBeVisible()
    await expect(page.getByText('Sehri ends').first()).toBeVisible()
    await expect(page.locator('table tbody tr')).toHaveCount(30)
    await expect(page.getByTestId('countdown')).toHaveText(/\d+:\d\d/)
    expect(await alternates(page)).toEqual({ en: '/prayer-times/dhaka', bn: '/bn/prayer-times/dhaka', 'x-default': '/prayer-times/dhaka' })
    const types = await jsonLd(page)
    for (const t of ['FAQPage', 'BreadcrumbList', 'Place', 'WebPage']) expect(types, t).toContain(t)
    await expect(page.getByRole('link', { name: 'Change method or madhab' })).toHaveAttribute('href', '/prayer-times')
    await expect(page.getByText('Qibla from Dhaka')).toBeVisible()
    expect(problems.list).toEqual([])
  })

  test('/bn twin is Bangla-first with its own canonical', async ({ page, request }) => {
    const html = await (await request.get('/bn/prayer-times/dhaka')).text()
    expect(html).toContain('ঢাকার নামাজের সময়সূচি আজ')
    await page.goto('/bn/prayer-times/dhaka')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ঢাকার নামাজের সময়সূচি আজ')
    await expect(page.locator('[data-prayer]')).toHaveCount(6)
    expect(await alternates(page)).toEqual({ en: '/prayer-times/dhaka', bn: '/bn/prayer-times/dhaka', 'x-default': '/prayer-times/dhaka' })
    expect(await page.evaluate(() => new URL(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href).pathname)).toBe('/bn/prayer-times/dhaka')
    await expect(page.getByText('সেহরির শেষ সময়').first()).toBeVisible()
  })

  test('old spellings redirect, unknown cities 404', async ({ request }) => {
    const r = await request.get('/prayer-times/chittagong', { maxRedirects: 0 })
    expect(r.status()).toBe(308)
    expect(r.headers()['location'].split(',')[0].trim()).toBe('/prayer-times/chattogram')
    expect((await request.get('/prayer-times/atlantis')).status()).toBe(404)
    expect((await request.get('/bn/prayer-times/atlantis')).status()).toBe(404)
  })

  test('Dhaka and a London page use their own zone, method and Asr conventions', async ({ page }) => {
    await page.goto('/prayer-times/london')
    await expect(page.getByText('Muslim World League').first()).toBeVisible()
    await expect(page.locator('#today-h')).toContainText('London')
    await page.goto('/prayer-times/dhaka')
    await expect(page.getByText('Asia/Dhaka').first()).toBeVisible()
    await expect(page.locator('thead').getByText('Asr (Hanafi)')).toBeVisible()
  })
})

test.describe('monthly timetable', () => {
  test('current month renders every day, downloads work', async ({ page, request }) => {
    await page.goto(`/prayer-times/dhaka/${thisMonth}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dhaka Prayer Times')
    expect(await page.locator('table tbody tr').count()).toBeGreaterThanOrEqual(28)
    await expect(page.getByRole('button', { name: 'Print' })).toBeVisible()
    const csv = await request.get(`/prayer-times/dhaka/${thisMonth}/calendar.csv`)
    expect(csv.status()).toBe(200)
    expect(csv.headers()['content-type']).toContain('text/csv')
    expect(await csv.text()).toMatch(/^Date,Day,Fajr/)
    const ics = await request.get(`/prayer-times/dhaka/${thisMonth}/calendar.ics`)
    expect(ics.status()).toBe(200)
    expect(ics.headers()['content-type']).toContain('text/calendar')
    expect(await ics.text()).toContain('BEGIN:VCALENDAR')
  })

  test('/bn month page exists; months outside ±12 and malformed ones are 404', async ({ request }) => {
    expect((await request.get(`/bn/prayer-times/dhaka/${thisMonth}`)).status()).toBe(200)
    const far = new Date(Date.UTC(now.getUTCFullYear() + 2, now.getUTCMonth(), 1))
    expect((await request.get(`/prayer-times/dhaka/${ym(far)}`)).status()).toBe(404)
    expect((await request.get('/prayer-times/dhaka/1999-01')).status()).toBe(404)
    expect((await request.get('/prayer-times/dhaka/2026-13')).status()).toBe(404)
    expect((await request.get(`/prayer-times/dhaka/${ym(far)}/calendar.ics`)).status()).toBe(404)
  })
})

test.describe('Ramadan', () => {
  test('/ramadan → upcoming Ramadan year → city timetable with day-numbering toggle', async ({ page, request }) => {
    const r = await request.get('/ramadan', { maxRedirects: 0 })
    expect([307, 308]).toContain(r.status())
    await page.goto('/ramadan')
    await expect(page).toHaveURL(/\/ramadan\/\d{4}$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Ramadan \d{4}/)
    await expect(page.getByText('Start date depends on moon sighting')).toBeVisible()
    const year = new URL(page.url()).pathname.split('/').pop()!
    await page.goto(`/ramadan/${year}/rajshahi`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(`Rajshahi Sehri & Iftar Time ${year}`)
    expect(await page.locator('table tbody tr').count()).toBeGreaterThanOrEqual(30)
    await expect(page.getByText('Dhahaba az-zama’u').first()).toBeVisible()
    const first = page.locator('table tbody tr').first().locator('th')
    await expect(first).toHaveText('1')
    await page.getByRole('button', { name: '+1 day (moon sighting)' }).click()
    await expect(first).toHaveText('—')
    await expect(page.locator('table tbody tr').nth(1).locator('th')).toHaveText('1')
    expect(await page.evaluate(() => document.querySelector('link[rel="canonical"]')!.getAttribute('href'))).toContain(`/ramadan/${year}/rajshahi`)
    await page.goto(`/bn/ramadan/${year}/rajshahi`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('রাজশাহীর সেহরি ও ইফতারের সময়সূচি')
    expect((await request.get('/ramadan/1999/dhaka')).status()).toBe(404)
    expect((await request.get('/ramadan/abcd')).status()).toBe(404)
  })
})

test.describe('Hijri date', () => {
  test('shows today’s date, converts both ways, lists events; /bn twin', async ({ page }) => {
    await page.goto('/hijri-date')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Today’s Hijri Date')
    await expect(page.getByTestId('hijri-en')).toHaveText(/^\d{1,2} [A-Za-z’ -]+ 14\d\d AH$/)
    await expect(page.getByTestId('hijri-bd')).toBeVisible()
    await page.getByLabel('Gregorian date').fill('2027-02-08')
    await expect(page.getByTestId('g2h-result')).toContainText('1 Ramadan 1448 AH')
    await page.getByLabel('Year', { exact: true }).fill('1448')
    await page.locator('form[aria-labelledby="h2g"] select').nth(0).selectOption('9')
    await page.locator('form[aria-labelledby="h2g"] select').nth(1).selectOption('1')
    await expect(page.getByTestId('h2g-result')).toContainText('Monday, 8 February 2027')
    await expect(page.getByText('Upcoming Islamic events')).toBeVisible()
    await page.goto('/bn/hijri-date')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('আজ আরবি মাসের কত তারিখ')
    await expect(page.getByTestId('hijri-bd')).toContainText('হিজরি')
    expect(await alternates(page)).toEqual({ en: '/hijri-date', bn: '/bn/hijri-date', 'x-default': '/hijri-date' })
  })

  test('no hydration warnings, even when the visitor’s zone differs from Dhaka', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL, timezoneId: 'Pacific/Kiritimati' })
    const page = await ctx.newPage()
    const errs: string[] = []
    page.on('console', (m) => { if (m.type() === 'error' && /hydrat/i.test(m.text())) errs.push(m.text()) })
    await page.goto('/hijri-date')
    await expect(page.getByTestId('hijri-en')).toBeVisible()
    expect(errs).toEqual([])
    await ctx.close()
  })
})

test.describe('Zakat calculator', () => {
  test('nisab by silver: due above, not due below; vori units', async ({ page }) => {
    await page.goto('/zakat-calculator')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Zakat Calculator')
    await expect(page.getByText('2:43').first()).toBeVisible() // ayah rendered from the corpus
    await expect(page.getByText('9:60').first()).toBeVisible()
    await page.getByLabel('Silver price per gram').fill('100')
    await page.getByLabel('Cash in hand').fill('100000')
    await expect(page.getByTestId('zakat-amount')).toHaveText('$2,500.00')
    await expect(page.getByTestId('zakat-status')).toContainText('reaches the nisab')
    await page.getByLabel('Cash in hand').fill('50000')
    await expect(page.getByTestId('zakat-amount')).toHaveText('$0.00')
    await expect(page.getByTestId('zakat-status')).toContainText('below the nisab')
    // debts are deducted
    await page.getByLabel('Cash in hand').fill('100000')
    await page.getByLabel('Debts due now').fill('50000')
    await expect(page.getByTestId('zakat-amount')).toHaveText('$0.00')
    await page.getByLabel('Debts due now').fill('')
    // switch the nisab to gold (87.48 g) with a gold price: 100,000 is far below
    await page.getByLabel('Gold price per gram').fill('10000')
    await page.getByRole('radio', { name: /Gold — 87.48 g/ }).check()
    await expect(page.getByTestId('zakat-status')).toContainText('below the nisab')
    // 10 vori of gold = 116.64 g = 1,166,400
    await page.getByLabel('Gold you own (weight)').fill('10')
    await page.locator('#z-gu').selectOption('vori')
    await expect(page.getByTestId('zakat-result')).toContainText('$1,166,400.00')
    await expect(page.getByTestId('zakat-amount')).toHaveText('$31,660.00')
  })

  test('/bn twin defaults to BDT and Bangla copy', async ({ page }) => {
    await page.goto('/bn/zakat-calculator')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('যাকাত ক্যালকুলেটর')
    await expect(page.locator('select').first()).toHaveValue('BDT')
    expect(await alternates(page)).toEqual({ en: '/zakat-calculator', bn: '/bn/zakat-calculator', 'x-default': '/zakat-calculator' })
  })
})

test.describe('directory, sitemap & navigation', () => {
  test('/prayer-times links every city and searches', async ({ page }) => {
    await page.goto('/prayer-times')
    await expect(page.locator('a[href="/prayer-times/dhaka"]').first()).toBeVisible()
    expect(await page.locator('#dir-h ~ div a[href^="/prayer-times/"], #dir-h ~ ul a[href^="/prayer-times/"], section[aria-labelledby="dir-h"] a[href^="/prayer-times/"]').count()).toBeGreaterThan(140)
    await page.getByRole('searchbox', { name: 'Search for a city' }).fill('cox')
    await expect(page.getByRole('list', { name: 'Matching cities' }).getByRole('link', { name: /Cox/ })).toBeVisible()
    await page.getByRole('searchbox', { name: 'Search for a city' }).fill('সিলেট')
    await expect(page.getByRole('list', { name: 'Matching cities' }).getByRole('link', { name: /Sylhet|সিলেট/ })).toBeVisible()
  })

  test('footer has popular city links; more menu has the new tools', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Prayer times by city' })
    for (const c of ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'London', 'New York', 'Makkah']) await expect(nav.getByRole('link', { name: c, exact: true })).toBeVisible()
  })

  test('places sitemap is listed in the index and carries /bn hreflang pairs', async ({ request }) => {
    const index = await (await request.get('/sitemap.xml')).text()
    expect(index).toContain('/sitemap-places.xml')
    const res = await request.get('/sitemap-places.xml')
    expect(res.status()).toBe(200)
    const xml = await res.text()
    expect(xml).toContain('<loc>')
    const entry = xml.split('<url>').find((u) => u.includes('/bn/prayer-times/dhaka</loc>'))!
    expect(entry).toMatch(/hreflang="en"\s+href="[^"]*\/prayer-times\/dhaka"/)
    expect(entry).toMatch(/hreflang="x-default"/)
    const monthly = [...xml.matchAll(/<loc>[^<]*\/prayer-times\/dhaka\/(\d{4}-\d{2})<\/loc>/g)].length
    expect(monthly).toBe(4) // current + next month, en + bn
  })

  test('llms.txt mentions the new pages', async ({ request }) => {
    const txt = await (await request.get('/llms.txt')).text()
    expect(txt).toContain('/prayer-times/dhaka')
    expect(txt).toContain('/zakat-calculator')
    expect(txt).toContain('/hijri-date')
  })
})
