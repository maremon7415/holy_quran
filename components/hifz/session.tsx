'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang, useTx } from '@/lib/lang'
import { chapters, surahNamesBn } from '@/lib/quran/chapters'
import { loadSurah, type HifzVerse } from '@/lib/hifz/verses'
import { cardKey } from '@/lib/hifz/srs'
import { hifzStreak, useHifz } from '@/lib/stores/hifz'
import { usePlayer } from '@/lib/stores/player'
import { UiIcon } from '@/components/ui-icon'
import { StarBurst } from './star-burst'
import { FadeStep, ListenStep, ReadStep, RecallStep, type ChunkCtx } from './steps'
import type { Grade } from '@/lib/hifz/srs'
import { cn } from '@/lib/utils'

export interface Chunk { surah: number; ayahs: number[] }
export interface Plan { mode: 'learn' | 'review'; chunks: Chunk[] }

const STEPS = [
  { id: 'listen', icon: 'listen', en: 'Listen', bn: 'শুনুন', ar: 'استمع' },
  { id: 'read', icon: 'read', en: 'Read', bn: 'পড়ুন', ar: 'اقرأ' },
  { id: 'fade', icon: 'focus', en: 'Fade', bn: 'ফেড', ar: 'إخفاء' },
  { id: 'recall', icon: 'hifz', en: 'Recall', bn: 'রিকল', ar: 'استذكار' },
] as const

const spring = { type: 'spring' as const, stiffness: 380, damping: 30 }

