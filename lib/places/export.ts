import type { City } from './cities'
import { citySpan, clock24, daysInMonth, MONTHS, type CityDay } from './times'

const pad = (n: number) => String(n).padStart(2, '0')

export function monthDays(city: City, y: number, m: number): CityDay[] {
  return citySpan(city, { y, m, d: 1 }, daysInMonth(y, m))
}

/** CSV with local clock times (24 h) — one row per day. */
export function monthCsv(city: City, y: number, m: number): string {
  const rows = monthDays(city, y, m)
  const head = ['Date', 'Day', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
  const asr = city.madhab === 'hanafi' ? ['Asr (Hanafi)', 'Asr (Shafi/Standard)'] : ['Asr']
  const lines = [[...head.slice(0, 5), ...asr, ...head.slice(6)].join(',')]
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  for (const d of rows) {
    const a = city.madhab === 'hanafi' ? [clock24(d.asrHanafi, city.tz), clock24(d.asrStandard, city.tz)] : [clock24(d.asr, city.tz)]
    lines.push([d.date, wd[d.weekday], clock24(d.fajr, city.tz), clock24(d.sunrise, city.tz), clock24(d.dhuhr, city.tz), ...a, clock24(d.maghrib, city.tz), clock24(d.isha, city.tz)].join(','))
  }
  return lines.join('\r\n') + '\r\n'
}

const z = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
/** RFC 5545 line folding at 75 octets (UTF-8 aware). */
function fold(line: string) {
  const enc = new TextEncoder()
  if (enc.encode(line).length <= 75) return line
  const out: string[] = []
  let cur = ''
  let bytes = 0
  for (const ch of line) {
    const b = enc.encode(ch).length
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0 }
    cur += ch
    bytes += b
  }
  out.push(cur)
  return out.join('\r\n ')
}
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r\n|\r|\n/g, '\\n')

/** iCalendar file with an event per prayer (no alarms). Times are UTC instants, so any calendar app shows them in the viewer's zone. */
export function monthIcs(city: City, y: number, m: number, stamp = Date.now()): string {
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Noor Quran//City prayer times//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${esc(`Prayer times — ${city.name.en} — ${MONTHS.en[m - 1]} ${y}`)}`, `X-WR-TIMEZONE:${city.tz}`]
  const names: [keyof CityDay, string][] = [['fajr', 'Fajr'], ['sunrise', 'Sunrise'], ['dhuhr', 'Dhuhr'], ['asr', 'Asr'], ['maghrib', 'Maghrib'], ['isha', 'Isha']]
  for (const d of monthDays(city, y, m)) {
    for (const [k, nm] of names) {
      const start = d[k] as number
      const name = k === 'dhuhr' && d.friday ? 'Dhuhr (Jumu’ah)' : nm
      L.push('BEGIN:VEVENT', `UID:${d.date}-${k}-${city.slug}@noor-quran`, `DTSTAMP:${z(stamp)}`, `DTSTART:${z(start)}`, `DTEND:${z(start + (k === 'sunrise' ? 5 : 15) * 60_000)}`, `SUMMARY:${esc(`${name} · ${city.name.en}`)}`, `DESCRIPTION:${esc(`${name} in ${city.name.en} (${city.method}${city.madhab === 'hanafi' && k === 'asr' ? ', Hanafi Asr' : ''}) — noor quran`)}`, `LOCATION:${esc(city.name.en)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT')
    }
  }
  L.push('END:VCALENDAR')
  return L.map(fold).join('\r\n') + '\r\n'
}

export const monthKey = (y: number, m: number) => `${y}-${pad(m)}`
export const parseMonthKey = (s: string): { y: number; m: number } | null => {
  const r = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(s)
  return r ? { y: +r[1], m: +r[2] } : null
}
/** months between two (y, m) — b − a */
export const monthDiff = (a: { y: number; m: number }, b: { y: number; m: number }) => (b.y - a.y) * 12 + (b.m - a.m)
