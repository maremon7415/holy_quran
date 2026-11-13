import { describe, it, expect } from 'vitest'
import { currentOrNextRamadan, fmtHijri, gregorianOf, hijriOf, ramadanInGregorianYear, ramadanOf } from '@/lib/places/hijri'
import { addDays, ymdKey } from '@/lib/places/dates'

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

  it('maps a Gregorian year to the Ramadan that starts in it', () => {
    expect(ramadanInGregorianYear(2027)?.hijriYear).toBe(1448)
    expect(ramadanInGregorianYear(2026)?.hijriYear).toBe(1447)
    expect(ramadanInGregorianYear(2030)?.hijriYear).toBe(1451)
    for (let y = 2024; y <= 2045; y++) {
      const r = ramadanInGregorianYear(y)
      if (r) expect(r.start.y).toBe(y)
    }
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
})
