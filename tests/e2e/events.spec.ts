import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'

const alternates = (page: Page) =>
  page.evaluate(() => Object.fromEntries([...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.getAttribute('hreflang'), new URL((l as HTMLLinkElement).href).pathname])))
const jsonLd = (page: Page) =>
  page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => { const j = JSON.parse(s.textContent || 'null'); return Array.isArray(j) ? j : [j] }))
const canonical = (page: Page) => page.evaluate(() => new URL(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href).pathname)

// the pages cover current year −1 … +4; pick years that are valid whenever the suite runs
const Y = new Date().getFullYear()
const YEAR = Y + 1
const BAD_YEAR = Y + 6

test.describe('/events hub', () => {
  test('timeline with Saudi and Bangladesh columns, prominent moon-sighting note, countdowns', async ({ page, problems }) => {
    await page.goto('/events')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Islamic Events')
    await expect(page).toHaveTitle(/Islamic Events .*\| ইসলামি দিবস কবে/)
    const note = page.getByTestId('sighting-note')
    await expect(note).toBeVisible()
    await expect(note).toContainText(/one day later than Saudi Arabia/)
    const items = page.locator('[data-testid="events-timeline"] > li')
    expect(await items.count()).toBeGreaterThan(6)
    await expect(items.first().locator('[data-col="saudi"]')).toBeVisible()
    await expect(items.first().locator('[data-col="bangladesh"]')).toBeVisible()
    await expect(items.first()).toContainText('Saudi Arabia (Umm al-Qura)')
    await expect(items.first()).toContainText('Bangladesh (expected, usually +1 day)')
    await expect(page.getByTestId('days-until').first()).toHaveText(/in \d+ days|tomorrow|today|in progress/)
    const types = (await jsonLd(page)).map((j) => j['@type'])
    for (const t of ['CollectionPage', 'FAQPage', 'BreadcrumbList']) expect(types, t).toContain(t)
    expect(await alternates(page)).toEqual({ en: '/events', bn: '/bn/events', 'x-default': '/events' })
    expect(problems.list).toEqual([])
  })

  test('/bn twin is Bangla-first with its own canonical', async ({ page, request }) => {
    const html = await (await request.get('/bn/events')).text()
    expect(html).toContain('ইসলামি দিবস কবে')
    await page.goto('/bn/events')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ইসলামি দিবস কবে')
    await expect(page.getByTestId('sighting-note')).toContainText('চাঁদ দেখার')
    expect(await canonical(page)).toBe('/bn/events')
    expect(await alternates(page)).toEqual({ en: '/events', bn: '/bn/events', 'x-default': '/events' })
  })
})

