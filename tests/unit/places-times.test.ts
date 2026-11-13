// The server's own zone must not influence a city's day: run under a zone far from Dhaka.
process.env.TZ = 'America/Los_Angeles'
import { describe, it, expect } from 'vitest'
import { cityBySlug } from '@/lib/places/cities'
import { cityDay, cityToday, citySpan, zonedYmd, ymdKey, fmtClock, clock24, parseYmd, addDays } from '@/lib/places/times'

/** Independent reference: NOAA solar-position equations (Meeus), no adhan involved. Returns minutes after UTC midnight. */
const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI
function sun(jd: number) {
  const T = (jd - 2451545) / 36525
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T)
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T)
  const C = Math.sin(rad(M)) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * T) + Math.sin(rad(3 * M)) * 0.000289
  const om = 125.04 - 1934.136 * T
  const lam = L0 + C - 0.00569 - 0.00478 * Math.sin(rad(om))
  const eps = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(rad(om))
  const decl = Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lam)))
  const y = Math.tan(rad(eps) / 2) ** 2
  const eqt = 4 * deg(y * Math.sin(2 * rad(L0)) - 2 * e * Math.sin(rad(M)) + 4 * e * y * Math.sin(rad(M)) * Math.cos(2 * rad(L0)) - 0.5 * y * y * Math.sin(4 * rad(L0)) - 1.25 * e * e * Math.sin(2 * rad(M)))
  return { decl, eqt }
}
function reference(lat: number, lon: number, y: number, m: number, d: number) {
  const jd0 = Date.UTC(y, m - 1, d) / 864e5 + 2440587.5
  let noon = 720 - 4 * lon
  for (let i = 0; i < 3; i++) noon = 720 - 4 * lon - sun(jd0 + noon / 1440).eqt
  const { decl } = sun(jd0 + noon / 1440)
  const phi = rad(lat)
  const H = (alt: number) => deg(Math.acos((Math.sin(rad(alt)) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl))))
  const asrAlt = deg(Math.atan(1 / (2 + Math.tan(Math.abs(phi - decl)))))
  return { fajr: noon - 4 * H(-18), sunrise: noon - 4 * H(-0.833), dhuhr: noon, asr: noon + 4 * H(asrAlt), maghrib: noon + 4 * H(-0.833), isha: noon + 4 * H(-18) }
}
const mins = (ms: number, tz: string) => { const [h, m] = clock24(ms, tz).split(':').map(Number); return h * 60 + m }

describe('city prayer times — Dhaka (Karachi method, Hanafi Asr) vs an independent NOAA calculation', () => {
  const dhaka = cityBySlug('dhaka')!
  const OFFSET = 360 // Asia/Dhaka = UTC+6, no DST
  for (const date of ['2026-01-15', '2026-03-20', '2026-06-21', '2026-09-22', '2026-11-13', '2026-12-21', '2027-02-08']) {
    it(`${date}: every time within ±2 min`, () => {
      const ymd = parseYmd(date)!
      const day = cityDay(dhaka, ymd)
      const ref = reference(dhaka.lat, dhaka.lng, ymd.y, ymd.m, ymd.d)
      for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) {
        const got = mins(day[k], dhaka.tz)
        const want = Math.round(ref[k] + OFFSET)
        expect(Math.abs(got - want), `${date} ${k}: got ${got} want ${want}`).toBeLessThanOrEqual(2)
      }
    })
  }

  it('Hanafi Asr is later than the standard Asr, and the day is ordered', () => {
    const d = cityDay(dhaka, { y: 2026, m: 11, d: 13 })
    expect(d.asrHanafi).toBeGreaterThan(d.asrStandard)
    expect(d.asr).toBe(d.asrHanafi)
    expect(d.fajr).toBeLessThan(d.sunrise)
    expect(d.sunrise).toBeLessThan(d.dhuhr)
    expect(d.dhuhr).toBeLessThan(d.asr)
    expect(d.asr).toBeLessThan(d.maghrib)
    expect(d.maghrib).toBeLessThan(d.isha)
    expect(d.weekday).toBe(5) // 13 Nov 2026 is a Friday
    expect(d.friday).toBe(true)
    expect(cityDay(dhaka, { y: 2026, m: 11, d: 14 }).friday).toBe(false)
  })

  it('formats clock times in the city zone (English 12 h, Bangla period + digits)', () => {
    const d = cityDay(dhaka, { y: 2026, m: 11, d: 13 })
    expect(fmtClock(d.fajr, dhaka.tz)).toMatch(/^4:5\d AM$/)
    expect(fmtClock(d.maghrib, dhaka.tz)).toMatch(/^5:\d\d PM$/)
    expect(fmtClock(d.fajr, dhaka.tz, 'bn')).toMatch(/^ভোর ৪:৫[০-৯]$/)
  })
})

describe('"today" is the city’s calendar day, not the server’s', () => {
  it('rolls over at local midnight — across UTC midnight', () => {
    // 2026-11-12 19:00 UTC = 2026-11-13 01:00 in Dhaka (UTC+6) but still the 12th in London / New York
    const t = Date.UTC(2026, 10, 12, 19, 0)
    expect(ymdKey(zonedYmd(t, 'Asia/Dhaka'))).toBe('2026-11-13')
    expect(ymdKey(zonedYmd(t, 'Europe/London'))).toBe('2026-11-12')
    expect(ymdKey(zonedYmd(t, 'America/New_York'))).toBe('2026-11-12')
    // 2026-11-13 00:30 UTC = still the 12th in New York (UTC-5)
    expect(ymdKey(zonedYmd(Date.UTC(2026, 10, 13, 0, 30), 'America/New_York'))).toBe('2026-11-12')
    // 2026-11-12 18:00 UTC is 23:30 NPT in Kathmandu-like +5:45, but midnight not yet reached in Dhaka? (00:00 on the 13th)
    expect(ymdKey(zonedYmd(Date.UTC(2026, 10, 12, 17, 59), 'Asia/Dhaka'))).toBe('2026-11-12')
    expect(ymdKey(zonedYmd(Date.UTC(2026, 10, 12, 18, 0), 'Asia/Dhaka'))).toBe('2026-11-13')
  })

  it('cityToday + citySpan start on the city’s date and are independent of the process TZ (LA here)', () => {
    const dhaka = cityBySlug('dhaka')!
    const now = Date.UTC(2026, 10, 12, 19, 0) // 12 Nov in Los Angeles, 13 Nov in Dhaka
    const today = cityToday(dhaka, now)
    expect(ymdKey(today)).toBe('2026-11-13')
    const [d0, d1] = citySpan(dhaka, today, 2)
    expect(d0.date).toBe('2026-11-13')
    expect(d1.date).toBe('2026-11-14')
    // Fajr on the 13th at Dhaka is before sunrise on the Dhaka 13th (≈ 04:53 local = 22:53 UTC on the 12th)
    expect(new Date(d0.fajr).toISOString().slice(0, 13)).toBe('2026-11-12T22')
  })

  it('handles DST cities: London in summer is UTC+1', () => {
    const london = cityBySlug('london')!
    const d = cityDay(london, { y: 2026, m: 7, d: 1 })
    expect(clock24(d.dhuhr, london.tz)).toMatch(/^13:0\d$/)
    expect(addDays({ y: 2026, m: 12, d: 31 }, 1)).toEqual({ y: 2027, m: 1, d: 1 })
  })
})
