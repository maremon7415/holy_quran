'use client'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang, useMounted, useTx } from '@/lib/lang'
import { UiIcon } from '@/components/ui-icon'
import { cn } from '@/lib/utils'

export interface IslamicEvent { id: string; name: string; nameBn: string; hijriMonth: number; hijriDay: number; description: { en: string; bn: string } }

const DAY_MS = 86_400_000
const hijriFmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' })
function hijri(d: Date) {
  const p = Object.fromEntries(hijriFmt.formatToParts(d).map((x) => [x.type, x.value]))
  return { d: +p.day, m: +p.month, y: +p.year }
}
const atNoon = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12)

/** Greg date of the 1st of the Hijri month containing `d`. */
function monthStart(d: Date) {
  const h = hijri(d)
  return addDays(d, -(h.d - 1))
}
function monthDays(first: Date) {
  const h = hijri(first)
  const out: Date[] = []
  for (let i = 0; i < 31; i++) {
    const d = addDays(first, i)
    if (hijri(d).m !== h.m) break
    out.push(d)
  }
  return out
}

const WEEK = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  bn: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'],
}

export function CalendarView({ events }: { events: IslamicEvent[] }) {
  const mounted = useMounted()
  const t = useTx()
  const lang = useLang()
  const [first, setFirst] = useState<Date | null>(null)
  const [dir, setDir] = useState(0)
  const [picked, setPicked] = useState<Date | null>(null)

  const today = useMemo(() => atNoon(new Date()), [])
  const start = first ?? monthStart(today)
  const days = useMemo(() => monthDays(start), [start])
  const h0 = hijri(start)

  const loc = lang === 'bn' ? 'bn' : lang === 'ar' ? 'ar' : 'en'
  const nf = lang === 'bn' ? (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]) : (n: number | string) => String(n)
  const monthName = new Intl.DateTimeFormat(`${loc}-u-ca-islamic-umalqura`, { month: 'long' }).format(start)
  const monthNameAr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { month: 'long' }).format(start)
  const gregRange = (() => {
    const a = days[0], b = days[days.length - 1]
    const f = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : lang === 'ar' ? 'ar' : 'en-US', { month: 'short', year: 'numeric' })
    return a.getMonth() === b.getMonth() ? f.format(a) : `${f.format(a)} – ${f.format(b)}`
  })()

  const evMap = useMemo(() => {
    const m = new Map<number, IslamicEvent[]>()
    events.filter((e) => e.hijriMonth === h0.m).forEach((e) => m.set(e.hijriDay, [...(m.get(e.hijriDay) ?? []), e]))
    return m
  }, [events, h0.m])

  const go = (n: number) => {
    setDir(n)
    setPicked(null)
    setFirst(n > 0 ? monthStart(addDays(start, 31)) : monthStart(addDays(start, -1)))
  }
  const isToday = (d: Date) => d.getTime() === today.getTime()
  const offset = start.getDay()
  const sel = picked ?? (days.find(isToday) ?? days[0])
  const selH = hijri(sel)
  const selEvents = evMap.get(selH.d) ?? []
  const upcoming = useMemo(() => {
    const out: { e: IslamicEvent; date: Date }[] = []
    for (let i = 0; i < 400 && out.length < 4; i++) {
      const d = addDays(today, i), h = hijri(d)
      events.filter((e) => e.hijriMonth === h.m && e.hijriDay === h.d).forEach((e) => out.push({ e, date: d }))
    }
    return out
  }, [events, today])

  if (!mounted) return <div className="mx-auto max-w-5xl px-4 pb-32 pt-8"><div className="card-soft h-[34rem] shimmer" /></div>

  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
      <div className="mb-5 flex items-center gap-4">
        <UiIcon name="calendar" size={56} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t({ en: 'Hijri calendar', bn: 'হিজরি ক্যালেন্ডার', ar: 'التقويم الهجري' })}</p>
          <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{t({ en: 'Islamic Calendar', bn: 'ইসলামি ক্যালেন্ডার', ar: 'التقويم الإسلامي' })}</h1>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <section className="card-soft relative overflow-hidden rounded-[2rem] p-4 sm:p-6">
          <div aria-hidden className="bg-pattern pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_35%)]" />
          <div className="relative flex items-center justify-between gap-2">
            <button onClick={() => go(-1)} aria-label={t({ en: 'Previous month', bn: 'আগের মাস', ar: 'الشهر السابق' })} className="grid size-11 place-items-center rounded-full border bg-card transition hover:border-primary/40 active:scale-95"><ChevronLeft className="size-5" /></button>
            <div className="text-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${h0.y}-${h0.m}`} initial={{ opacity: 0, x: dir * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -dir * 24 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
                  <h2 className="font-display text-2xl font-semibold sm:text-3xl">{monthName} {nf(h0.y)} <span className="text-base font-normal text-muted-foreground">{t({ en: 'AH', bn: 'হি.', ar: 'هـ' })}</span></h2>
                  <p className="text-sm text-muted-foreground"><span lang="ar" className="font-arabic text-gold">{monthNameAr}</span> · {gregRange}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <button onClick={() => go(1)} aria-label={t({ en: 'Next month', bn: 'পরের মাস', ar: 'الشهر التالي' })} className="grid size-11 place-items-center rounded-full border bg-card transition hover:border-primary/40 active:scale-95"><ChevronRight className="size-5" /></button>
          </div>

          <div className="relative mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:gap-2">
            {WEEK[loc].map((w, i) => <div key={w} className={cn('py-1', i === 5 && 'text-primary')}>{w}</div>)}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${h0.y}-${h0.m}`} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="relative mt-1 grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: offset }, (_, i) => <div key={`o${i}`} />)}
              {days.map((d) => {
                const h = hijri(d)
                const ev = evMap.get(h.d)
                const t0 = isToday(d), s = d.getTime() === sel.getTime()
                return (
                  <button
                    key={d.getTime()}
                    onClick={() => setPicked(d)}
                    aria-label={`${d.toDateString()}`}
                    aria-pressed={s}
                    className={cn('lift relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-center transition sm:rounded-3xl',
                      t0 ? 'border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_var(--glow)]' : s ? 'border-primary/60 bg-accent' : 'border-transparent bg-surface-2/60 hover:border-primary/30',
                      !t0 && d.getDay() === 5 && 'text-primary')}
                  >
                    <span className="font-display text-lg font-semibold leading-none sm:text-2xl">{nf(h.d)}</span>
                    <span className={cn('mt-1 text-[10px] leading-none sm:text-xs', t0 ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{nf(d.getDate())}</span>
                    {ev && <span className={cn('absolute bottom-1.5 size-1.5 rounded-full', t0 ? 'bg-primary-foreground' : 'bg-gold')} />}
                    {[13, 14, 15].includes(h.d) && !t0 && <span aria-hidden className="absolute right-1.5 top-1.5 size-1 rounded-full bg-primary/50" />}
                  </button>
                )
              })}
            </motion.div>
          </AnimatePresence>
          <div className="relative mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-gold" /> {t({ en: 'Islamic event', bn: 'ইসলামি দিবস', ar: 'مناسبة إسلامية' })}</span>
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-primary/50" /> {t({ en: 'White days (13–15)', bn: 'আইয়্যামে বীজ (১৩–১৫)', ar: 'الأيام البيض (١٣–١٥)' })}</span>
            <span>{t({ en: 'Large: Hijri · small: Gregorian', bn: 'বড়: হিজরি · ছোট: ইংরেজি', ar: 'الكبير: هجري · الصغير: ميلادي' })}</span>
          </div>
          {(first && monthStart(today).getTime() !== first.getTime()) && (
            <div className="relative mt-4 text-center">
              <button onClick={() => { setFirst(null); setPicked(null); setDir(0) }} className="rounded-full border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary/40">{t({ en: 'Back to today', bn: 'আজকে ফিরুন', ar: 'العودة إلى اليوم' })}</button>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="card-soft p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isToday(sel) ? t({ en: 'Today', bn: 'আজ', ar: 'اليوم' }) : t({ en: 'Selected', bn: 'নির্বাচিত', ar: 'المحدد' })}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{nf(selH.d)} {new Intl.DateTimeFormat(`${loc}-u-ca-islamic-umalqura`, { month: 'long' }).format(sel)} {nf(selH.y)}</p>
            <p className="text-sm text-muted-foreground">{new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : lang === 'ar' ? 'ar' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(sel)}</p>
            {selEvents.length > 0 ? selEvents.map((e) => (
              <div key={e.id} className="mt-4 rounded-2xl bg-gold-soft p-4">
                <p className="flex items-center gap-2 font-display text-lg font-semibold"><UiIcon name="crescent" size={24} /> {t({ en: e.name, bn: e.nameBn })}</p>
                <p className="mt-1 text-sm text-foreground/80">{t({ en: e.description.en, bn: e.description.bn })}</p>
              </div>
            )) : <p className="mt-3 text-sm text-muted-foreground">{t({ en: 'No special occasion on this day.', bn: 'এই দিনে বিশেষ কোনো দিবস নেই।', ar: 'لا مناسبة خاصة في هذا اليوم.' })}</p>}
          </div>
          <div className="card-soft p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold"><UiIcon name="lantern" size={26} /> {t({ en: 'Coming up', bn: 'আসছে', ar: 'قريبًا' })}</h3>
            <ul className="mt-3 space-y-3">
              {upcoming.map(({ e, date }) => {
                const n = Math.round((date.getTime() - today.getTime()) / DAY_MS)
                return (
                  <li key={e.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{t({ en: e.name, bn: e.nameBn })}</p>
                      <p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : lang === 'ar' ? 'ar' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold">{n === 0 ? t({ en: 'Today', bn: 'আজ', ar: 'اليوم' }) : t({ en: `in ${n} d`, bn: `${nf(n)} দিন পর`, ar: `بعد ${n} يوم` })}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">{t({ en: 'Dates follow the Umm al-Qura calendar and may differ by a day from local moon sighting.', bn: 'তারিখ উম্মুল কুরা ক্যালেন্ডার অনুযায়ী; স্থানীয় চাঁদ দেখার সাথে একদিনের পার্থক্য হতে পারে।', ar: 'التواريخ وفق تقويم أم القرى وقد تختلف بيوم عن رؤية الهلال المحلية.' })}</p>
    </div>
  )
}