export function HifzSession({ plan, onExit }: { plan: Plan; onExit: () => void }) {
  const t = useTx()
  const lang = useLang()
  const prefs = useHifz((s) => s.prefs)
  const cards = useHifz((s) => s.cards)
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(plan.mode === 'review' ? 3 : 0)
  const [verses, setVerses] = useState<HifzVerse[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [burst, setBurst] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [graded, setGraded] = useState(0)
  const [finished, setFinished] = useState(false)
  const started = useRef(Date.now())
  const chunk = plan.chunks[idx]
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chunk) return
    let live = true
    setVerses(null); setFailed(false)
    loadSurah(chunk.surah).then((v) => live && setVerses(v)).catch(() => live && setFailed(true))
    return () => { live = false }
  }, [chunk])

  useEffect(() => () => usePlayer.getState().stop(), [])
  useEffect(() => { topRef.current?.scrollIntoView({ block: 'start' }) }, [idx])

  const ctx: ChunkCtx | null = useMemo(() => {
    if (!chunk || !verses) return null
    const sel = verses.filter((v) => chunk.ayahs.includes(v.n))
    return { surah: chunk.surah, verses: sel, from: chunk.ayahs[0], to: chunk.ayahs[chunk.ayahs.length - 1] }
  }, [chunk, verses])
  const pool = useMemo(() => (verses ? verses.flatMap((v) => v.words).filter((_, i) => i % 3 === 0).slice(0, 40) : []), [verses])

  const keys = chunk ? chunk.ayahs.map((a) => cardKey(chunk.surah, a)) : []
  const name = (s: number) => (lang === 'bn' ? surahNamesBn[s - 1] : lang === 'ar' ? chapters[s - 1].nameArabic : chapters[s - 1].nameSimple)

  const onGrade = (g: Grade) => {
    const store = useHifz.getState()
    store.grade(keys, g)
    setGraded((n) => n + keys.length)
    // milestone: whole surah now has cards
    const c = chapters[chunk.surah - 1]
    const after = useHifz.getState()
    const have = Array.from({ length: c.versesCount }, (_, i) => after.cards[cardKey(chunk.surah, i + 1)]).every((x) => x && x.reps > 0)
    const id = `surah-${chunk.surah}`
    if (g > 0 && have && !after.milestones.includes(id)) {
      after.addMilestone(id)
      setBanner(t({ en: `Surah ${c.nameSimple} memorised — mā shāʾ Allāh!`, bn: `সূরা ${surahNamesBn[chunk.surah - 1]} মুখস্থ — মাশাআল্লাহ!`, ar: `أتممت حفظ سورة ${c.nameArabic} — ما شاء الله!` }))
      setBurst(id + Date.now())
    }
    if (idx + 1 >= plan.chunks.length) {
      setFinished(true)
      setBurst('end' + Date.now())
    } else {
      setIdx(idx + 1)
      setStep(plan.mode === 'review' ? 3 : 0)
    }
  }

  if (finished) {
    const st = useHifz.getState()
    const mins = Math.max(1, Math.round((Date.now() - started.current) / 60000))
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <StarBurst burst={burst} />
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gold-soft">
          <UiIcon name="sparkle" size={56} />
        </motion.div>
        <h2 className="mt-6 font-display text-3xl">{t({ en: 'Session complete', bn: 'সেশন সম্পন্ন', ar: 'اكتملت الجلسة' })}</h2>
        {banner && <p className="mt-2 font-medium text-gold">{banner}</p>}
        <p className="mt-2 text-muted-foreground">
          {t({ en: `${graded} ayah${graded === 1 ? '' : 's'} practised in about ${mins} min. Your reviews are scheduled — come back when they are due.`, bn: `প্রায় ${mins} মিনিটে ${graded}টি আয়াত অনুশীলন হয়েছে। রিভিউ নির্ধারিত হয়েছে — সময় হলে ফিরে আসুন।`, ar: `تدربت على ${graded} آية في نحو ${mins} دقيقة. جُدولت مراجعاتك — عُد عند حلول موعدها.` })}
        </p>
        <div className="mt-6 flex justify-center gap-3 text-sm">
          <span className="rounded-full bg-accent px-4 py-2 font-medium text-accent-foreground">🔥 {hifzStreak(st.log)} {t({ en: 'day streak', bn: 'দিনের স্ট্রিক', ar: 'أيام متتالية' })}</span>
          <span className="rounded-full bg-muted px-4 py-2 font-medium">{Object.keys(st.cards).length} {t({ en: 'ayahs in memory', bn: 'আয়াত স্মৃতিতে', ar: 'آية محفوظة' })}</span>
        </div>
        <button onClick={onExit} className="mt-8 h-12 rounded-full bg-primary px-8 font-semibold text-primary-foreground transition active:scale-95">
          {t({ en: 'Done', bn: 'সম্পন্ন', ar: 'تم' })}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl" ref={topRef}>
      <StarBurst burst={burst} />
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onExit} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground" aria-label={t({ en: 'Close session', bn: 'সেশন বন্ধ করুন', ar: 'إنهاء الجلسة' })}>
          <X className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <p className="truncate font-semibold">
              {name(chunk.surah)} <span className="font-normal text-muted-foreground">· {chunk.ayahs[0]}{chunk.ayahs.length > 1 ? `–${chunk.ayahs[chunk.ayahs.length - 1]}` : ''}</span>
            </p>
            <p className="shrink-0 tabular-nums text-muted-foreground">{idx + 1}/{plan.chunks.length}</p>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${(idx / plan.chunks.length) * 100 + ((step + 1) / 4 / plan.chunks.length) * 100}%` }} transition={spring} />
          </div>
        </div>
      </div>

      {/* step tabs */}
      <div className="mb-5 grid grid-cols-4 gap-1.5 rounded-2xl bg-muted p-1">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={cn('relative flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-medium transition sm:flex-row sm:justify-center sm:gap-2 sm:text-sm', step === i ? 'text-foreground' : 'text-muted-foreground')}
          >
            {step === i && <motion.span layoutId="hifz-step" transition={spring} className="absolute inset-0 rounded-xl bg-card shadow-sm" />}
            <UiIcon name={s.icon} size={20} className="relative" />
            <span className="relative">{i + 1}. {t({ en: s.en, bn: s.bn, ar: s.ar })}</span>
          </button>
        ))}
      </div>

      <div className="card-soft relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-8">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="relative min-h-[18rem]">
          {failed && (
            <p className="py-16 text-center text-muted-foreground">
              {t({ en: 'Could not load this surah. Check your connection and retry.', bn: 'সূরা লোড করা যায়নি। সংযোগ দেখে আবার চেষ্টা করুন।', ar: 'تعذّر تحميل هذه السورة. تحقق من اتصالك وأعد المحاولة.' })}
              <button onClick={() => setIdx((i) => i)} className="ms-2 underline">{t({ en: 'Retry', bn: 'আবার চেষ্টা', ar: 'إعادة المحاولة' })}</button>
            </p>
          )}
          {!ctx && !failed && (
            <div className="space-y-4 py-8">
              <div className="shimmer mx-auto h-10 w-4/5 rounded-xl" />
              <div className="shimmer mx-auto h-10 w-3/5 rounded-xl" />
              <div className="shimmer mx-auto h-10 w-2/3 rounded-xl" />
            </div>
          )}
          {ctx && (
            <AnimatePresence mode="wait">
              <motion.div key={`${idx}-${step}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                {step === 0 && <ListenStep ctx={ctx} defaultLoops={prefs.loops} />}
                {step === 1 && <ReadStep ctx={ctx} />}
                {step === 2 && <FadeStep ctx={ctx} hints={prefs.hints} />}
                {step === 3 && <RecallStep ctx={ctx} poolWords={pool} card={cards[keys[0]]} onGrade={onGrade} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="inline-flex h-11 items-center gap-1 rounded-full px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-30">
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" /> {t({ en: 'Back', bn: 'পেছনে', ar: 'رجوع' })}
        </button>
        {step < 3 && (
          <button onClick={() => setStep((s) => s + 1)} className="inline-flex h-11 items-center gap-1 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition active:scale-95">
            {t({ en: 'Next step', bn: 'পরের ধাপ', ar: 'الخطوة التالية' })} <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        )}
      </div>
    </div>
  )
}
