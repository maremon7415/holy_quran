'use client'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Undo2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useDhikr } from '@/lib/stores/dhikr'
import { useLang, useMounted, useTx } from '@/lib/lang'
import { UiIcon } from '@/components/ui-icon'
import { cn } from '@/lib/utils'

interface Step { ar: string; tr: string; en: string; bn: string; target: number }
interface Preset { id: string; en: string; bn: string; steps: Step[] }

const S = {
  sub: { ar: 'سُبْحَانَ ٱللَّٰهِ', tr: 'SubhanAllah', en: 'Glory be to Allah', bn: 'আল্লাহ পবিত্র ও মহান' },
  ham: { ar: 'ٱلْحَمْدُ لِلَّٰهِ', tr: 'Alhamdulillah', en: 'All praise is for Allah', bn: 'সমস্ত প্রশংসা আল্লাহর' },
  akb: { ar: 'ٱللَّٰهُ أَكْبَرُ', tr: 'Allahu Akbar', en: 'Allah is the Greatest', bn: 'আল্লাহ সর্বমহান' },
}
const PRESETS: Preset[] = [
  { id: 'fatima', en: 'Tasbih Fatima', bn: 'তাসবিহে ফাতিমা', steps: [{ ...S.sub, target: 33 }, { ...S.ham, target: 33 }, { ...S.akb, target: 34 }] },
  { id: 'subhanallah', en: 'SubhanAllah', bn: 'সুবহানাল্লাহ', steps: [{ ...S.sub, target: 33 }] },
  { id: 'alhamdulillah', en: 'Alhamdulillah', bn: 'আলহামদুলিল্লাহ', steps: [{ ...S.ham, target: 33 }] },
  { id: 'allahuakbar', en: 'Allahu Akbar', bn: 'আল্লাহু আকবার', steps: [{ ...S.akb, target: 34 }] },
  { id: 'astaghfirullah', en: 'Astaghfirullah', bn: 'আস্তাগফিরুল্লাহ', steps: [{ ar: 'أَسْتَغْفِرُ ٱللَّٰهَ', tr: 'Astaghfirullah', en: 'I seek forgiveness from Allah', bn: 'আমি আল্লাহর কাছে ক্ষমা চাই', target: 100 }] },
  { id: 'salawat', en: 'Salawat', bn: 'দরুদ', steps: [{ ar: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', tr: 'Allahumma salli ala Muhammad', en: 'O Allah, send blessings upon Muhammad ﷺ', bn: 'হে আল্লাহ, মুহাম্মদ ﷺ-এর উপর রহমত বর্ষণ করুন', target: 100 }] },
  { id: 'tahlil', en: 'La ilaha illallah', bn: 'লা ইলাহা ইল্লাল্লাহ', steps: [{ ar: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', tr: 'La ilaha illallah', en: 'There is no god but Allah', bn: 'আল্লাহ ছাড়া কোনো ইলাহ নেই', target: 100 }] },
]
const TARGETS = [33, 99, 100, 0]

const R = 112, C = 2 * Math.PI * R

export function DhikrView() {
  const mounted = useMounted()
  const t = useTx()
  const lang = useLang()
  const { presetId, progress, targets, setPreset, setProgress, setTarget } = useDhikr()
  const sessions = useAppStore((s) => s.dhikrSessions)
  const addSession = useAppStore((s) => s.addDhikrSession)
  const [pulse, setPulse] = useState(0)

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]
  const p = progress[preset.id] ?? { step: 0, count: 0 }
  const step = preset.steps[Math.min(p.step, preset.steps.length - 1)]
  const multi = preset.steps.length > 1
  const target = multi ? step.target : targets[preset.id] ?? step.target
  const done = target > 0 && p.count >= target
  const lastStep = p.step >= preset.steps.length - 1
  const nf = lang === 'bn' ? (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]) : (n: number | string) => String(n)

  const vibrate = (x: number | number[]) => { try { navigator.vibrate?.(x) } catch { /* unsupported */ } }

  const tap = () => {
    setPulse((n) => n + 1)
    if (done) {
      setProgress(preset.id, { step: 0, count: 1 })
      addSession(1); vibrate(12); return
    }
    const next = p.count + 1
    addSession(1)
    if (target > 0 && next >= target) {
      vibrate([70, 50, 70])
      if (multi && !lastStep) { setProgress(preset.id, { step: p.step + 1, count: 0 }); return }
    } else vibrate(next % 10 === 0 ? 30 : 12)
    setProgress(preset.id, { step: p.step, count: next })
  }
  const undo = () => {
    if (p.count > 0) { setProgress(preset.id, { ...p, count: p.count - 1 }); addSession(-1) }
    else if (p.step > 0) { const prev = preset.steps[p.step - 1]; setProgress(preset.id, { step: p.step - 1, count: prev.target - 1 }) }
  }
  const reset = () => setProgress(preset.id, { step: 0, count: 0 })

  const dots = target > 0 && target <= 40 ? target : 33
  const lit = target > 0 ? Math.floor((Math.min(p.count, target) / target) * dots) : p.count % 33
  const frac = target > 0 ? Math.min(1, p.count / target) : (p.count % 33) / 33

  const hist = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return { key, wd: d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' }), total: Math.max(0, sessions.find((s) => s.date === key)?.total ?? 0) }
    })
    const max = Math.max(1, ...days.map((d) => d.total))
    return { days, max, today: days[6].total, week: days.reduce((a, d) => a + d.total, 0), all: sessions.reduce((a, s) => a + Math.max(0, s.total), 0) }
  }, [sessions, lang])

  if (!mounted) return <div className="mx-auto max-w-5xl px-4 pb-32 pt-8"><div className="card-soft h-[36rem] shimmer" /></div>

  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
      <div className="mb-5 flex items-center gap-4">
        <UiIcon name="tasbih" size={56} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t({ en: 'Digital tasbih', bn: 'ডিজিটাল তাসবিহ' })}</p>
          <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{t({ en: 'Dhikr Counter', bn: 'জিকির কাউন্টার' })}</h1>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {PRESETS.map((x) => (
          <button key={x.id} onClick={() => setPreset(x.id)} className={cn('h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition active:scale-95', x.id === preset.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/40')}>
            {t({ en: x.en, bn: x.bn })}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section className="card-soft relative overflow-hidden rounded-[2rem] px-4 pb-6 pt-6 sm:px-8">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[38%] size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)]" />
            <div className="bg-pattern absolute inset-0 opacity-60 [mask-image:radial-gradient(circle_at_50%_40%,black,transparent_70%)]" />
          </div>

          {/* meaning */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={preset.id + p.step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="relative text-center">
              {multi && <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t({ en: `Step ${p.step + 1} of ${preset.steps.length}`, bn: `ধাপ ${nf(p.step + 1)}/${nf(preset.steps.length)}` })}</p>}
              <p lang="ar" dir="rtl" className="font-arabic text-4xl leading-[1.6] text-gold sm:text-5xl">{step.ar}</p>
              <p className="font-display text-lg italic">{step.tr}</p>
              <p className="mt-1 text-sm text-muted-foreground">{lang === 'bn' ? step.bn : step.en}</p>
            </motion.div>
          </AnimatePresence>

          {/* ring counter */}
          <div className="relative mx-auto mt-6 aspect-square w-full max-w-[22rem]">
            <svg viewBox="0 0 300 300" className="absolute inset-0 size-full -rotate-90" aria-hidden>
              <circle cx="150" cy="150" r={R} fill="none" className="stroke-muted" strokeWidth="10" />
              <motion.circle cx="150" cy="150" r={R} fill="none" className={done ? 'stroke-primary' : 'stroke-gold'} strokeWidth="10" strokeLinecap="round" strokeDasharray={C} initial={false} animate={{ strokeDashoffset: C * (1 - frac) }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              {Array.from({ length: dots }, (_, i) => {
                const a = (i / dots) * 2 * Math.PI
                const on = i < lit
                return <circle key={i} cx={150 + 132 * Math.cos(a)} cy={150 + 132 * Math.sin(a)} r={on ? 5 : 3.5} className={cn('transition-all duration-300', on ? 'fill-gold' : 'fill-muted-foreground/30')} />
              })}
            </svg>
            <motion.button
              onClick={tap}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              aria-label={t({ en: 'Count', bn: 'গণনা' })}
              className={cn('absolute inset-[17%] grid select-none place-items-center rounded-full border-2 outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-primary/30',
                'bg-gradient-to-b from-card to-surface-2 shadow-[0_24px_40px_-18px_var(--glow),inset_0_-6px_14px_rgba(0,0,0,0.06)] active:shadow-[0_8px_16px_-10px_var(--glow)]',
                done ? 'border-primary' : 'border-gold/40')}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              <span key={pulse} className="pulse-ring absolute inset-0 rounded-full" aria-hidden />
              <span className="relative text-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={p.count} initial={{ y: 14, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="block font-display text-6xl font-semibold tabular-nums leading-none sm:text-7xl">{nf(p.count)}</motion.span>
                </AnimatePresence>
                <span className="mt-2 block text-sm text-muted-foreground">{done ? <span className="font-semibold text-primary">{lastStep ? t({ en: 'Complete — tap to restart', bn: 'সম্পন্ন — আবার শুরু করুন' }) : ''}</span> : target > 0 ? t({ en: `of ${target}`, bn: `/ ${nf(target)}` }) : t({ en: 'unlimited', bn: 'সীমাহীন' })}</span>
              </span>
            </motion.button>
          </div>

          <div className="relative mt-4 flex items-center justify-center gap-3">
            <button onClick={undo} className="inline-flex h-11 items-center gap-2 rounded-full border bg-card px-5 text-sm font-medium transition hover:border-primary/40 active:scale-95"><Undo2 className="size-4" /> {t({ en: 'Undo', bn: 'ফিরুন' })}</button>
            <button onClick={reset} className="inline-flex h-11 items-center gap-2 rounded-full border bg-card px-5 text-sm font-medium transition hover:border-primary/40 active:scale-95"><RotateCcw className="size-4" /> {t({ en: 'Reset', bn: 'রিসেট' })}</button>
          </div>

          {!multi && (
            <div className="relative mt-5 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t({ en: 'Target', bn: 'লক্ষ্য' })}</span>
              {TARGETS.map((n) => (
                <button key={n} onClick={() => setTarget(preset.id, n)} className={cn('h-9 min-w-11 rounded-full border px-3 text-sm font-semibold transition active:scale-95', target === n ? 'border-gold bg-gold-soft' : 'bg-card hover:border-primary/40')}>{n === 0 ? '∞' : nf(n)}</button>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="card-soft p-5">
            <h2 className="font-display text-lg font-semibold">{t({ en: 'Your dhikr', bn: 'আপনার জিকির' })}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { k: t({ en: 'Today', bn: 'আজ' }), v: hist.today },
                { k: t({ en: '7 days', bn: '৭ দিন' }), v: hist.week },
                { k: t({ en: 'All time', bn: 'মোট' }), v: hist.all },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl bg-surface-2 py-3">
                  <p className="font-display text-xl font-semibold tabular-nums">{nf(x.v.toLocaleString())}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{x.k}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex h-28 items-end gap-2" role="img" aria-label="Last 7 days">
              {hist.days.map((d, i) => (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, (d.total / hist.max) * 80)}px` }} transition={{ type: 'spring', stiffness: 380, damping: 30, delay: i * 0.03 }} className={cn('w-full rounded-t-lg', i === 6 ? 'bg-gradient-to-t from-gold to-primary' : 'bg-gold/40')} title={String(d.total)} />
                  <span className="text-[10px] text-muted-foreground">{d.wd}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-soft p-5 text-sm text-muted-foreground">
            <p className="flex items-start gap-3"><UiIcon name="info" size={26} />
              <span>{t({ en: 'The Prophet ﷺ taught saying SubhanAllah 33, Alhamdulillah 33 and Allahu Akbar 34 times after every prayer (Sahih Muslim 596).', bn: 'নবী ﷺ প্রতি নামাজের পর ৩৩ বার সুবহানাল্লাহ, ৩৩ বার আলহামদুলিল্লাহ এবং ৩৪ বার আল্লাহু আকবার পড়তে শিখিয়েছেন (সহিহ মুসলিম ৫৯৬)।' })}</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
