'use client'
import { useMemo, useState } from 'react'
import Link from '@/lib/i18n/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang, useMounted, useTx } from '@/lib/lang'
import { useAppStore } from '@/lib/store'
import { useJourney, type Khatam, type KhatamKind } from '@/lib/stores/journey'
import { chapters, readerHref, surahNamesBn } from '@/lib/quran/chapters'
import { ayahsInPages, pageEnd, pageStart, TOTAL_PAGES } from '@/lib/hifz/pages'
import { dayState, daysForPagesPerDay, daysUntil, khatamStatus } from '@/lib/hifz/khatam'
import { UiIcon } from '@/components/ui-icon'
import { StarBurst } from '@/components/hifz/star-burst'
import { cn } from '@/lib/utils'

const spring = { type: 'spring' as const, stiffness: 380, damping: 30 }

function useSurahName() {
  const lang = useLang()
  return (s: number) => (lang === 'bn' ? surahNamesBn[s - 1] : lang === 'ar' ? chapters[s - 1].nameArabic : chapters[s - 1].nameSimple)
}

function Ring({ pct, size = 120, children }: { pct: number; size?: number; children?: React.ReactNode }) {
  const r = (size - 14) / 2, c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={10} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth={10} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.min(1, pct / 100)) }} transition={{ type: 'spring', stiffness: 80, damping: 20 }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
export { Ring }

function Portion({ from, to }: { from: number; to: number }) {
  const sn = useSurahName()
  const [s1, a1] = pageStart(from)
  const [s2, a2] = pageEnd(to)
  return (
    <span>
      {sn(s1)} {a1} <span className="inline-block text-muted-foreground rtl:rotate-180">→</span> {sn(s2)} {a2}
    </span>
  )
}

/* ---------------------------- create form ---------------------------- */
function CreateForm() {
  const t = useTx()
  const create = useJourney((s) => s.create)
  const [kind, setKind] = useState<KhatamKind>('ramadan')
  const [days, setDays] = useState(30)
  const [ppd, setPpd] = useState(5)
  const [date, setDate] = useState(() => new Date(Date.now() + 29 * 86400000).toLocaleDateString('en-CA'))
  const total = kind === 'ramadan' ? 30 : kind === 'days' ? days : kind === 'pages' ? daysForPagesPerDay(ppd) : daysUntil(date)
  const per = Math.ceil(TOTAL_PAGES / Math.max(1, total))
  const kinds: { k: KhatamKind; en: string; bn: string; ar?: string }[] = [
    { k: 'ramadan', en: 'Ramadan · 30 days', bn: 'রমজান · ৩০ দিন', ar: 'رمضان · ٣٠ يومًا' },
    { k: 'days', en: 'In N days', bn: 'N দিনে', ar: 'خلال عدد من الأيام' },
    { k: 'date', en: 'By a date', bn: 'নির্দিষ্ট তারিখে', ar: 'بحلول تاريخ' },
    { k: 'pages', en: 'Pages per day', bn: 'দৈনিক পৃষ্ঠা', ar: 'صفحات يوميًا' },
  ]
  const input = 'h-11 w-full rounded-2xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {kinds.map((x) => (
          <button key={x.k} onClick={() => setKind(x.k)} className={cn('rounded-full border px-3.5 py-1.5 text-sm font-medium transition', kind === x.k ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface-2 text-muted-foreground hover:text-foreground')}>
            {t({ en: x.en, bn: x.bn, ar: x.ar })}
          </button>
        ))}
      </div>
      <div className="mt-4 max-w-xs">
        {kind === 'days' && <input type="number" min={1} max={730} value={days} onChange={(e) => setDays(Math.max(1, +e.target.value || 1))} className={input} aria-label={t({ en: 'Days', bn: 'দিন', ar: 'أيام' })} />}
        {kind === 'pages' && <input type="number" min={1} max={604} value={ppd} onChange={(e) => setPpd(Math.max(1, +e.target.value || 1))} className={input} aria-label={t({ en: 'Pages per day', bn: 'দৈনিক পৃষ্ঠা', ar: 'صفحات في اليوم' })} />}
        {kind === 'date' && <input type="date" min={new Date().toLocaleDateString('en-CA')} value={date} onChange={(e) => setDate(e.target.value)} className={input} aria-label={t({ en: 'Finish date', bn: 'শেষ করার তারিখ', ar: 'تاريخ الإنهاء' })} />}
      </div>
      <p className="mt-4 rounded-2xl bg-surface-2 p-4 text-sm">
        {t({ en: `${total} days · about ${per} page${per === 1 ? '' : 's'} a day (≈ ${per * 2} min of reading).`, bn: `${total} দিন · দৈনিক প্রায় ${per} পৃষ্ঠা (≈ ${per * 2} মিনিট)।`, ar: `${total} يومًا · نحو ${per} صفحة يوميًا (≈ ${per * 2} دقيقة قراءة).` })}
      </p>
      <motion.button whileTap={{ scale: 0.97 }} onClick={() => create({ kind, days: total, pagesPerDay: kind === 'pages' ? ppd : undefined })} className="mt-4 h-12 rounded-full bg-primary px-7 font-semibold text-primary-foreground shadow-lg shadow-primary/25">
        {t({ en: 'Start my Khatam', bn: 'আমার খতম শুরু করুন', ar: 'ابدأ ختمتي' })}
      </motion.button>
    </div>
  )
}

