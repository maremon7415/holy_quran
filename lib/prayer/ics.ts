import { computeSchedule, REMINDER_NAMES, type ReminderKey } from './times'
import type { ReminderCfg } from '@/lib/stores/prayer'

const z = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
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

/** Build a VCALENDAR with a VEVENT + VALARM for each prayer for `days` days. Sunrise / Jumu'ah / Tahajjud are included when enabled. */
export function buildPrayerIcs(opts: {
  lat: number
  lon: number
  method: string
  madhab: 'shafi' | 'hanafi'
  tz?: string | null
  city?: string | null
  reminders: Record<ReminderKey, ReminderCfg>
  days?: number
  lang?: 'en' | 'bn' | 'ar'
}) {
  const days = computeSchedule({ ...opts, days: opts.days ?? 30 })
  const stamp = z(Date.now())
  const lang = opts.lang ?? 'en'
  const where = opts.city ?? `${opts.lat.toFixed(3)}, ${opts.lon.toFixed(3)}`
  const L: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Noor Quran//Prayer times//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${esc(lang === 'bn' ? 'নামাজের সময় — ' : lang === 'ar' ? 'مواقيت الصلاة — ' : 'Prayer times — ')}${esc(where)}`]
  if (opts.tz) L.push(`X-WR-TIMEZONE:${opts.tz}`)
  const extra: ReminderKey[] = ['sunrise', 'tahajjud']
  const keys: ReminderKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'tahajjud']
  for (const day of days) {
    for (const key of keys) {
      if (extra.includes(key) && !opts.reminders[key].on) continue
      const k: ReminderKey = key === 'dhuhr' && day.friday ? 'jumuah' : key
      const cfg = opts.reminders[k].on ? opts.reminders[k] : opts.reminders[key]
      const start = day.times[key]
      const dur = key === 'sunrise' || key === 'tahajjud' ? 5 : 15
      const nm = REMINDER_NAMES[k]
      const name = nm[lang]
      const before = opts.reminders[k].on || opts.reminders[key].on ? cfg.before : 0
      L.push(
        'BEGIN:VEVENT',
        `UID:${day.date}-${k}-${opts.lat.toFixed(3)}-${opts.lon.toFixed(3)}@noor-quran`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${z(start)}`,
        `DTEND:${z(start + dur * 60_000)}`,
        `SUMMARY:${esc(name)}`,
        `DESCRIPTION:${esc(`${name} · ${where} · ${opts.method} / ${opts.madhab === 'hanafi' ? (lang === 'ar' ? 'حنفي' : 'Hanafi') : lang === 'ar' ? 'شافعي' : 'Shafi'} ${lang === 'ar' ? 'للعصر' : 'Asr'} · ${lang === 'ar' ? 'نور القرآن' : 'Noor Quran'}`)}`,
        `LOCATION:${esc(where)}`,
        'TRANSP:TRANSPARENT',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${esc(before ? (lang === 'bn' ? `${before} মিনিট পর ${name}` : lang === 'ar' ? `${name} بعد ${before} دقيقة` : `${name} in ${before} min`) : name)}`,
        `TRIGGER:${before ? `-PT${before}M` : 'PT0S'}`,
        'END:VALARM',
        'END:VEVENT',
      )
    }
  }
  L.push('END:VCALENDAR')
  return L.map(fold).join('\r\n') + '\r\n'
}

export function downloadIcs(text: string, name = 'noor-prayer-times.ics') {
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
}