test.describe('event pages', () => {
  test('evergreen page: next date, five-year table, Quran + hadith + duas, schema', async ({ page, problems }) => {
    await page.goto('/events/eid-al-adha')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Eid ul Adha')
    await expect(page).toHaveTitle(/Eid ul Adha Date .*\| ঈদুল আজহা/)
    await expect(page.getByTestId('date-saudi')).toBeVisible()
    await expect(page.getByTestId('date-bd')).toBeVisible()
    await expect(page.getByTestId('event-countdown')).toBeVisible()
    await expect(page.getByTestId('sighting-note')).toBeVisible()
    expect(await page.getByTestId('events-table').last().locator('tbody tr').count()).toBeGreaterThanOrEqual(5)
    await expect(page.locator('article[id^="ayah-22-28"]')).toBeVisible()
    await expect(page.locator('article[id^="ayah-37-107"]')).toBeVisible()
    await expect(page.getByRole('link', { name: /Sahih Muslim 1141/ })).toHaveAttribute('href', '/hadith/muslim/1141')
    await expect(page.getByText('When is Eid ul Adha', { exact: false }).first()).toBeVisible()
    expect(await alternates(page)).toEqual({ en: '/events/eid-al-adha', bn: '/bn/events/eid-al-adha', 'x-default': '/events/eid-al-adha' })
    expect(problems.list).toEqual([])
  })

  test('year page: title, JSON-LD (Event, FAQPage, BreadcrumbList), Bangladesh is one day after Saudi', async ({ page, request }) => {
    await page.goto(`/events/eid-al-adha/${YEAR}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(`Eid ul Adha ${YEAR}`)
    await expect(page).toHaveTitle(`Eid ul Adha ${YEAR} Date in Bangladesh & Saudi Arabia | ঈদুল আজহা ${[...String(YEAR)].map((d) => '০১২৩৪৫৬৭৮৯'[+d]).join('')} কবে`)
    const ld = await jsonLd(page)
    const types = ld.map((j) => j['@type'])
    for (const t of ['Event', 'FAQPage', 'BreadcrumbList', 'WebPage']) expect(types, t).toContain(t)
    const ev = ld.find((j) => j['@type'] === 'Event')!
    expect(ev.startDate).toMatch(new RegExp(`^${YEAR}-`))
    expect(ev.eventStatus).toBe('https://schema.org/EventScheduled')
    expect(ev.eventAttendanceMode).toMatch(/EventAttendanceMode$/)
    expect(Array.isArray(ev.location)).toBe(true)
    const faq = ld.find((j) => j['@type'] === 'FAQPage')!
    expect(faq.mainEntity.some((q: { name: string }) => q.name === `When is Eid ul Adha ${YEAR} in Bangladesh?`)).toBe(true)
    const [saudi, bd] = await Promise.all([page.getByTestId('date-saudi').innerText(), page.getByTestId('date-bd').innerText()])
    const parse = (s: string) => Date.parse(s.replace(/^[A-Za-z]+,\s*/, '') + ' UTC')
    expect(parse(bd) - parse(saudi)).toBe(864e5)
    expect(await alternates(page)).toEqual({ en: `/events/eid-al-adha/${YEAR}`, bn: `/bn/events/eid-al-adha/${YEAR}`, 'x-default': `/events/eid-al-adha/${YEAR}` })
    expect(await canonical(page)).toBe(`/events/eid-al-adha/${YEAR}`)
    const md = await request.get(`/events/eid-al-adha/${YEAR}.md`)
    expect(md.status()).toBe(200)
    expect(await md.text()).toContain('Bangladesh')
  })

  test('Laylatul Qadr lists the five odd nights and the 27th is flagged neutrally', async ({ page }) => {
    await page.goto(`/events/laylatul-qadr/${YEAR}`)
    const rows = page.getByTestId('day-rows').locator('tbody tr')
    await expect(rows).toHaveCount(5)
    await expect(rows.nth(3)).toContainText('27th night')
    await expect(page.getByText(/Allah knows best/).first()).toBeVisible()
    await expect(page.locator('article[id^="ayah-97-"]')).toHaveCount(5)
  })

  test('/bn year page is Bangla with Bangla digits and its own JSON-LD language', async ({ page, request }) => {
    const html = await (await request.get(`/bn/events/eid-al-adha/${YEAR}`)).text()
    expect(html).toContain('ঈদুল আজহা')
    await page.goto(`/bn/events/eid-al-adha/${YEAR}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ঈদুল আজহা')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('কবে')
    await expect(page.getByTestId('date-bd')).toContainText('২০')
    expect(await canonical(page)).toBe(`/bn/events/eid-al-adha/${YEAR}`)
    const ev = (await jsonLd(page)).find((j) => j['@type'] === 'Event')!
    expect(ev.inLanguage).toBe('bn')
  })

  test('countdown hydrates without mismatches and ticks', async ({ page, problems }) => {
    await page.goto(`/events/ramadan-start/${YEAR}`)
    const secs = page.getByTestId('event-countdown').locator('[data-unit="s"]').first()
    await expect(secs).toHaveText(/^\d{2}$|^–$/)
    await page.waitForLoadState('networkidle')
    const a = await secs.innerText()
    await expect.poll(async () => secs.innerText(), { timeout: 4000 }).not.toBe(a)
    expect(problems.list).toEqual([])
  })

  test('years outside current −1 … +4 and unknown events are real 404s', async ({ request }) => {
    for (const p of [`/events/eid-al-adha/${BAD_YEAR}`, `/events/eid-al-adha/${Y - 2}`, '/events/eid-al-adha/abcd', '/events/not-an-event', '/events/not-an-event/2027', `/bn/events/eid-al-adha/${BAD_YEAR}`, '/bn/events/not-an-event']) {
      expect((await request.get(p)).status(), p).toBe(404)
    }
    for (const y of [Y - 1, Y, Y + 4]) expect((await request.get(`/events/ashura/${y}`)).status(), String(y)).toBe(200)
  })

  test('hub, nav, hijri-date and ramadan pages link to events; sitemap lists the pages', async ({ page, request }) => {
    await page.goto('/hijri-date')
    await expect(page.getByRole('link', { name: /All Islamic events/ }).first()).toHaveAttribute('href', '/events')
    await page.goto('/events')
    const xml = await (await request.get('/sitemap-places.xml')).text()
    for (const p of ['/events</loc>', `/events/eid-al-adha/${YEAR}</loc>`, `/bn/events/laylatul-qadr/${YEAR}</loc>`, '/events/white-days</loc>']) expect(xml, p).toContain(p)
    const api = await (await request.get(`/api/v1/events/eid-al-adha?year=${YEAR}`)).json()
    expect(api.event).toBe('eid-al-adha')
    const llms = await (await request.get('/llms.txt')).text()
    expect(llms).toContain('/events/eid-al-adha')
  })
})
