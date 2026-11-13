import { computeSchedule, REMINDER_NAMES, type ReminderKey } from './times'
import type { ReminderCfg, ReminderSound } from '@/lib/stores/prayer'

export interface ReminderItem {
  id: string
  key: ReminderKey
  /** prayer instant (ms) */
  at: number
  /** when to notify (ms) = at - before */
  fireAt: number
  before: number
  sound: ReminderSound
  /** localized [title, body] */
  text: { en: [string, string]; bn: [string, string]; ar: [string, string] }
}
export interface StoredSchedule {
  generatedAt: number
  lang: 'en' | 'bn' | 'ar'
  city: string | null
  items: ReminderItem[]
}

const bnDigits = (s: string) => s.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d])

export function buildReminders(opts: {
  lat: number
  lon: number
  method: string
  madhab: 'shafi' | 'hanafi'
  tz?: string | null
  reminders: Record<ReminderKey, ReminderCfg>
  days?: number
  now?: number
  city?: string | null
}): ReminderItem[] {
  const now = opts.now ?? Date.now()
  const days = computeSchedule({ lat: opts.lat, lon: opts.lon, method: opts.method, madhab: opts.madhab, tz: opts.tz, days: opts.days ?? 7, from: now })
  const fmt = (loc: string, ms: number) => new Intl.DateTimeFormat(loc, { timeZone: opts.tz ?? undefined, hour: 'numeric', minute: '2-digit', hour12: true }).format(ms)
  const items: ReminderItem[] = []
  for (const day of days) {
    for (const key of Object.keys(REMINDER_NAMES) as ReminderKey[]) {
            if (key === 'dhuhr' && day.friday && opts.reminders.jumuah.on) continue // Jumu'ah replaces Dhuhr on Fridays
      if (key === 'jumuah' && !day.friday) continue
      const cfg = opts.reminders[key]
      if (!cfg?.on) continue
      const at = day.times[key]
      const fireAt = at - cfg.before * 60_000
      if (fireAt < now - 30 * 60_000) continue
      const n = REMINDER_NAMES[key]
      const en = fmt('en-US', at)
      const bn = bnDigits(fmt('bn-BD', at))
      const nm = key === 'tahajjud'
      const ar = fmt('ar-EG-u-nu-latn', at)
      const where = opts.city ? ` · ${opts.city}` : ''
      items.push({
        id: `${day.date}-${key}-${cfg.before}`,
        key,
        at,
        fireAt,
        before: cfg.before,
        sound: cfg.sound,
        text: {
          en: [
            cfg.before ? `${n.en} in ${cfg.before} min` : nm ? 'Tahajjud — last third of the night' : key === 'sunrise' ? 'Sunrise' : `Time for ${n.en}`,
            cfg.before ? `${n.en} at ${en}${opts.city ? ` · ${opts.city}` : ''}` : `${nm ? 'The blessed last third of the night begins' : n.en} · ${en}${opts.city ? ` · ${opts.city}` : ''}`,
          ],
          bn: [
            cfg.before ? `${bnDigits(String(cfg.before))} মিনিট পর ${n.bn}` : nm ? 'তাহাজ্জুদ — রাতের শেষ তৃতীয়াংশ' : key === 'sunrise' ? 'সূর্যোদয়' : `${n.bn} নামাজের সময় হয়েছে`,
            cfg.before ? `${n.bn} ${bn}${opts.city ? ` · ${opts.city}` : ''}` : `${nm ? 'রাতের বরকতময় শেষ প্রহর শুরু' : n.bn} · ${bn}${opts.city ? ` · ${opts.city}` : ''}`,
          ],
          ar: [
            cfg.before ? `${n.ar} بعد ${cfg.before} د` : nm ? 'التهجد — الثلث الأخير من الليل' : key === 'sunrise' ? 'الشروق' : `حان وقت ${n.ar}`,
            cfg.before ? `${n.ar} الساعة ${ar}${where}` : `${nm ? 'بدأ الثلث الأخير المبارك من الليل' : n.ar} · ${ar}${where}`,
          ],
        },
      })
    }
  }
  return items.sort((a, b) => a.fireAt - b.fireAt)
}