/* ---------------------------- active plan ---------------------------- */
function Timeline({ k, dayIndex }: { k: Khatam; dayIndex: number }) {
  const cells = Array.from({ length: Math.min(k.days, 400) }, (_, d) => d)
  return (
    <div className="flex flex-wrap gap-1.5">
      {cells.map((d) => {
        const st = dayState(k, d, dayIndex)
        return (
          <motion.span
            key={d}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.min(d * 0.01, 0.6) }}
            title={`Day ${d + 1}`}
            className={cn(
              'grid h-7 min-w-7 place-items-center rounded-lg px-1 text-[10px] font-medium tabular-nums',
              st === 'done' && 'bg-primary text-primary-foreground',
              st === 'today' && 'border-2 border-gold bg-gold-soft text-foreground',
              st === 'missed' && 'bg-destructive/15 text-destructive',
              st === 'future' && 'bg-muted text-muted-foreground'
            )}
          >
            {k.days <= 62 ? d + 1 : ''}
          </motion.span>
        )
      })}
    </div>
  )
}

function ActivePlan({ k }: { k: Khatam }) {
  const t = useTx()
  const sn = useSurahName()
  const setDonePage = useJourney((s) => s.setDonePage)
  const extend = useJourney((s) => s.extend)
  const archive = useJourney((s) => s.archive)
  const remove = useJourney((s) => s.remove)
  const incrementVersesRead = useAppStore((s) => s.incrementVersesRead)
  const [burst, setBurst] = useState<string | null>(null)
  const [manual, setManual] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  const st = useMemo(() => khatamStatus(k), [k])
  const next = st.portion ? pageStart(st.portion.from) : pageStart(Math.min(TOTAL_PAGES, k.donePage + 1))
  const ayahs = st.portion ? ayahsInPages(st.portion.from, st.portion.to) : 0

  const markDone = () => {
    if (!st.portion) return
    incrementVersesRead(ayahs)
    setDonePage(k.id, st.portion.to)
    setBurst(`d${Date.now()}`)
  }
  const readAhead = () => {
    const to = Math.min(TOTAL_PAGES, k.donePage + Math.max(1, Math.ceil(TOTAL_PAGES / k.days)))
    incrementVersesRead(ayahsInPages(k.donePage + 1, to))
    setDonePage(k.id, to)
    setBurst(`a${Date.now()}`)
  }
  const extraDays = Math.max(1, Math.ceil(st.remainingPages / Math.max(1, Math.ceil(TOTAL_PAGES / k.days))) - st.remainingDays)

  return (
    <div>
      <StarBurst burst={burst} />
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex items-center gap-5">
          <Ring pct={st.percent} size={128}>
            <div>
              <p className="font-display text-3xl tabular-nums leading-none">{st.percent}%</p>
              <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{k.donePage}/{TOTAL_PAGES}</p>
            </div>
          </Ring>
          <div className="text-sm">
            <p className="text-muted-foreground">{t({ en: 'Day', bn: 'দিন', ar: 'يوم' })}</p>
            <p className="font-display text-2xl tabular-nums">{Math.min(st.dayIndex + 1, k.days)}<span className="text-base text-muted-foreground"> / {k.days}</span></p>
            <p className="mt-1 text-xs text-muted-foreground">{t({ en: `${st.remainingPages} pages left`, bn: `${st.remainingPages} পৃষ্ঠা বাকি`, ar: `بقيت ${st.remainingPages} صفحة` })}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {st.finished ? (
            <motion.div key="fin" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="rounded-3xl bg-gold-soft p-5">
              <div className="flex items-center gap-3"><UiIcon name="khatam" size={48} />
                <div><p className="font-display text-xl">{t({ en: 'Khatam complete — barakAllahu feek!', bn: 'খতম সম্পূর্ণ — বারাকাল্লাহু ফীক!', ar: 'تمت الختمة — بارك الله فيك!' })}</p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'May Allah accept it. Start another when you are ready.', bn: 'আল্লাহ কবুল করুন। প্রস্তুত হলে আরেকটি শুরু করুন।', ar: 'تقبّلها الله. ابدأ ختمة أخرى متى شئت.' })}</p></div></div>
              <button onClick={() => archive(k.id)} className="mt-4 h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground">{t({ en: 'Plan a new Khatam', bn: 'নতুন খতম পরিকল্পনা', ar: 'خطّط لختمة جديدة' })}</button>
            </motion.div>
          ) : st.portion ? (
            <motion.div key="today" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="rounded-3xl border border-primary/30 bg-accent/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t({ en: "Today's portion", bn: 'আজকের অংশ', ar: 'ورد اليوم' })}</p>
              <p className="mt-1 font-display text-2xl">
                {t({ en: 'Pages', bn: 'পৃষ্ঠা', ar: 'الصفحات' })} {st.portion.from}{st.portion.to > st.portion.from ? `–${st.portion.to}` : ''}
              </p>
              <p className="mt-1 text-sm"><Portion from={st.portion.from} to={st.portion.to} /></p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t({ en: `${ayahs} ayahs · about ${(st.portion.to - st.portion.from + 1) * 2} min`, bn: `${ayahs}টি আয়াত · প্রায় ${(st.portion.to - st.portion.from + 1) * 2} মিনিট`, ar: `${ayahs} آية · نحو ${(st.portion.to - st.portion.from + 1) * 2} دقيقة` })}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={readerHref(next[0], next[1])} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition active:scale-95">
                  <UiIcon name="read" size={20} /> {t({ en: "Read today's portion", bn: 'আজকের অংশ পড়ুন', ar: 'اقرأ ورد اليوم' })}
                </Link>
                <motion.button whileTap={{ scale: 0.95 }} onClick={markDone} className="h-11 rounded-full border border-primary px-5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground">
                  {t({ en: 'Mark as done ✓', bn: 'সম্পন্ন ✓', ar: 'تم ✓' })}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="rounded-3xl border border-border bg-surface-2 p-5">
              <p className="font-display text-xl">{t({ en: 'Today is complete — well done.', bn: 'আজকের অংশ সম্পন্ন — মাশাআল্লাহ।', ar: 'اكتمل ورد اليوم — أحسنت.' })}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {st.aheadPages > 0 ? t({ en: `You are ${st.aheadPages} page${st.aheadPages === 1 ? '' : 's'} ahead of schedule.`, bn: `আপনি সময়সূচির ${st.aheadPages} পৃষ্ঠা এগিয়ে।`, ar: `أنت متقدم على الخطة بـ${st.aheadPages} صفحة.` }) : t({ en: 'Come back tomorrow for the next portion.', bn: 'পরের অংশের জন্য আগামীকাল আসুন।', ar: 'عُد غدًا للورد التالي.' })}
              </p>
              <button onClick={readAhead} className="mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline">{t({ en: 'Read ahead one more portion', bn: 'আরেকটি অংশ এগিয়ে পড়ুন', ar: 'اقرأ وردًا إضافيًا مسبقًا' })}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(st.behindPages > 0 || st.overdue) && !st.finished && (
        <div className="mt-5 rounded-3xl border border-gold/50 bg-gold-soft p-5">
          <p className="font-semibold">{st.overdue ? t({ en: 'Your plan has passed its end date', bn: 'পরিকল্পনার সময় শেষ হয়ে গেছে', ar: 'تجاوزت خطتك تاريخ انتهائها' }) : t({ en: `You are ${st.behindPages} page${st.behindPages === 1 ? '' : 's'} behind — no worry, catch up gently.`, bn: `আপনি ${st.behindPages} পৃষ্ঠা পিছিয়ে — চিন্তা নেই, ধীরে ধীরে পূরণ করুন।`, ar: `أنت متأخر بـ${st.behindPages} صفحة — لا بأس، تدارك ذلك بهدوء.` })}</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {!st.overdue && <li>• {t({ en: `Read ${st.neededPerDay} pages a day for the next ${st.remainingDays} day${st.remainingDays === 1 ? '' : 's'} to finish on time.`, bn: `সময়মতো শেষ করতে আগামী ${st.remainingDays} দিন দৈনিক ${st.neededPerDay} পৃষ্ঠা পড়ুন।`, ar: `اقرأ ${st.neededPerDay} صفحة يوميًا خلال الأيام الـ${st.remainingDays} القادمة لتنتهي في الموعد.` })}</li>}
            <li>• {t({ en: `Or extend the plan by ${extraDays} day${extraDays === 1 ? '' : 's'} and keep your pace.`, bn: `অথবা পরিকল্পনা ${extraDays} দিন বাড়িয়ে নিজের গতিতে চলুন।`, ar: `أو مدّد الخطة ${extraDays} يومًا وحافظ على وتيرتك.` })}</li>
          </ul>
          <button onClick={() => extend(k.id, extraDays)} className="mt-3 h-10 rounded-full bg-foreground px-5 text-sm font-semibold text-background">{t({ en: `Extend by ${extraDays} days`, bn: `${extraDays} দিন বাড়ান`, ar: `مدّد ${extraDays} يومًا` })}</button>
        </div>
      )}

      <h4 className="mb-3 mt-7 text-sm font-semibold">{t({ en: 'Timeline', bn: 'সময়রেখা', ar: 'الجدول الزمني' })}</h4>
      <Timeline k={k} dayIndex={st.dayIndex} />
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span><i className="me-1 inline-block h-2.5 w-2.5 rounded bg-primary" />{t({ en: 'Done', bn: 'সম্পন্ন', ar: 'تم' })}</span>
        <span><i className="me-1 inline-block h-2.5 w-2.5 rounded border border-gold bg-gold-soft" />{t({ en: 'Today', bn: 'আজ', ar: 'اليوم' })}</span>
        <span><i className="me-1 inline-block h-2.5 w-2.5 rounded bg-destructive/30" />{t({ en: 'Missed', bn: 'বাদ', ar: 'فائت' })}</span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-sm">
        <form onSubmit={(e) => { e.preventDefault(); const p = +manual; if (p >= 0 && p <= TOTAL_PAGES && manual) { setDonePage(k.id, p); setManual('') } }} className="flex items-center gap-2">
          <input value={manual} onChange={(e) => setManual(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder={t({ en: 'I have read up to page…', bn: 'আমি পড়েছি পৃষ্ঠা… পর্যন্ত', ar: 'قرأت حتى الصفحة…' })} className="h-9 w-44 rounded-full border border-border bg-card px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <button className="h-9 rounded-full bg-muted px-3 text-xs font-medium">{t({ en: 'Set', bn: 'সেট', ar: 'تعيين' })}</button>
        </form>
        <span className="ms-auto" />
        <button onClick={() => archive(k.id)} className="text-xs text-muted-foreground hover:text-foreground">{t({ en: 'Archive', bn: 'আর্কাইভ', ar: 'أرشفة' })}</button>
        {confirmDel ? (
          <button onClick={() => remove(k.id)} className="text-xs font-semibold text-destructive">{t({ en: 'Confirm delete', bn: 'মুছে ফেলুন', ar: 'تأكيد الحذف' })}</button>
        ) : (
          <button onClick={() => setConfirmDel(true)} className="text-xs text-muted-foreground hover:text-destructive">{t({ en: 'Delete', bn: 'মুছুন', ar: 'حذف' })}</button>
        )}
      </div>
    </div>
  )
}

