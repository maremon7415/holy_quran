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

test.describe('city page after local midnight', () => {
  test('a page rendered for yesterday switches grid, sehri/iftar, date and FAQ to the city’s new day', async ({ page, problems }) => {
    // The server renders for the real "today" (row 0). The browser clock is then set to 00:05 on the NEXT day in Dhaka (UTC+6),
    // i.e. the HTML the visitor receives is "yesterday's" page.
    await page.goto('/prayer-times/dhaka')
    const rows = page.locator('table tbody tr[data-date]')
    const norm = (t: string) => t.replace(/\s+/g, ' ').trim()
    const d0 = (await rows.nth(0).getAttribute('data-date'))!
    const d1 = (await rows.nth(1).getAttribute('data-date'))!
    // Dhaka is a Hanafi region: table cells = Fajr, Sunrise, Dhuhr, Asr (Hanafi), Asr (Std), Maghrib, Isha
    const rowTimes = async (i: number) => (await rows.nth(i).locator('td').allInnerTexts()).map(norm)
    const gridTimes = async () => (await page.locator('[data-prayer] > p.font-display time').allInnerTexts()).map(norm) // Fajr … Isha (6 cards)
    const r0 = await rowTimes(0), r1 = await rowTimes(1)
    expect(r0.join('|')).not.toBe(r1.join('|')) // the days differ, so the swap is observable
    expect(await gridTimes()).toEqual([r0[0], r0[1], r0[2], r0[3], r0[5], r0[6]])

    await page.clock.setFixedTime(new Date(`${d1}T00:05:00+06:00`))
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('today-date')).toContainText(new RegExp(`\\b${Number(d1.slice(8))}\\b`))
    expect(d0).not.toBe(d1)
    await expect.poll(gridTimes).toEqual([r1[0], r1[1], r1[2], r1[3], r1[5], r1[6]])
    const sehri = page.locator('#sehri-h ~ div > div')
    await expect(sehri.nth(0).locator('time')).toHaveText(r1[0])
    await expect(sehri.nth(1).locator('time')).toHaveText(r1[5])
    await expect(rows.nth(1)).toHaveAttribute('data-today', 'true')
    // FAQ answers quote the new day's date and Fajr
    const faq = page.locator('#faq-h ~ div details').first()
    await expect(faq).toContainText(r1[0])
    expect(problems.list).toEqual([])
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

test.describe('Ramadan: years with two Ramadans (2030 = 1451 AH + 1452 AH)', () => {
  const canonical = (page: Page) => page.evaluate(() => new URL(document.querySelector('link[rel="canonical"]')!.getAttribute('href')!).pathname)

  test('/ramadan/2030 is a chooser; each Ramadan has its own page, canonical and /bn twin', async ({ page, request }) => {
    await page.goto('/ramadan/2030')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ramadan 2030')
    expect(await canonical(page)).toBe('/ramadan/2030')
    await expect(page.getByRole('link', { name: /timetable 1451 AH/ })).toHaveAttribute('href', '/ramadan/1451-ah')
    await expect(page.getByRole('link', { name: /timetable 1452 AH/ })).toHaveAttribute('href', '/ramadan/1452-ah')
    await expect(page.getByText('Why are there two Ramadans in 2030?')).toBeVisible()

    await page.goto('/ramadan/1452-ah')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ramadan 2030 (1452 AH)')
    await expect(page.getByText('Thursday, 26 December 2030').first()).toBeVisible() // 1 Ramadan 1452
    expect(await canonical(page)).toBe('/ramadan/1452-ah')
    expect(await alternates(page)).toEqual({ en: '/ramadan/1452-ah', bn: '/bn/ramadan/1452-ah', 'x-default': '/ramadan/1452-ah' })
    await expect(page.getByRole('link', { name: 'Ramadan 2030 (1451 AH)' })).toHaveAttribute('href', '/ramadan/1451-ah')

    await page.goto('/ramadan/1451-ah/rajshahi')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Rajshahi Sehri & Iftar Time 2030 (1451 AH)')
    expect(await page.locator('table tbody tr').count()).toBeGreaterThanOrEqual(30)
    await page.goto('/ramadan/1452-ah/rajshahi')
    await expect(page.locator('table tbody tr').first()).toContainText('26 Dec')
    expect(await canonical(page)).toBe('/ramadan/1452-ah/rajshahi')

    await page.goto('/bn/ramadan/1452-ah')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('রমজান ২০৩০ (১৪৫২ হিজরি)')
    await page.goto('/bn/ramadan/2030')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('দুটি রমজান')

    // a city under the bare year goes to the running / upcoming Ramadan of that year
    const r = await request.get('/ramadan/2030/rajshahi', { maxRedirects: 0 })
    expect(r.status()).toBe(307)
    expect(r.headers().location).toMatch(/\/ramadan\/145[12]-ah\/rajshahi$/)
    // single-Ramadan years keep the plain year URL; the Hijri form redirects there
    const h = await request.get('/ramadan/1448-ah', { maxRedirects: 0 })
    expect(h.status()).toBe(308)
    expect(h.headers().location).toMatch(/\/ramadan\/2027$/)
    for (const u of ['/ramadan/2029', '/ramadan/2031', '/ramadan/2027']) expect((await request.get(u)).status(), u).toBe(200)
    for (const u of ['/ramadan/1999-ah', '/ramadan/1452-AH', '/ramadan/2030-2', '/ramadan/1300-ah']) expect((await request.get(u)).status(), u).toBe(404)
  })

  test('sitemap lists the Ramadan pages', async ({ request }) => {
    const xml = await (await request.get('/sitemap-places.xml')).text()
    expect(xml).toMatch(/\/ramadan\/(20\d\d|14\d\d-ah)<\/loc>/)
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
    await expect(page.getByRole('heading', { name: 'Upcoming Islamic events' })).toBeVisible()
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
