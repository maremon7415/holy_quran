process.env.TZ = 'UTC'
import { describe, it, expect } from 'vitest'
import { buildReminders } from '@/lib/prayer/reminders'
import { computeSchedule, REMINDER_KEYS, type ReminderKey } from '@/lib/prayer/times'
import type { ReminderCfg } from '@/lib/stores/prayer'

const DHAKA = { lat: 23.8103, lon: 90.4125, method: 'Karachi', madhab: 'hanafi' as const, tz: 'Asia/Dhaka' }
const NYC = { lat: 40.7128, lon: -74.006, method: 'NorthAmerica', madhab: 'shafi' as const, tz: 'America/New_York' }

const cfgs = (on: ReminderKey[], over: Partial<Record<ReminderKey, Partial<ReminderCfg>>> = {}) =>
  Object.fromEntries(REMINDER_KEYS.map((k) => [k, { on: on.includes(k), before: 0, sound: 'chime', ...over[k] }])) as Record<ReminderKey, ReminderCfg>
const SOON = Date.UTC(2025, 2, 10, 0, 0) // Mon 10 Mar 2025 06:00 Dhaka

describe('buildReminders', () => {
  it('only emits enabled reminders, sorted by fire time with stable ids', () => {
    const early = Date.UTC(2025, 2, 9, 20) // 02:00 Mon 10 Mar in Dhaka, before the day’s Fajr
    const items = buildReminders({ ...DHAKA, now: early, days: 2, reminders: cfgs(['fajr', 'maghrib']) })
    expect(items.map((i) => i.key)).toEqual(['fajr', 'maghrib', 'fajr', 'maghrib'])
    expect(items.map((i) => i.id.slice(0, 10))).toEqual(['2025-03-10', '2025-03-10', '2025-03-11', '2025-03-11'])
    expect(items.every((i, n) => n === 0 || items[n - 1].fireAt <= i.fireAt)).toBe(true)
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
    expect(items[0].id).toMatch(/^\d{4}-\d{2}-\d{2}-fajr-0$/)
  })

  it('fires `before` minutes ahead of the prayer and says so in the text', () => {
    const [a] = buildReminders({ ...DHAKA, now: SOON, days: 1, reminders: cfgs(['maghrib'], { maghrib: { before: 10 } }) })
    expect(a.at - a.fireAt).toBe(10 * 60_000)
    expect(a.before).toBe(10)
    expect(a.text.en[0]).toBe('Maghrib in 10 min')
    expect(a.text.bn[0]).toBe('১০ মিনিট পর মাগরিব')
    expect(a.text.ar[0]).toContain('المغرب')
    expect(a.text.ar[0]).toContain('10')
  })

  it('formats the clock time per language and appends the city', () => {
    const [a] = buildReminders({ ...DHAKA, now: SOON, days: 1, city: 'Dhaka', reminders: cfgs(['asr']) })
    expect(a.text.en[0]).toBe('Time for Asr')
    expect(a.text.en[1]).toMatch(/^Asr · \d{1,2}:\d{2}\s?[AP]M · Dhaka$/)
    expect(a.text.bn[1]).toMatch(/^আসর · [০-৯]+:[০-৯]{2}.* · Dhaka$/)
    expect(a.text.bn[0]).toBe('আসর নামাজের সময় হয়েছে')
    expect(a.text.ar[0]).toBe('حان وقت العصر')
    expect(a.text.ar[1]).toMatch(/^العصر · \d{1,2}:\d{2} [صم] · Dhaka$/)
  })

  it('drops reminders that fired more than 30 minutes ago but keeps ones within the grace window', () => {
    const fajr = computeSchedule({ ...DHAKA, days: 1, from: SOON })[0].times.fajr
    const keep = buildReminders({ ...DHAKA, now: fajr + 29 * 60_000, days: 1, reminders: cfgs(['fajr']) })
    const drop = buildReminders({ ...DHAKA, now: fajr + 31 * 60_000, days: 1, reminders: cfgs(['fajr']) })
    expect(keep).toHaveLength(1)
    expect(drop).toHaveLength(0)
  })

  describe('Jumu’ah', () => {
    const fri = Date.UTC(2025, 2, 13, 18) // Thu 18:00 UTC = Fri 00:00 Dhaka… the schedule starts at the location's Friday
    const reminders = cfgs(['dhuhr', 'jumuah'])
    it('replaces Dhuhr on Fridays only', () => {
      const items = buildReminders({ ...DHAKA, now: fri, days: 9, reminders })
      const byDate = new Map<string, string[]>()
      for (const i of items) byDate.set(i.id.slice(0, 10), [...(byDate.get(i.id.slice(0, 10)) ?? []), i.key])
      expect(byDate.get('2025-03-14')).toEqual(['jumuah'])
      expect(byDate.get('2025-03-15')).toEqual(['dhuhr'])
      expect(byDate.get('2025-03-20')).toEqual(['dhuhr'])
      expect(byDate.get('2025-03-21')).toEqual(['jumuah'])
    })
    it('keeps Dhuhr on Fridays when the Jumu’ah reminder is off', () => {
      const items = buildReminders({ ...DHAKA, now: fri, days: 1, reminders: cfgs(['dhuhr']) })
      expect(items.map((i) => i.key)).toEqual(['dhuhr'])
    })
    it('never emits Jumu’ah on other days', () => {
      const items = buildReminders({ ...DHAKA, now: SOON, days: 4, reminders: cfgs(['jumuah']) }) // Mon–Thu
      expect(items).toHaveLength(0)
    })
  })

  describe('Tahajjud and Sunrise', () => {
    it('uses their own copy', () => {
      const items = buildReminders({ ...DHAKA, now: SOON, days: 1, reminders: cfgs(['tahajjud', 'sunrise']) })
      const t = items.find((i) => i.key === 'tahajjud')!
      const s = items.find((i) => i.key === 'sunrise')!
      expect(t.text.en[0]).toBe('Tahajjud — last third of the night')
      expect(t.text.en[1]).toContain('last third of the night begins')
      expect(t.text.bn[0]).toContain('তাহাজ্জুদ')
      expect(t.text.ar[0]).toContain('التهجد')
      expect(s.text.en[0]).toBe('Sunrise')
      expect(s.text.ar[0]).toBe('الشروق')
    })
    it('schedules Tahajjud after the same day’s Isha (the night that follows the day)', () => {
      const [d] = computeSchedule({ ...DHAKA, days: 1, from: SOON })
      const [t] = buildReminders({ ...DHAKA, now: SOON, days: 1, reminders: cfgs(['tahajjud']) })
      expect(t.at).toBe(d.times.tahajjud)
      expect(t.at).toBeGreaterThan(d.times.isha)
    })
  })

  describe('daylight saving time (America/New_York, spring forward on 2025-03-09)', () => {
    const now = Date.UTC(2025, 2, 8, 12) // Sat 8 Mar, 07:00 EST
    const items = buildReminders({ ...NYC, now, days: 3, reminders: cfgs(['fajr', 'dhuhr', 'isha']) })
    const local = (ms: number) => new Intl.DateTimeFormat('en-GB', { timeZone: NYC.tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(ms)
    it('has one entry per prayer per calendar day (the missing hour does not drop or duplicate a day)', () => {
      expect(items.filter((i) => i.key === 'dhuhr').map((i) => i.id.slice(0, 10))).toEqual(['2025-03-08', '2025-03-09', '2025-03-10'])
    })
    it('keeps consecutive Dhuhr instants ~24 h apart in absolute time (no ±1 h glitch) while the local clock jumps by one hour', () => {
      const d = items.filter((i) => i.key === 'dhuhr')
      for (let i = 1; i < d.length; i++) expect(Math.abs(d[i].at - d[i - 1].at - 86_400_000)).toBeLessThan(5 * 60_000)
      const h = d.map((x) => +local(x.at).slice(0, 2))
      expect(h[0]).toBeLessThanOrEqual(12) // EST
      expect(h[2]).toBeGreaterThanOrEqual(12) // EDT: same solar noon, one hour later on the wall clock
      expect(+local(d[2].at).slice(0, 2) * 60 + +local(d[2].at).slice(3)).toBeGreaterThan(+local(d[0].at).slice(0, 2) * 60 + +local(d[0].at).slice(3) + 45)
    })
    it('formats the notification text in the location’s zone', () => {
      const dh = items.find((i) => i.key === 'dhuhr' && i.id.startsWith('2025-03-10'))!
      const hh = +local(dh.at).slice(0, 2)
      const shown = dh.text.en[1].match(/(\d{1,2}):\d{2}/)![1]
      expect(+shown).toBe(hh > 12 ? hh - 12 : hh)
    })
  })
})
