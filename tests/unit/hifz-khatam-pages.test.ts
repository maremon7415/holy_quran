import { describe, it, expect } from 'vitest'
import { TOTAL_PAGES, TOTAL_AYAHS, pageStart, pageEnd, ayahOrdinal, ayahsInPages } from '@/lib/hifz/pages'
import { targetEnd, daysUntil, daysForPagesPerDay, khatamStatus, dayState } from '@/lib/hifz/khatam'
import type { Khatam } from '@/lib/stores/journey'
import { chapters } from '@/lib/quran/chapters'

const k = (over: Partial<Khatam> = {}): Khatam => ({
  id: 'k', kind: 'days', start: '2026-03-01', days: 30, donePage: 0, log: {}, createdAt: '', finishedAt: null, ...over,
})
const at = (s: string) => new Date(`${s}T12:00:00`).getTime()

describe('pages', () => {
  it('constants', () => { expect(TOTAL_PAGES).toBe(604); expect(TOTAL_AYAHS).toBe(6236) })
  it('pageStart bookends and clamps', () => {
    expect(pageStart(1)).toEqual([1, 1])
    expect(pageStart(2)).toEqual([2, 1])
    expect(pageStart(604)).toEqual([112, 1])
    expect(pageStart(0)).toEqual([1, 1])
    expect(pageStart(9999)).toEqual([112, 1])
  })
  it('ayahOrdinal', () => {
    expect(ayahOrdinal(1, 1)).toBe(0)
    expect(ayahOrdinal(2, 1)).toBe(7)
    expect(ayahOrdinal(114, 6)).toBe(TOTAL_AYAHS - 1)
  })
  it('whole mushaf = 6236 ayahs; per-page counts are positive and sum correctly', () => {
    expect(ayahsInPages(1, 604)).toBe(6236)
    let sum = 0
    for (let p = 1; p <= 604; p++) { const n = ayahsInPages(p, p); expect(n).toBeGreaterThan(0); sum += n }
    expect(sum).toBe(6236)
  })
  it('pageEnd / pageStart are contiguous', () => {
    expect(pageEnd(1)).toEqual([1, 7])
    expect(pageEnd(604)).toEqual([114, 6])
    for (let p = 1; p < 604; p++) {
      const [s, a] = pageEnd(p)
      expect(ayahOrdinal(s, a) + 1).toBe(ayahOrdinal(...pageStart(p + 1)))
      expect(a).toBeLessThanOrEqual(chapters[s - 1].versesCount)
    }
  })
  it('page starts are monotonic', () => {
    let prev = -1
    for (let p = 1; p <= 604; p++) { const o = ayahOrdinal(...pageStart(p)); expect(o).toBeGreaterThan(prev); prev = o }
  })
})

describe('khatam math', () => {
  it('targetEnd reaches 604 exactly on the last day and is monotonic', () => {
    for (const days of [1, 7, 30, 60, 365]) {
      expect(targetEnd(days - 1, days)).toBe(604)
      let prev = 0
      for (let d = 0; d < days; d++) { const t = targetEnd(d, days); expect(t).toBeGreaterThanOrEqual(prev); prev = t }
    }
    expect(targetEnd(-1, 30)).toBe(0)
    expect(targetEnd(999, 30)).toBe(604)
  })
  it('30-day plan ≈ 20 pages/day', () => expect(targetEnd(0, 30)).toBe(20))
  it('daysForPagesPerDay', () => {
    expect(daysForPagesPerDay(20)).toBe(31)
    expect(daysForPagesPerDay(604)).toBe(1)
    expect(daysForPagesPerDay(0)).toBe(604)
    expect(daysForPagesPerDay(-5)).toBe(604)
  })
  it('daysUntil is inclusive and at least 1', () => {
    expect(daysUntil('2026-03-10', at('2026-03-01'))).toBe(10)
    expect(daysUntil('2026-03-01', at('2026-03-01'))).toBe(1)
    expect(daysUntil('2026-02-01', at('2026-03-01'))).toBe(1)
  })
  it('status on day 0 with nothing read', () => {
    const s = khatamStatus(k(), at('2026-03-01'))
    expect(s).toMatchObject({ dayIndex: 0, doneToday: false, overdue: false, finished: false, remainingPages: 604, percent: 0, behindPages: 0 })
    expect(s.portion).toEqual({ from: 1, to: 20 })
  })
  it('done today when donePage reaches today target', () => {
    const s = khatamStatus(k({ donePage: 20 }), at('2026-03-01'))
    expect(s.doneToday).toBe(true)
    expect(s.portion).toBeNull()
  })
  it('behind: missed yesterday', () => {
    const s = khatamStatus(k({ donePage: 5 }), at('2026-03-02'))
    expect(s.behindPages).toBe(15)
    expect(s.portion).toEqual({ from: 6, to: 40 })
  })
  it('ahead', () => {
    const s = khatamStatus(k({ donePage: 100 }), at('2026-03-02'))
    expect(s.aheadPages).toBe(60)
    expect(s.doneToday).toBe(true)
  })
  it('overdue → remaining portion goes to 604', () => {
    const s = khatamStatus(k({ donePage: 500 }), at('2026-04-15'))
    expect(s.overdue).toBe(true)
    expect(s.portion).toEqual({ from: 501, to: 604 })
    expect(s.remainingDays).toBe(1)
    expect(s.neededPerDay).toBe(104)
  })
  it('finished', () => {
    const s = khatamStatus(k({ donePage: 604 }), at('2026-03-05'))
    expect(s).toMatchObject({ finished: true, overdue: false, doneToday: true, percent: 100, remainingPages: 0 })
    expect(s.portion).toBeNull()
  })
  it('start in the future → dayIndex 0', () => {
    expect(khatamStatus(k({ start: '2026-04-01' }), at('2026-03-01')).dayIndex).toBe(0)
  })
  it('dayState', () => {
    const kk = k({ donePage: 20 })
    expect(dayState(kk, 0, 1)).toBe('done')
    expect(dayState(kk, 1, 1)).toBe('today')
    expect(dayState(kk, 2, 1)).toBe('future')
    expect(dayState(k({ donePage: 0 }), 0, 3)).toBe('missed')
  })
})
