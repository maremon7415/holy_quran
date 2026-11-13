// Must set TZ before any Date is created. Vitest runs each file in its own forked process.
process.env.TZ = 'America/New_York'

import { describe, it, expect, afterEach, vi } from 'vitest'
import { hifzStreak } from '@/lib/stores/hifz'

const log = (...days: string[]) => Object.fromEntries(days.map((d) => [d, { reviewed: 1, learned: 0 }]))
const setNow = (iso: string) => vi.setSystemTime(new Date(iso))

afterEach(() => vi.useRealTimers())

describe('hifzStreak across DST (America/New_York)', () => {
  it('timezone override is active', () => {
    expect(new Date('2026-07-01T12:00:00Z').getTimezoneOffset()).toBe(240)
  })

  it('fall back (Sun 2026-11-01, 25h day) does not break or double-count the streak', () => {
    vi.useFakeTimers()
    setNow('2026-11-03T15:00:00Z') // Tue 10:00 local
    expect(hifzStreak(log('2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03'))).toBe(5)
  })

  it('spring forward (Sun 2026-03-08, 23h day) does not skip a day', () => {
    vi.useFakeTimers()
    setNow('2026-03-10T15:00:00Z')
    expect(hifzStreak(log('2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10'))).toBe(5)
  })

  it('late-night after fall-back: 23:30 local on the 25h day still counts that day', () => {
    vi.useFakeTimers()
    setNow('2026-11-02T04:30:00Z') // Sun Nov 1, 23:30 EST
    expect(hifzStreak(log('2026-10-31', '2026-11-01'))).toBe(2)
  })

  it('just after midnight following spring-forward', () => {
    vi.useFakeTimers()
    setNow('2026-03-09T04:10:00Z') // Mon Mar 9 00:10 EDT
    expect(hifzStreak(log('2026-03-07', '2026-03-08'))).toBe(2) // today empty → counts back from yesterday
  })

  it('a missing day breaks the streak', () => {
    vi.useFakeTimers()
    setNow('2026-11-03T15:00:00Z')
    expect(hifzStreak(log('2026-10-30', '2026-11-01', '2026-11-02', '2026-11-03'))).toBe(3)
  })

  it('no activity today or yesterday → 0; empty log → 0', () => {
    vi.useFakeTimers()
    setNow('2026-11-03T15:00:00Z')
    expect(hifzStreak(log('2026-10-30'))).toBe(0)
    expect(hifzStreak({})).toBe(0)
  })

  it('long streak across both transitions', () => {
    vi.useFakeTimers()
    setNow('2026-11-10T15:00:00Z')
    const days: string[] = []
    const d = new Date('2026-11-10T12:00:00')
    for (let i = 0; i < 120; i++) { days.push(d.toLocaleDateString('en-CA')); d.setDate(d.getDate() - 1) }
    expect(hifzStreak(log(...days))).toBe(120)
  })
})
