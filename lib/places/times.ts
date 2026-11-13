import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan'
import type { City } from './cities'
import { addDays, weekdayOf, ymdKey, zonedYmd, type Ymd } from './dates'

export * from './dates'

function params(method: string, madhab: 'shafi' | 'hanafi') {
  const fn = (CalculationMethod as Record<string, () => ReturnType<typeof CalculationMethod.Karachi>>)[method] ?? CalculationMethod.Karachi
  const p = fn()
  p.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi
  return p
}

export interface CityDay {
  date: string
  ymd: Ymd
  /** 0 = Sunday */
  weekday: number
  friday: boolean
  /** epoch ms, rounded to the minute by adhan */
  fajr: number
  sunrise: number
  dhuhr: number
  /** Asr by the city's default madhab */
  asr: number
  asrStandard: number
  asrHanafi: number
  maghrib: number
  isha: number
}

export type SlotKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

/**
 * Prayer times for `ymd` as the city's local calendar day. adhan reads the year/month/day of the Date it is given
 * in the process's local zone, so we pass local *noon* of that date — correct whatever TZ the server runs in.
 */
export function cityDay(city: Pick<City, 'lat' | 'lng' | 'method' | 'madhab'>, ymd: Ymd, o?: { method?: string; madhab?: 'shafi' | 'hanafi' }): CityDay {
  const method = o?.method ?? city.method
  const madhab = o?.madhab ?? city.madhab
  const at = new Date(ymd.y, ymd.m - 1, ymd.d, 12)
  const coords = new Coordinates(city.lat, city.lng)
  const std = new PrayerTimes(coords, at, params(method, 'shafi'))
  const han = new PrayerTimes(coords, at, params(method, 'hanafi'))
  const main = madhab === 'hanafi' ? han : std
  const wd = weekdayOf(ymd)
  return {
    date: ymdKey(ymd), ymd, weekday: wd, friday: wd === 5,
    fajr: main.fajr.getTime(), sunrise: main.sunrise.getTime(), dhuhr: main.dhuhr.getTime(),
    asr: main.asr.getTime(), asrStandard: std.asr.getTime(), asrHanafi: han.asr.getTime(),
    maghrib: main.maghrib.getTime(), isha: main.isha.getTime(),
  }
}

export const cityToday = (city: City, now = Date.now()) => zonedYmd(now, city.tz)

/** `n` consecutive days starting at `from`. */
export function citySpan(city: City, from: Ymd, n: number, o?: Parameters<typeof cityDay>[2]): CityDay[] {
  return Array.from({ length: n }, (_, i) => cityDay(city, addDays(from, i), o))
}

export const SLOTS: SlotKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

