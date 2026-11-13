import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan'
import type { City } from './cities'

/** A calendar date in a city's own calendar (not the server's). */
export interface Ymd { y: number; m: number; d: number }

const pad = (n: number) => String(n).padStart(2, '0')
export const ymdKey = ({ y, m, d }: Ymd) => `${y}-${pad(m)}-${pad(d)}`
export const parseYmd = (s: string): Ymd | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const r = { y: +m[1], m: +m[2], d: +m[3] }
  const t = new Date(Date.UTC(r.y, r.m - 1, r.d))
  return t.getUTCFullYear() === r.y && t.getUTCMonth() === r.m - 1 && t.getUTCDate() === r.d ? r : null
}

/** The calendar date at instant `ms` in time zone `tz` — this is "today" for a city (never the server's UTC date). */
export function zonedYmd(ms: number, tz: string): Ymd {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(ms).map((x) => [x.type, x.value]))
  return { y: +p.year, m: +p.month, d: +p.day }
}

export function addDays(v: Ymd, n: number): Ymd {
  const t = new Date(Date.UTC(v.y, v.m - 1, v.d + n))
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}
/** 0 = Sunday … 6 = Saturday */
export const weekdayOf = (v: Ymd) => new Date(Date.UTC(v.y, v.m - 1, v.d)).getUTCDay()
export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()
export const cmpYmd = (a: Ymd, b: Ymd) => Date.UTC(a.y, a.m - 1, a.d) - Date.UTC(b.y, b.m - 1, b.d)

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

/* ───────── formatting ───────── */

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
export const bnDigits = (s: string | number) => String(s).replace(/\d/g, (d) => BN_DIGITS[+d])

function hm(ms: number, tz: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(ms).map((x) => [x.type, x.value]))
  return { h: +p.hour, m: +p.minute }
}
const bnPeriod = (h: number) => (h >= 4 && h < 6 ? 'ভোর' : h >= 6 && h < 12 ? 'সকাল' : h >= 12 && h < 15 ? 'দুপুর' : h >= 15 && h < 17 ? 'বিকাল' : h >= 17 && h < 19 ? 'সন্ধ্যা' : 'রাত')

/** "5:12 AM" (en) · "ভোর ৫:১২" (bn). Use `clock24` for the 24-hour form used in CSV / ICS. */
export function fmtClock(ms: number, tz: string, locale: 'en' | 'bn' = 'en') {
  const { h, m } = hm(ms, tz)
  const h12 = h % 12 === 0 ? 12 : h % 12
  if (locale === 'bn') return `${bnPeriod(h)} ${bnDigits(`${h12}:${pad(m)}`)}`
  return `${h12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`
}
/** Numeric part only ("5:12") plus the suffix, for tight table cells. */
export function clockParts(ms: number, tz: string, locale: 'en' | 'bn' = 'en') {
  const { h, m } = hm(ms, tz)
  const h12 = h % 12 === 0 ? 12 : h % 12
  const t = `${h12}:${pad(m)}`
  return locale === 'bn' ? { time: bnDigits(t), suffix: bnPeriod(h) } : { time: t, suffix: h < 12 ? 'AM' : 'PM' }
}
export const clock24 = (ms: number, tz: string) => {
  const { h, m } = hm(ms, tz)
  return `${pad(h)}:${pad(m)}`
}

export const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
}
export const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  bn: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
}
export const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

export function fmtDate(v: Ymd, locale: 'en' | 'bn' = 'en', o: { weekday?: boolean; year?: boolean } = {}) {
  const wd = o.weekday ? WEEKDAYS[locale][weekdayOf(v)] + ', ' : ''
  const yr = o.year === false ? '' : locale === 'bn' ? ` ${bnDigits(v.y)}` : ` ${v.y}`
  return locale === 'bn' ? `${wd}${bnDigits(v.d)} ${MONTHS.bn[v.m - 1]}${yr}` : `${wd}${v.d} ${MONTHS.en[v.m - 1]}${yr}`
}
export const fmtMonth = (y: number, m: number, locale: 'en' | 'bn' = 'en') => (locale === 'bn' ? `${MONTHS.bn[m - 1]} ${bnDigits(y)}` : `${MONTHS.en[m - 1]} ${y}`)
