process.env.TZ = 'UTC' // the device zone must not leak into the results: everything is computed for the location's own zone
import { describe, it, expect } from 'vitest'
import { computeSchedule, dayParts, REMINDER_KEYS, REMINDER_NAMES, type ReminderKey } from '@/lib/prayer/times'

const DHAKA = { lat: 23.8103, lon: 90.4125, method: 'Karachi', madhab: 'hanafi' as const, tz: 'Asia/Dhaka' }
const hm = (ms: number, tz: string) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(ms).map((x) => [x.type, x.value]))
  return +p.hour * 60 + +p.minute
}
const mins = (s: string) => +s.slice(0, 2) * 60 + +s.slice(3)

/** Local clock times for Dhaka (University of Islamic Sciences Karachi method, Hanafi Asr), in line with the published Dhaka timetables. */
const KNOWN: Record<string, Record<string, string>> = {
  '2025-03-15': { fajr: '04:52', sunrise: '06:07', dhuhr: '12:08', asr: '16:27', maghrib: '18:07', isha: '19:23', tahajjud: '01:16' },
  '2025-06-21': { fajr: '03:44', sunrise: '05:12', dhuhr: '12:01', asr: '16:41', maghrib: '18:48', isha: '20:16', tahajjud: '00:45' },
  '2025-12-21': { fajr: '05:16', sunrise: '06:36', dhuhr: '11:57', asr: '15:41', maghrib: '17:16', isha: '18:37', tahajjud: '01:16' },
}

describe('computeSchedule — Dhaka', () => {
  for (const [date, want] of Object.entries(KNOWN)) {
    it(`matches the known times on ${date} (±2 min)`, () => {
      const [y, m, d] = date.split('-').map(Number)
      const [day] = computeSchedule({ ...DHAKA, days: 1, from: Date.UTC(y, m - 1, d, 6) })
      expect(day.date).toBe(date)
      for (const [k, v] of Object.entries(want)) {
        expect(Math.abs(hm(day.times[k as ReminderKey], 'Asia/Dhaka') - mins(v)), `${date} ${k}`).toBeLessThanOrEqual(2)
      }
    })
  }

  it('orders the day’s prayers chronologically', () => {
    const [d] = computeSchedule({ ...DHAKA, days: 1, from: Date.UTC(2025, 2, 15, 6) })
    const t = d.times
    expect(t.fajr).toBeLessThan(t.sunrise)
    expect(t.sunrise).toBeLessThan(t.dhuhr)
    expect(t.dhuhr).toBeLessThan(t.asr)
    expect(t.asr).toBeLessThan(t.maghrib)
    expect(t.maghrib).toBeLessThan(t.isha)
    expect(t.jumuah).toBe(t.dhuhr)
  })

  it('puts Tahajjud at the start of the last third of the night (after Isha, before the next Fajr)', () => {
    const [d0, d1] = computeSchedule({ ...DHAKA, days: 2, from: Date.UTC(2025, 2, 15, 6) })
    const night = d1.times.fajr - d0.times.maghrib
    expect(d0.times.tahajjud).toBeGreaterThan(d0.times.isha)
    expect(d0.times.tahajjud).toBeLessThan(d1.times.fajr)
    expect(Math.abs(d0.times.tahajjud - (d0.times.maghrib + (night * 2) / 3))).toBeLessThan(1000)
  })

  it('Hanafi Asr is later than Shafi Asr; the Fajr/Dhuhr are unaffected', () => {
    const base = { ...DHAKA, days: 1, from: Date.UTC(2025, 2, 15, 6) }
    const [h] = computeSchedule({ ...base, madhab: 'hanafi' })
    const [s] = computeSchedule({ ...base, madhab: 'shafi' })
    expect(h.times.asr).toBeGreaterThan(s.times.asr)
    expect(h.times.dhuhr).toBe(s.times.dhuhr)
    expect(h.times.fajr).toBe(s.times.fajr)
  })

  it('marks Fridays by the location’s calendar and numbers consecutive days', () => {
    const days = computeSchedule({ ...DHAKA, days: 7, from: Date.UTC(2025, 2, 10, 6) }) // Mon 10 Mar
    expect(days.map((d) => d.date)).toEqual(['2025-03-10', '2025-03-11', '2025-03-12', '2025-03-13', '2025-03-14', '2025-03-15', '2025-03-16'])
    expect(days.filter((d) => d.friday).map((d) => d.date)).toEqual(['2025-03-14'])
  })

  it('uses the location’s date, not the device’s, around midnight', () => {
    // 2025-03-15 23:30 in New York is already 2025-03-16 in Dhaka (UTC+6, 03:30 UTC → 09:30)
    const at = Date.UTC(2025, 2, 16, 3, 30)
    expect(dayParts(at, 'America/New_York')).toEqual({ y: 2025, m: 3, d: 15 })
    expect(dayParts(at, 'Asia/Dhaka')).toEqual({ y: 2025, m: 3, d: 16 })
    expect(computeSchedule({ ...DHAKA, days: 1, from: at })[0].date).toBe('2025-03-16')
  })

  it('falls back to the Karachi method for unknown method names', () => {
    const a = computeSchedule({ ...DHAKA, days: 1, from: Date.UTC(2025, 2, 15, 6), method: 'Nope' })[0]
    const b = computeSchedule({ ...DHAKA, days: 1, from: Date.UTC(2025, 2, 15, 6), method: 'Karachi' })[0]
    expect(a.times).toEqual(b.times)
  })
})

describe('reminder names', () => {
  it('are available in en / bn / ar for every key', () => {
    for (const k of REMINDER_KEYS) {
      const n = REMINDER_NAMES[k]
      expect(n.en && n.bn && n.ar, k).toBeTruthy()
      expect(n.bn).toMatch(/[ঀ-৿]/)
      expect(n.ar).toMatch(/[؀-ۿ]/)
    }
  })
})
