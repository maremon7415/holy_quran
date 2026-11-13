import { describe, it, expect } from 'vitest'
import { cityBySlug, cities } from '@/lib/places/cities'
import { monthCsv, monthIcs, parseMonthKey } from '@/lib/places/export'
import { resolveMonth, MONTH_RANGE } from '@/lib/places/months'
import { placeEntries, placesSitemapXml } from '@/lib/places/sitemap'

const NOW = Date.UTC(2026, 10, 13, 6, 0) // 13 Nov 2026, noon in Dhaka

describe('monthly timetable route validation', () => {
  it('accepts ±12 months and rejects everything else', () => {
    expect(MONTH_RANGE).toBe(12)
    for (const m of ['2026-11', '2026-12', '2025-11', '2027-11']) expect(resolveMonth('dhaka', m, NOW), m).toBeTruthy()
    for (const m of ['2027-12', '2025-10', '2030-01', '2026-13', '2026-00', '2026-1', 'abc', '2026-11-01']) expect(resolveMonth('dhaka', m, NOW), m).toBeNull()
    expect(resolveMonth('not-a-city', '2026-11', NOW)).toBeNull()
    expect(resolveMonth('chittagong', '2026-11', NOW)?.city.slug).toBe('chattogram')
    expect(parseMonthKey('2026-02')).toEqual({ y: 2026, m: 2 })
  })

  it('uses the city’s own month at a UTC month boundary', () => {
    const t = Date.UTC(2026, 10, 30, 19, 0) // still 30 Nov in London, already 1 Dec in Dhaka
    expect(resolveMonth('dhaka', '2027-12', t)).toBeTruthy()
    expect(resolveMonth('london', '2027-12', t)).toBeNull()
  })
})

describe('CSV / iCalendar export', () => {
  it('CSV has a header and one row per day', () => {
    const csv = monthCsv(cityBySlug('dhaka')!, 2026, 11).trim().split('\r\n')
    expect(csv).toHaveLength(31)
    expect(csv[0]).toBe('Date,Day,Fajr,Sunrise,Dhuhr,Asr (Hanafi),Asr (Shafi/Standard),Maghrib,Isha')
    expect(csv[1]).toMatch(/^2026-11-01,Sun,\d\d:\d\d,\d\d:\d\d,\d\d:\d\d,\d\d:\d\d,\d\d:\d\d,\d\d:\d\d,\d\d:\d\d$/)
    expect(csv[30].startsWith('2026-11-30,Mon')).toBe(true)
    expect(monthCsv(cityBySlug('london')!, 2026, 2).trim().split('\r\n')).toHaveLength(29)
  })

  it('ICS is a valid calendar with 6 events per day and folded lines', () => {
    const ics = monthIcs(cityBySlug('dhaka')!, 2026, 11, NOW)
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true)
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(30 * 6)
    expect((ics.match(/END:VEVENT/g) ?? []).length).toBe(30 * 6)
    expect(ics.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true)
    expect(ics).toContain('X-WR-TIMEZONE:Asia/Dhaka')
    expect(ics).toContain('Jumu’ah')
  })
})

describe('places sitemap', () => {
  it('lists city pages with hreflang pairs and only two monthly pages per city', () => {
    const entries = placeEntries(NOW)
    expect(entries.filter((e) => /^\/prayer-times\/[a-z-]+$/.test(e.path))).toHaveLength(cities.length)
    expect(entries.filter((e) => /^\/prayer-times\/[a-z-]+\/\d{4}-\d{2}$/.test(e.path))).toHaveLength(cities.length * 2)
    expect(entries.some((e) => e.path === '/prayer-times/dhaka/2026-12')).toBe(true)
    expect(entries.some((e) => e.path === '/prayer-times/dhaka/2027-01')).toBe(false)
    expect(entries.some((e) => e.path === '/ramadan/2027/rajshahi')).toBe(true)
    const xml = placesSitemapXml(NOW)
    expect(xml).toContain('<loc>https://holy-quran-noor.vercel.app/bn/prayer-times/dhaka</loc>')
    expect(xml).toContain('hreflang="bn" href="https://holy-quran-noor.vercel.app/bn/prayer-times/dhaka"')
    expect(xml).toContain('/bn/hijri-date')
    expect(xml).toContain('/bn/zakat-calculator')
  })
})
