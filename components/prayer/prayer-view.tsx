'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan'
import { MapPin, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { usePrayerPrefs } from '@/lib/stores/prayer'
import { useLang, useMounted, useTx } from '@/lib/lang'
import { UiIcon } from '@/components/ui-icon'
import { LocationPicker } from './location-picker'
import { SunArc } from './sun-arc'
import { RemindersCard } from './reminders-card'
import { cn } from '@/lib/utils'

const METHODS: { id: string; en: string; bn: string }[] = [
  { id: 'Karachi', en: 'University of Islamic Sciences, Karachi', bn: 'করাচি বিশ্ববিদ্যালয়' },
  { id: 'MuslimWorldLeague', en: 'Muslim World League', bn: 'মুসলিম ওয়ার্ল্ড লিগ' },
  { id: 'Egyptian', en: 'Egyptian General Authority', bn: 'মিসরীয় সাধারণ কর্তৃপক্ষ' },
  { id: 'UmmAlQura', en: 'Umm al-Qura, Makkah', bn: 'উম্মুল কুরা, মক্কা' },
  { id: 'NorthAmerica', en: 'ISNA (North America)', bn: 'ISNA (উত্তর আমেরিকা)' },
  { id: 'MoonsightingCommittee', en: 'Moonsighting Committee', bn: 'মুনসাইটিং কমিটি' },
  { id: 'Dubai', en: 'Dubai', bn: 'দুবাই' },
  { id: 'Kuwait', en: 'Kuwait', bn: 'কুয়েত' },
  { id: 'Qatar', en: 'Qatar', bn: 'কাতার' },
  { id: 'Singapore', en: 'Singapore', bn: 'সিঙ্গাপুর' },
  { id: 'Turkey', en: 'Turkey (Diyanet)', bn: 'তুরস্ক (দিয়ানেত)' },
  { id: 'Tehran', en: 'Tehran', bn: 'তেহরান' },
]

type Key = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
const ROWS: { key: Key; en: string; bn: string; ar: string; short: string; icon: string }[] = [
  { key: 'fajr', en: 'Fajr', bn: 'ফজর', ar: 'الفجر', short: 'Fajr', icon: 'moon' },
  { key: 'sunrise', en: 'Sunrise', bn: 'সূর্যোদয়', ar: 'الشروق', short: 'Sun', icon: 'sun' },
  { key: 'dhuhr', en: 'Dhuhr', bn: 'যোহর', ar: 'الظهر', short: 'Dhuhr', icon: 'sun' },
  { key: 'asr', en: 'Asr', bn: 'আসর', ar: 'العصر', short: 'Asr', icon: 'sun' },
  { key: 'maghrib', en: 'Maghrib', bn: 'মাগরিব', ar: 'المغرب', short: 'Maghrib', icon: 'lantern' },
  { key: 'isha', en: 'Isha', bn: 'এশা', ar: 'العشاء', short: 'Isha', icon: 'moon' },
]

function compute(lat: number, lon: number, date: Date, method: string, madhab: 'shafi' | 'hanafi') {
  const fn = (CalculationMethod as Record<string, () => ReturnType<typeof CalculationMethod.Karachi>>)[method] ?? CalculationMethod.Karachi
  const params = fn()
  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi
  return new PrayerTimes(new Coordinates(lat, lon), date, params)
}

const pad = (n: number) => String(n).padStart(2, '0')

export function PrayerView() {
  const mounted = useMounted()
  const t = useTx()
  const lang = useLang()
  const location = useAppStore((s) => s.location)
  const method = useAppStore((s) => s.prayerMethod)
  const setMethod = useAppStore((s) => s.setPrayerMethod)
  const madhab = usePrayerPrefs((s) => s.madhab)
  const setMadhab = usePrayerPrefs((s) => s.setMadhab)
  const tz = usePrayerPrefs((s) => s.tz) ?? undefined
  const [now, setNow] = useState(() => Date.now())
  const [changing, setChanging] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const { latitude, longitude } = location
  const hasLoc = latitude !== null && longitude !== null
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }).formatToParts(now).map((x) => [x.type, x.value]))
  const dayKey = `${parts.year}-${parts.month}-${parts.day}`
  const isFriday = parts.weekday === 'Fri'

  const data = useMemo(() => {
    if (!hasLoc) return null
    const d = new Date(+parts.year, +parts.month - 1, +parts.day)
    const pt = compute(latitude!, longitude!, d, method, madhab)
    const tomorrow = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    const pt2 = compute(latitude!, longitude!, tomorrow, method, madhab)
    return { pt, nextFajr: pt2.fajr.getTime() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoc, latitude, longitude, method, madhab, dayKey])

  const loc = lang === 'bn' ? 'bn-BD' : 'en-US'
  const fmt = (ms: number) => new Intl.DateTimeFormat(loc, { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(ms)
  const fmtNum = (s: string) => (lang === 'bn' ? s.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]) : s)

  if (!mounted) return <div className="mx-auto max-w-5xl px-4 pb-32 pt-8 sm:px-6"><div className="card-soft h-[28rem] shimmer" /></div>

  const hijri = new Intl.DateTimeFormat(`${lang === 'bn' ? 'bn' : 'en'}-u-ca-islamic-umalqura`, { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' }).format(now)
  const hijriAr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' }).format(now)
  const greg = new Intl.DateTimeFormat(loc, { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)

  /* ---------- no location yet ---------- */
  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-32 pt-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="card-soft relative overflow-hidden p-8 text-center">
          <div aria-hidden className="bg-pattern absolute inset-0 opacity-60" />
          <div className="relative">
            <UiIcon name="prayer" size={88} className="mx-auto" />
            <h2 className="mt-4 font-display text-2xl font-semibold">{t({ en: 'Where are you praying?', bn: 'আপনি কোথায় আছেন?' })}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t({ en: 'Share your location or pick a city to see accurate prayer times. It stays on your device.', bn: 'সঠিক নামাজের সময় দেখতে লোকেশন দিন বা শহর বাছাই করুন। এটি শুধু আপনার ডিভাইসেই থাকে।' })}</p>
            <LocationPicker className="mt-6 text-left" />
          </div>
        </motion.div>
      </div>
    )
  }

  const { pt, nextFajr } = data
  const times: Record<Key, number> = { fajr: pt.fajr.getTime(), sunrise: pt.sunrise.getTime(), dhuhr: pt.dhuhr.getTime(), asr: pt.asr.getTime(), maghrib: pt.maghrib.getTime(), isha: pt.isha.getTime() }
  const five: Key[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  let nextKey: Key = 'fajr'
  let nextAt = nextFajr
  for (const k of five) { if (times[k] > now) { nextKey = k; nextAt = times[k]; break } }
  const nextRow = ROWS.find((r) => r.key === nextKey)!
  const prevAt = (() => { let p = pt.isha.getTime() - 86_400_000; for (const k of five) if (times[k] <= now) p = times[k]; return p })()
  const remain = Math.max(0, nextAt - now)
  const hh = Math.floor(remain / 3_600_000), mm = Math.floor((remain % 3_600_000) / 60_000), ss = Math.floor((remain % 60_000) / 1000)
  const prog = Math.min(1, Math.max(0, (now - prevAt) / (nextAt - prevAt)))
  const label = (k: Key) => { const r = ROWS.find((x) => x.key === k)!; return k === 'dhuhr' && isFriday ? t({ en: 'Jumu’ah', bn: 'জুমা' }) : t({ en: r.en, bn: r.bn }) }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
      {/* header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t({ en: 'Prayer times', bn: 'নামাজের সময়সূচি' })}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight sm:text-4xl">{t({ en: 'Prayer Times Today', bn: 'আজকের নামাজের সময়' })}</h1>
        </div>
        <button onClick={() => setChanging((v) => !v)} className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium transition hover:border-primary/40">
          <MapPin className="size-4 text-primary" /> {location.city ?? t({ en: 'My location', bn: 'আমার অবস্থান' })}
          <ChevronDown className={cn('size-4 text-muted-foreground transition', changing && 'rotate-180')} />
        </button>
      </div>
      {changing && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card-soft mb-5 p-4 sm:p-5"><LocationPicker compact /></motion.div>
      )}

      {/* hero */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="card-soft relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] opacity-70" />
          <div className="bg-pattern absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        </div>
        <div className="relative text-center">
          <p className="text-sm text-muted-foreground">{t({ en: 'Next prayer', bn: 'পরবর্তী নামাজ' })}</p>
          <h2 className="mt-1 flex items-center justify-center gap-3 font-display text-4xl font-semibold sm:text-5xl">
            <UiIcon name={nextRow.icon} size={40} /> {label(nextKey)}
            <span className="font-arabic text-2xl text-gold sm:text-3xl" lang="ar">{nextRow.ar}</span>
          </h2>
          <p aria-live="off" className="mt-3 font-display text-5xl font-semibold tabular-nums tracking-tight sm:text-7xl">
            {fmtNum(`${pad(hh)}:${pad(mm)}`)}<span className="text-gold">:{fmtNum(pad(ss))}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t({ en: 'at', bn: 'সময়' })} {fmtNum(fmt(nextAt))}{nextAt === nextFajr && nextKey === 'fajr' && now > times.isha ? t({ en: ' tomorrow', bn: ' (আগামীকাল)' }) : ''}</p>
          <div className="mx-auto mt-4 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-gold to-primary" animate={{ width: `${prog * 100}%` }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
          </div>
        </div>
        <div className="relative mx-auto mt-6 max-w-xl">
          <SunArc
            now={now}
            sunrise={times.sunrise}
            sunset={pt.sunset.getTime()}
            start={times.fajr - 20 * 60_000}
            end={times.isha + 20 * 60_000}
            marks={ROWS.map((r) => ({ key: r.key, label: r.short, time: times[r.key], active: r.key === nextKey }))}
          />
        </div>
        <div className="relative mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-sm">
          <span className="text-muted-foreground">{greg}</span>
          <span className="hidden text-border sm:inline">•</span>
          <span className="font-medium">{hijri}</span>
          <span lang="ar" className="font-arabic text-gold">{hijriAr}</span>
        </div>
      </motion.section>

      {/* list */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ROWS.map((r, i) => {
          const isNext = r.key === nextKey
          const passed = times[r.key] <= now && !isNext
          return (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30, delay: i * 0.04 }}
              className={cn('card-soft lift relative flex items-center gap-3 rounded-3xl p-4 sm:p-5', isNext && 'border-primary/50 ring-2 ring-primary/25', passed && 'opacity-60')}
            >
              <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl', isNext ? 'bg-gold-soft' : 'bg-surface-2')}><UiIcon name={r.icon} size={32} /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{label(r.key)}</p>
                <p className="font-display text-xl font-semibold tabular-nums leading-tight sm:text-2xl">{fmtNum(fmt(times[r.key]))}</p>
              </div>
              {isNext && <span className="absolute right-3 top-3 size-2 rounded-full bg-primary pulse-ring" />}
            </motion.div>
          )
        })}
      </div>

      <RemindersCard />

      {/* settings */}
      <section className="card-soft mt-5 p-4 sm:p-6">
        <button onClick={() => setShowSettings((v) => !v)} className="flex w-full items-center justify-between text-left">
          <span className="flex items-center gap-3">
            <UiIcon name="settings" size={28} />
            <span>
              <span className="block font-display text-lg font-semibold">{t({ en: 'Calculation settings', bn: 'হিসাবের সেটিংস' })}</span>
              <span className="block text-sm text-muted-foreground">{METHODS.find((m) => m.id === method)?.[lang === 'bn' ? 'bn' : 'en'] ?? method} · {madhab === 'hanafi' ? t({ en: 'Hanafi Asr', bn: 'হানাফি আসর' }) : t({ en: 'Standard Asr', bn: 'শাফেয়ি আসর' })}</span>
            </span>
          </span>
          <ChevronDown className={cn('size-5 text-muted-foreground transition', showSettings && 'rotate-180')} />
        </button>
        {showSettings && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 grid gap-5 overflow-hidden sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">{t({ en: 'Calculation method', bn: 'গণনা পদ্ধতি' })}</span>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                {METHODS.map((m) => <option key={m.id} value={m.id}>{lang === 'bn' ? m.bn : m.en}</option>)}
              </select>
            </label>
            <div>
              <span className="mb-2 block text-sm font-semibold">{t({ en: 'Asr (madhab)', bn: 'আসর (মাযহাব)' })}</span>
              <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
                {(['shafi', 'hanafi'] as const).map((m) => (
                  <button key={m} onClick={() => setMadhab(m)} className={cn('h-9 rounded-full text-sm font-medium transition', madhab === m ? 'bg-card shadow-sm' : 'text-muted-foreground')}>
                    {m === 'shafi' ? t({ en: 'Shafi / Standard', bn: 'শাফেয়ি / সাধারণ' }) : t({ en: 'Hanafi', bn: 'হানাফি' })}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{t({ en: 'Hanafi Asr begins when a shadow is twice the object’s length.', bn: 'হানাফি মতে আসর শুরু হয় ছায়া বস্তুর দ্বিগুণ হলে।' })}</p>
            </div>
          </motion.div>
        )}
      </section>
      <p className="mt-4 text-center text-xs text-muted-foreground">{t({ en: 'Times are calculated on your device for the chosen location. Adjust a few minutes for local mosque schedules.', bn: 'সময় আপনার ডিভাইসে হিসাব করা। স্থানীয় মসজিদের সময়ের সাথে কয়েক মিনিটের পার্থক্য হতে পারে।' })}</p>
    </div>
  )
}