export function KhatamPlanner() {
  const t = useTx()
  const mounted = useMounted()
  const khatams = useJourney((s) => s.khatams)
  const activeId = useJourney((s) => s.activeId)
  const [creating, setCreating] = useState(false)
  if (!mounted) return <div className="shimmer h-64 rounded-3xl" />
  const active = khatams.find((k) => k.id === activeId && !k.archived)
  const past = khatams.filter((k) => k.id !== active?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return (
    <div>
      <div className="card-soft relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="relative">
          {active && !creating ? <ActivePlan k={active} /> : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">{t({ en: 'Pick a target and we will split the 604 mushaf pages into a gentle daily portion.', bn: '৬০৪ পৃষ্ঠার মুসহাফকে আমরা সহজ দৈনিক অংশে ভাগ করে দেব — লক্ষ্য বেছে নিন।', ar: 'اختر هدفًا وسنقسّم صفحات المصحف الـ٦٠٤ إلى ورد يومي ميسّر.' })}</p>
              <CreateForm />
              {active && <button onClick={() => setCreating(false)} className="mt-3 text-xs text-muted-foreground underline">{t({ en: 'Back to my current plan', bn: 'চলমান পরিকল্পনায় ফিরুন', ar: 'العودة إلى خطتي الحالية' })}</button>}
            </>
          )}
        </div>
      </div>
      {active && !creating && (
        <button onClick={() => setCreating(true)} className="mt-3 text-xs text-muted-foreground underline-offset-4 hover:underline">{t({ en: 'Start a different plan (archives this one)', bn: 'ভিন্ন পরিকল্পনা শুরু করুন (এটি আর্কাইভ হবে)', ar: 'ابدأ خطة أخرى (تُؤرشف هذه)' })}</button>
      )}
      {past.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-semibold">{t({ en: 'Khatam history', bn: 'খতমের ইতিহাস', ar: 'سجل الختمات' })}</h4>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {past.map((k) => (
              <li key={k.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="flex items-center gap-2"><UiIcon name="khatam" size={24} className={k.finishedAt ? '' : 'opacity-40 grayscale'} />{k.days} {t({ en: 'days', bn: 'দিন', ar: 'يومًا' })} · {k.start}</span>
                <span className={k.finishedAt ? 'font-medium text-gold' : 'text-muted-foreground'}>{k.finishedAt ? t({ en: 'Completed', bn: 'সম্পন্ন', ar: 'مكتملة' }) : `${Math.round((k.donePage / TOTAL_PAGES) * 100)}%`}</span>
                {!k.finishedAt && <button onClick={() => useJourney.setState({ activeId: k.id, khatams: useJourney.getState().khatams.map((x) => (x.id === k.id ? { ...x, archived: false } : x)) })} className="text-xs text-primary hover:underline">{t({ en: 'Resume', bn: 'চালু করুন', ar: 'متابعة' })}</button>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
