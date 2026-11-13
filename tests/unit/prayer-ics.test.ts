process.env.TZ = 'UTC'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { buildPrayerIcs } from '@/lib/prayer/ics'
import { REMINDER_KEYS, type ReminderKey } from '@/lib/prayer/times'
import type { ReminderCfg } from '@/lib/stores/prayer'

const DHAKA = { lat: 23.8103, lon: 90.4125, method: 'Karachi', madhab: 'hanafi' as const, tz: 'Asia/Dhaka', city: 'Dhaka' }
const cfgs = (on: ReminderKey[] = [], before = 0) => Object.fromEntries(REMINDER_KEYS.map((k) => [k, { on: on.includes(k), before, sound: 'chime' }])) as Record<ReminderKey, ReminderCfg>
const enc = new TextEncoder()
const unfold = (s: string) => s.replace(/\r\n[ \t]/g, '')
const lines = (s: string) => unfold(s).split('\r\n').filter(Boolean)

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-03-10T00:00:00Z')) // Mon 10 Mar 2025 06:00 in Dhaka
})
afterAll(() => vi.useRealTimers())

describe('buildPrayerIcs', () => {
  let ics = ''
  let L: string[] = []
  beforeAll(() => {
    ics = buildPrayerIcs({ ...DHAKA, reminders: cfgs(), days: 7 })
    L = lines(ics)
  })

  it('is one well-formed VCALENDAR', () => {
    expect(L[0]).toBe('BEGIN:VCALENDAR')
    expect(L[L.length - 1]).toBe('END:VCALENDAR')
    expect(L.filter((l) => l === 'BEGIN:VCALENDAR')).toHaveLength(1)
    expect(L).toContain('VERSION:2.0')
    expect(L.some((l) => l.startsWith('PRODID:'))).toBe(true)
    expect(L).toContain('X-WR-TIMEZONE:Asia/Dhaka')
  })

  it('has balanced BEGIN/END pairs with 5 VEVENTs per day (+ Sunrise / Tahajjud only when enabled)', () => {
    for (const c of ['VCALENDAR', 'VEVENT', 'VALARM']) expect(L.filter((l) => l === `BEGIN:${c}`).length).toBe(L.filter((l) => l === `END:${c}`).length)
    expect(L.filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(7 * 5)
    expect(L.filter((l) => l === 'BEGIN:VALARM')).toHaveLength(7 * 5)
    const more = lines(buildPrayerIcs({ ...DHAKA, reminders: cfgs(['sunrise', 'tahajjud']), days: 7 }))
    expect(more.filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(7 * 7)
    expect(more.filter((l) => l === 'BEGIN:VALARM')).toHaveLength(7 * 7)
  })

  it('nests every VALARM inside a VEVENT, exactly one each', () => {
    let depth: string[] = []
    let alarms = 0
    let perEvent = 0
    for (const l of L) {
      if (l.startsWith('BEGIN:')) { depth.push(l.slice(6)); if (l === 'BEGIN:VEVENT') perEvent = 0 }
      else if (l.startsWith('END:')) {
        expect(depth.pop()).toBe(l.slice(4))
        if (l === 'END:VEVENT') expect(perEvent).toBe(1)
      }
      if (l === 'BEGIN:VALARM') { alarms++; perEvent++; expect(depth).toEqual(['VCALENDAR', 'VEVENT', 'VALARM']) }
    }
    expect(depth).toEqual([])
    expect(alarms).toBe(35)
  })

  it('uses CRLF line endings only (no bare LF or CR) and ends with CRLF', () => {
    expect(ics.endsWith('\r\n')).toBe(true)
    expect(/(?<!\r)\n/.test(ics)).toBe(false)
    expect(/\r(?!\n)/.test(ics)).toBe(false)
  })

  it('folds every physical line to ≤ 75 octets (UTF-8), also for Bangla / Arabic text', () => {
    for (const lang of ['en', 'bn', 'ar'] as const) {
      const out = buildPrayerIcs({ ...DHAKA, city: 'ঢাকা، বাংলাদেশ — মিরপুর, আজিমপুর; ধানমন্ডি ও গুলশান এলাকা (লম্বা নাম)', reminders: cfgs(['fajr'], 10), days: 3, lang })
      const physical = out.split('\r\n')
      expect(Math.max(...physical.map((l) => enc.encode(l).length))).toBeLessThanOrEqual(75)
      // unfolding restores only valid property lines
      for (const l of lines(out)) expect(l).toMatch(/^[A-Z][A-Z-]*[:;]|^(BEGIN|END):/)
    }
  })

  it('never splits a multi-byte character when folding', () => {
    const out = buildPrayerIcs({ ...DHAKA, city: 'ঢ'.repeat(60), reminders: cfgs(), days: 1, lang: 'bn' })
    expect(unfold(out)).toContain('X-WR-CALNAME:নামাজের সময় — ' + 'ঢ'.repeat(60))
    expect(out).not.toContain('�')
  })

  it('writes DTSTART / DTEND / DTSTAMP in UTC and the right instants', () => {
    const starts = L.filter((l) => l.startsWith('DTSTART:'))
    expect(starts).toHaveLength(35)
    for (const l of [...starts, ...L.filter((x) => x.startsWith('DTEND:') || x.startsWith('DTSTAMP:'))]) expect(l).toMatch(/^DT(START|END|STAMP):\d{8}T\d{6}Z$/)
    expect(L).toContain('DTSTAMP:20250310T000000Z')
    // first event: Fajr of 10 Mar in Dhaka (04:57, UTC+6) = 22:57Z the evening before
    expect(starts[0].slice(8, 17)).toBe('20250309T')
    const t = (l: string) => { const v = l.split(':')[1]; return Date.UTC(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8), +v.slice(9, 11), +v.slice(11, 13)) }
    expect(Math.abs(t(starts[0]) - Date.UTC(2025, 2, 9, 22, 57))).toBeLessThanOrEqual(2 * 60_000)
    // DTEND follows DTSTART by 15 minutes for prayers (5 for sunrise / tahajjud)
    const ends = L.filter((l) => l.startsWith('DTEND:'))
    expect(t(ends[0]) - t(starts[0])).toBe(15 * 60_000)
  })

  it('has unique UIDs and a summary / alarm per event', () => {
    const uids = L.filter((l) => l.startsWith('UID:'))
    expect(new Set(uids).size).toBe(uids.length)
    expect(uids[0]).toBe(`UID:2025-03-10-fajr-${(23.8103).toFixed(3)}-${(90.4125).toFixed(3)}@noor-quran`)
    expect(L.filter((l) => l.startsWith('SUMMARY:')).slice(0, 5)).toEqual(['SUMMARY:Fajr', 'SUMMARY:Dhuhr', 'SUMMARY:Asr', 'SUMMARY:Maghrib', 'SUMMARY:Isha'])
    expect(L.filter((l) => l.startsWith('TRIGGER:')).every((l) => l === 'TRIGGER:PT0S')).toBe(true)
  })

  it('applies lead times as negative TRIGGER durations', () => {
    const t = lines(buildPrayerIcs({ ...DHAKA, reminders: cfgs(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'], 15), days: 1 }))
    expect(t.filter((l) => l.startsWith('TRIGGER:'))).toEqual(Array(5).fill('TRIGGER:-PT15M'))
    expect(t).toContain('DESCRIPTION:Fajr in 15 min')
  })

  it('replaces Dhuhr by Jumu’ah on Fridays', () => {
    const fri = lines(buildPrayerIcs({ ...DHAKA, reminders: cfgs(['jumuah']), days: 7 }))
    const summaries = fri.filter((l) => l.startsWith('SUMMARY:'))
    expect(summaries.filter((s) => s === 'SUMMARY:Jumu’ah')).toHaveLength(1)
    expect(summaries.filter((s) => s === 'SUMMARY:Dhuhr')).toHaveLength(6)
  })

  it('localises names (bn / ar) and the alarm text', () => {
    const bn = lines(buildPrayerIcs({ ...DHAKA, reminders: cfgs(['fajr'], 10), days: 1, lang: 'bn' }))
    expect(bn).toContain('SUMMARY:ফজর')
    expect(bn).toContain('DESCRIPTION:10 মিনিট পর ফজর')
    expect(bn.find((l) => l.startsWith('X-WR-CALNAME:'))).toBe('X-WR-CALNAME:নামাজের সময় — Dhaka')
    const ar = lines(buildPrayerIcs({ ...DHAKA, reminders: cfgs(['fajr'], 10), days: 1, lang: 'ar' }))
    expect(ar).toContain('SUMMARY:الفجر')
    expect(ar).toContain('DESCRIPTION:الفجر بعد 10 دقيقة')
    expect(ar.find((l) => l.startsWith('X-WR-CALNAME:'))).toContain('مواقيت الصلاة')
  })

  it('escapes commas, semicolons, backslashes and newlines in text values', () => {
    const out = lines(buildPrayerIcs({ ...DHAKA, city: 'A; B, C\\D\nE', reminders: cfgs(), days: 1 }))
    expect(out.find((l) => l.startsWith('X-WR-CALNAME:'))).toBe('X-WR-CALNAME:Prayer times — A\\; B\\, C\\\\D\\nE')
    expect(out.find((l) => l.startsWith('LOCATION:'))).toBe('LOCATION:A\\; B\\, C\\\\D\\nE')
  })

  it('falls back to coordinates when there is no city', () => {
    const out = lines(buildPrayerIcs({ ...DHAKA, city: null, reminders: cfgs(), days: 1 }))
    expect(out.find((l) => l.startsWith('LOCATION:'))).toBe('LOCATION:23.810\\, ' + (90.4125).toFixed(3))
  })
})

describe('buildPrayerIcs text escaping', () => {
  it('escapes ; , \\ and newlines in names and locations', () => {
    const ics = buildPrayerIcs({ ...DHAKA, city: 'A;B,C\\D\nE\r\nF', reminders: cfgs(), days: 1 })
    const L = lines(ics)
    const want = 'A\\;B\\,C\\\\D\\nE\\nF'
    expect(L.find((l) => l.startsWith('X-WR-CALNAME:'))).toBe(`X-WR-CALNAME:Prayer times — ${want}`)
    expect(L.find((l) => l.startsWith('LOCATION:'))).toBe(`LOCATION:${want}`)
    expect(L.find((l) => l.startsWith('DESCRIPTION:Fajr'))).toContain(`Fajr · ${want} · Karachi / Hanafi`)
    for (const l of L.filter((x) => /^(SUMMARY|LOCATION|DESCRIPTION|X-WR-CALNAME):/.test(x))) {
      const v = l.slice(l.indexOf(':') + 1)
      expect(v).not.toMatch(/[\r\n]/)
      expect(v.replace(/\\./g, '')).not.toMatch(/[;\\]/)
    }
    // the default "lat, lon" location contains a comma, which must be escaped as well
    const plain = lines(buildPrayerIcs({ ...DHAKA, city: null, reminders: cfgs(), days: 1 }))
    expect(plain.find((l) => l.startsWith('LOCATION:'))).toBe('LOCATION:23.810\\, 90.412')
  })
})
