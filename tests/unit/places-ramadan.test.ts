import { describe, it, expect } from 'vitest'
import { currentOrNextRamadan, fmtHijri, gregorianOf, hijriOf, parseRamadanSlug, ramadanForYear, ramadanLabel, ramadanOf, ramadanPath, ramadanSlug, ramadansInGregorianYear } from '@/lib/places/hijri'
import { addDays, ymdKey } from '@/lib/places/dates'
import { placeEntries } from '@/lib/places/sitemap'

describe('Hijri (Umm al-Qura) and Ramadan dates', () => {
  it('knows Ramadan 1447 (2026) and 1448 (2027)', () => {
    const r47 = ramadanOf(1447)
    expect(ymdKey(r47.start)).toBe('2026-02-18')
    expect(ymdKey(r47.eid)).toBe('2026-03-20')
    const r48 = ramadanOf(1448)
    expect(ymdKey(r48.start)).toBe('2027-02-08')
    expect([29, 30]).toContain(r48.days)
    expect(ymdKey(r48.end)).toBe('2027-03-08')
  })

  it('start/end are consistent with the calendar', () => {
    for (let hy = 1446; hy <= 1460; hy++) {
      const r = ramadanOf(hy)
      expect(hijriOf(r.start), String(hy)).toEqual({ y: hy, m: 9, d: 1 })
      expect(hijriOf(addDays(r.start, -1)).m).toBe(8)
      expect(hijriOf(r.end).m).toBe(9)
      expect(hijriOf(r.eid)).toEqual({ y: hy, m: 10, d: 1 })
      expect(Math.round((Date.UTC(r.end.y, r.end.m - 1, r.end.d) - Date.UTC(r.start.y, r.start.m - 1, r.start.d)) / 864e5) + 1).toBe(r.days)
    }
  })

  it('lists every Ramadan that starts in a Gregorian year (2030 holds two)', () => {
    const span = (hy: number) => { const r = ramadanOf(hy); return `${ymdKey(r.start)}..${ymdKey(r.end)}` }
    const of = (y: number) => ramadansInGregorianYear(y).map((r) => r.hijriYear)
    expect(of(2026)).toEqual([1447])
    expect(of(2027)).toEqual([1448])
    expect(of(2029)).toEqual([1450])
    expect(span(1450)).toBe('2029-01-16..2029-02-13')
    // 2030: Ramadan 1451 (January) AND 1452 (December → January 2031)
    expect(of(2030)).toEqual([1451, 1452])
    expect(span(1451)).toBe('2030-01-05..2030-02-03')
    expect(span(1452)).toBe('2030-12-26..2031-01-23')
    expect(of(2031)).toEqual([1453])
    for (let y = 2024; y <= 2060; y++) {
      const list = ramadansInGregorianYear(y)
      expect(list.length, String(y)).toBeGreaterThanOrEqual(1)
      expect(list.length, String(y)).toBeLessThanOrEqual(2)
      list.forEach((r) => expect(r.start.y).toBe(y))
    }
  })

  it('URL slugs: the year while it is unambiguous, the Hijri year for each of two', () => {
    expect(ramadanSlug(ramadanOf(1450))).toBe('2029')
    expect(ramadanSlug(ramadanOf(1451))).toBe('1451-ah')
    expect(ramadanSlug(ramadanOf(1452))).toBe('1452-ah')
    expect(ramadanSlug(ramadanOf(1453))).toBe('2031')
    expect(ramadanPath(ramadanOf(1452))).toBe('/ramadan/1452-ah')
    expect(ramadanLabel(ramadanOf(1450))).toBe('2029')
    expect(ramadanLabel(ramadanOf(1452))).toBe('2030 (1452 AH)')
    expect(ramadanLabel(ramadanOf(1452), 'bn')).toBe('২০৩০ (১৪৫২ হিজরি)')
    expect(parseRamadanSlug('2030')).toEqual({ kind: 'year', year: 2030 })
    expect(parseRamadanSlug('1452-ah')).toEqual({ kind: 'ah', hijriYear: 1452 })
    for (const bad of ['abc', '30', '20300', '1452-AH', '1452-ah/x', '99-ah', '0100-ah', '2030-2', '']) expect(parseRamadanSlug(bad), bad).toBeNull()
    // every Ramadan has a distinct page path
    const paths = Array.from({ length: 12 }, (_, i) => ramadanPath(ramadanOf(1448 + i)))
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('/ramadan/{year} leads to the running, else next, Ramadan of that year', () => {
    const hy = (y: number, m: number, d: number, year: number) => ramadanForYear(year, { y, m, d })?.hijriYear
    expect(hy(2029, 6, 1, 2029)).toBe(1450)
    expect(hy(2030, 1, 1, 2030)).toBe(1451) // before the first
    expect(hy(2030, 2, 3, 2030)).toBe(1451) // last day of 1451
    expect(hy(2030, 2, 4, 2030)).toBe(1452) // Eid day: the January Ramadan is over
    expect(hy(2030, 12, 26, 2030)).toBe(1452)
    expect(hy(2031, 6, 1, 2030)).toBe(1452) // everything over: the last one of that year
    expect(hy(2031, 2, 1, 2031)).toBe(1453)
  })

  it('/ramadan redirect target at dates around each boundary', () => {
    const go = (y: number, m: number, d: number) => ramadanPath(currentOrNextRamadan({ y, m, d }).range)
    // 2029
    expect(go(2028, 12, 31)).toBe('/ramadan/2029')
    expect(go(2029, 1, 15)).toBe('/ramadan/2029')
    expect(go(2029, 1, 16)).toBe('/ramadan/2029') // 1 Ramadan 1450
    expect(go(2029, 2, 13)).toBe('/ramadan/2029') // last fast
    // 1451 is the first of 2030's two
    expect(go(2029, 2, 14)).toBe('/ramadan/1451-ah') // Eid 1450 → next is 1451
    expect(go(2030, 1, 4)).toBe('/ramadan/1451-ah')
    expect(go(2030, 1, 5)).toBe('/ramadan/1451-ah')
    expect(go(2030, 2, 3)).toBe('/ramadan/1451-ah')
    // after January's Ramadan the year-2030 entry must be the December one, not the finished one
    expect(go(2030, 2, 4)).toBe('/ramadan/1452-ah')
    expect(go(2030, 12, 25)).toBe('/ramadan/1452-ah')
    expect(go(2030, 12, 26)).toBe('/ramadan/1452-ah')
    expect(go(2031, 1, 23)).toBe('/ramadan/1452-ah')
    // 2031
    expect(go(2031, 1, 24)).toBe('/ramadan/2031')
    expect(go(2031, 12, 15)).toBe('/ramadan/2031')
    expect(go(2031, 12, 16)).toBe('/ramadan/2031')
    expect(go(2032, 1, 13)).toBe('/ramadan/2031')
    expect(go(2032, 1, 14)).toBe('/ramadan/2032')
  })

  it('round-trips Gregorian ↔ Hijri over many days', () => {
    let d = { y: 2024, m: 1, d: 1 }
    for (let i = 0; i < 900; i += 7) {
      d = addDays({ y: 2024, m: 1, d: 1 }, i)
      const h = hijriOf(d)
      expect(gregorianOf(h.y, h.m, h.d), ymdKey(d)).toEqual(d)
    }
    // day 30 only exists in 30-day months — never a wrong date
    const day30 = Array.from({ length: 12 }, (_, i) => gregorianOf(1448, i + 1, 30))
    expect(day30.some((g) => g === null)).toBe(true)
    day30.forEach((g, i) => { if (g) expect(hijriOf(g)).toEqual({ y: 1448, m: i + 1, d: 30 }) })
  })

  it('picks the running or next Ramadan', () => {
    expect(currentOrNextRamadan({ y: 2026, m: 11, d: 13 })).toMatchObject({ running: false, range: { hijriYear: 1448 } })
    expect(currentOrNextRamadan({ y: 2027, m: 2, d: 20 })).toMatchObject({ running: true, range: { hijriYear: 1448 } })
    expect(currentOrNextRamadan({ y: 2027, m: 3, d: 8 })).toMatchObject({ running: true })
    expect(currentOrNextRamadan({ y: 2027, m: 3, d: 10 })).toMatchObject({ running: false, range: { hijriYear: 1449 } })
  })

  it('formats in English, Bangla and Arabic', () => {
    const h = { y: 1448, m: 9, d: 1 }
    expect(fmtHijri(h, 'en')).toBe('1 Ramadan 1448 AH')
    expect(fmtHijri(h, 'bn')).toBe('১ রমজান ১৪৪৮ হিজরি')
    expect(fmtHijri(h, 'ar')).toBe('١ رمضان ١٤٤٨ هـ')
  })

  it('sitemap lists every Ramadan page that is still ahead (chooser + both pages in 2030)', () => {
    const paths = (utc: number) => placeEntries(utc).map((e) => e.path).filter((x) => x.startsWith('/ramadan'))
    const nov29 = paths(Date.UTC(2029, 10, 1))
    for (const x of ['/ramadan/2030', '/ramadan/1451-ah', '/ramadan/1452-ah', '/ramadan/1451-ah/dhaka', '/ramadan/1452-ah/dhaka']) expect(nov29, x).toContain(x)
    // 15 Feb 2030: January's Ramadan is over — only the December one (and the chooser) remain
    const feb30 = paths(Date.UTC(2030, 1, 15))
    expect(feb30).toContain('/ramadan/1452-ah')
    expect(feb30).toContain('/ramadan/2030')
    expect(feb30).not.toContain('/ramadan/1451-ah')
    // a normal year has the single year URL only
    const nov26 = paths(Date.UTC(2026, 10, 13))
    expect(nov26).toContain('/ramadan/2027')
    expect(nov26.some((x) => x.includes('-ah'))).toBe(false)
  })
})
