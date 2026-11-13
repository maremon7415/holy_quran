import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan'

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
/** Everything a reminder can be attached to. `jumuah` replaces dhuhr on Fridays; `tahajjud` = start of the last third of the night. */
export type ReminderKey = PrayerKey | 'jumuah' | 'tahajjud'

export const REMINDER_KEYS: ReminderKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah', 'tahajjud']
export const REMINDER_NAMES: Record<ReminderKey, { en: string; bn: string; ar: string }> = {
  fajr: { en: 'Fajr', bn: 'ফজর', ar: 'الفجر' },
  sunrise: { en: 'Sunrise', bn: 'সূর্যোদয়', ar: 'الشروق' },
  dhuhr: { en: 'Dhuhr', bn: 'যোহর', ar: 'الظهر' },
  asr: { en: 'Asr', bn: 'আসর', ar: 'العصر' },
  maghrib: { en: 'Maghrib', bn: 'মাগরিব', ar: 'المغرب' },
  isha: { en: 'Isha', bn: 'এশা', ar: 'العشاء' },
  jumuah: { en: 'Jumu’ah', bn: 'জুমা', ar: 'الجمعة' },
  tahajjud: { en: 'Tahajjud', bn: 'তাহাজ্জুদ', ar: 'التهجد' },
}

export function computeDay(lat: number, lon: number, date: Date, method: string, madhab: 'shafi' | 'hanafi') {
  const fn = (CalculationMethod as Record<string, () => ReturnType<typeof CalculationMethod.Karachi>>)[method] ?? CalculationMethod.Karachi
  const params = fn()
  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi
  return new PrayerTimes(new Coordinates(lat, lon), date, params)
}

/** Calendar date (y/m/d + weekday) of an instant in `tz` (or the device zone). */
export function dayParts(ms: number, tz?: string | null) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz ?? undefined, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(ms).map((x) => [x.type, x.value]))
  return { y: +p.year, m: +p.month, d: +p.day }
}

export interface DayTimes {
  /** yyyy-mm-dd in the location's calendar */
  date: string
  friday: boolean
  times: Record<ReminderKey, number>
}

/** Prayer times for `days` consecutive calendar days starting at the location's "today" (same date logic as the prayer page). */
export function computeSchedule(opts: { lat: number; lon: number; method: string; madhab: 'shafi' | 'hanafi'; tz?: string | null; days: number; from?: number }): DayTimes[] {
  const { y, m, d } = dayParts(opts.from ?? Date.now(), opts.tz)
  const out: DayTimes[] = []
  let cur = computeDay(opts.lat, opts.lon, new Date(y, m - 1, d), opts.method, opts.madhab)
  for (let i = 0; i < opts.days; i++) {
    const next = computeDay(opts.lat, opts.lon, new Date(y, m - 1, d + i + 1), opts.method, opts.madhab)
    const maghrib = cur.maghrib.getTime()
    const night = next.fajr.getTime() - maghrib
    const cal = new Date(Date.UTC(y, m - 1, d + i))
    out.push({
      date: `${cal.getUTCFullYear()}-${String(cal.getUTCMonth() + 1).padStart(2, '0')}-${String(cal.getUTCDate()).padStart(2, '0')}`,
      friday: cal.getUTCDay() === 5,
      times: {
        fajr: cur.fajr.getTime(),
        sunrise: cur.sunrise.getTime(),
        dhuhr: cur.dhuhr.getTime(),
        jumuah: cur.dhuhr.getTime(),
        asr: cur.asr.getTime(),
        maghrib,
        isha: cur.isha.getTime(),
        tahajjud: Math.round(maghrib + (night * 2) / 3),
      },
    })
    cur = next
  }
  return out
}
