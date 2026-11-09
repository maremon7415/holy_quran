'use client'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang, useMounted, useTx } from '@/lib/lang'
import { chapters, surahNamesBn, surahHref } from '@/lib/quran/chapters'
import { dueCards, interleave, cardKey, parseKey, DAY } from '@/lib/hifz/srs'
import { hifzStreak, useHifz } from '@/lib/stores/hifz'
import { UiIcon } from '@/components/ui-icon'
import Link from 'next/link'
import { MemoryMap, surahMemory } from './memory-map'
import { HifzSession, type Plan } from './session'
import { cn } from '@/lib/utils'

const spring = { type: 'spring' as const, stiffness: 380, damping: 30 }
const QUICK = [1, 112, 113, 114, 111, 110, 109, 108, 107, 105, 103, 102, 99]

function Stat({ icon, value, label, tone }: { icon: string; value: ReactNode; label: string; tone?: string }) {
  return (
    <div className={cn('card-soft flex items-center gap-3 rounded-3xl border border-border bg-card p-4', tone)}>
      <UiIcon name={icon} size={38} />
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none tabular-nums">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function HifzHome({ children }: { children?: ReactNode }) {
  const t = useTx()
  const lang = useLang()
  const mounted = useMounted()
  const cards = useHifz((s) => s.cards)
  const log = useHifz((s) => s.log)
  const prefs = useHifz((s) => s.prefs)
  const setPrefs = useHifz((s) => s.setPrefs)
  const [plan, setPlan] = useState<Plan | null>(null)
  const setupRef = useRef<HTMLDivElement>(null)

  const now = mounted ? Date.now() : 0
  const memory = useMemo(() => surahMemory(mounted ? cards : {}), [cards, mounted])
  const total = mounted ? Object.keys(cards).length : 0
  const due = useMemo(() => (mounted ? interleave(dueCards(cards, now)) : []), [cards, mounted, now])
  const tomorrow = mounted ? Object.values(cards).filter((c) => c.due > now && c.due <= now + DAY).length : 0
  const streak = mounted ? hifzStreak(log) : 0
  const chapter = chapters[prefs.surah - 1]
  const name = (s: number) => (lang === 'bn' ? surahNamesBn[s - 1] : chapters[s - 1].nameSimple)

  const pick = (s: number) => {
    const c = chapters[s - 1]
    setPrefs({ surah: s, from: 1, to: Math.min(c.versesCount, 8) })
    setupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const startLearn = () => {
    const ayahs: number[] = []
    for (let a = prefs.from; a <= prefs.to; a++) ayahs.push(a)
    const chunks = []
    for (let i = 0; i < ayahs.length; i += prefs.chunk) chunks.push({ surah: prefs.surah, ayahs: ayahs.slice(i, i + prefs.chunk) })
    setPlan({ mode: 'learn', chunks })
    window.scrollTo({ top: 0 })
  }
  const startReview = () => {
    const chunks = due.slice(0, 20).map((c) => {
      const [s, a] = parseKey(c.key)
      return { surah: s, ayahs: [a] }
    })
    if (chunks.length) { setPlan({ mode: 'review', chunks }); window.scrollTo({ top: 0 }) }
  }

  const Sel = 'h-11 w-full rounded-2xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

  if (plan) return <HifzSession plan={plan} onExit={() => setPlan(null)} />

  return (
    <div className="space-y-10">
      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="hifz" value={total} label={t({ en: 'Ayahs in memory', bn: 'স্মৃতিতে আয়াত' })} />
        <Stat icon="clock" value={due.length} label={t({ en: 'Due for review', bn: 'রিভিউয়ের জন্য' })} tone={due.length ? 'border-gold/60' : ''} />
        <Stat icon="streak" value={streak} label={t({ en: 'Day streak', bn: 'দিনের স্ট্রিক' })} />
        <Stat icon="sparkle" value={`${Math.round((total / 6236) * 1000) / 10}%`} label={t({ en: 'Of the Quran', bn: 'কুরআনের' })} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* setup */}
        <section ref={setupRef} className="card-soft relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-7">
          <div className="bg-pattern pointer-events-none absolute inset-0" />
          <div className="relative">
            <h2 className="font-display text-2xl">{t({ en: 'Start a session', bn: 'সেশন শুরু করুন' })}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t({ en: 'Choose what to learn — we guide you through listen, read, fade and recall.', bn: 'কী মুখস্থ করবেন বেছে নিন — আমরা শোনা, পড়া, ফেড ও রিকলের মধ্য দিয়ে নিয়ে যাব।' })}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {QUICK.map((s) => (
                <button key={s} onClick={() => pick(s)} className={cn('rounded-full border px-3 py-1 text-xs font-medium transition', prefs.surah === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface-2 text-muted-foreground hover:text-foreground')}>
                  {name(s)}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-[1.6fr_1fr_1fr]">
              <label className="col-span-2 block text-xs text-muted-foreground sm:col-span-1">
                {t({ en: 'Surah', bn: 'সূরা' })}
                <select className={cn(Sel, 'mt-1 text-foreground')} value={prefs.surah} onChange={(e) => pick(+e.target.value)}>
                  {chapters.map((c) => <option key={c.id} value={c.id}>{c.id}. {lang === 'bn' ? surahNamesBn[c.id - 1] : c.nameSimple} — {c.nameArabic}</option>)}
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                {t({ en: 'From ayah', bn: 'শুরু আয়াত' })}
                <input type="number" min={1} max={chapter.versesCount} value={prefs.from} className={cn(Sel, 'mt-1 text-foreground')}
                  onChange={(e) => { const v = Math.max(1, Math.min(chapter.versesCount, +e.target.value || 1)); setPrefs({ from: v, to: Math.max(v, prefs.to) }) }} />
              </label>
              <label className="block text-xs text-muted-foreground">
                {t({ en: 'To ayah', bn: 'শেষ আয়াত' })}
                <input type="number" min={prefs.from} max={chapter.versesCount} value={prefs.to} className={cn(Sel, 'mt-1 text-foreground')}
                  onChange={(e) => setPrefs({ to: Math.max(prefs.from, Math.min(chapter.versesCount, +e.target.value || prefs.from)) })} />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">{t({ en: 'Ayahs per chunk', bn: 'প্রতি অংশে আয়াত' })}</p>
                <div className="flex gap-1 rounded-full bg-muted p-1">
                  {[1, 2, 3, 5].map((n) => (
                    <button key={n} onClick={() => setPrefs({ chunk: n })} className={cn('h-8 flex-1 rounded-full text-sm font-medium transition', prefs.chunk === n ? 'bg-card shadow-sm' : 'text-muted-foreground')}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">{t({ en: 'Listening loops', bn: 'শোনার লুপ' })}</p>
                <div className="flex gap-1 rounded-full bg-muted p-1">
                  {[1, 3, 5, 10].map((n) => (
                    <button key={n} onClick={() => setPrefs({ loops: n })} className={cn('h-8 flex-1 rounded-full text-sm font-medium transition', prefs.loops === n ? 'bg-card shadow-sm' : 'text-muted-foreground')}>{n}×</button>
                  ))}
                </div>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={startLearn} className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110">
              <UiIcon name="hifz" size={22} />
              {t({ en: `Learn ${chapter.nameSimple} ${prefs.from}–${prefs.to}`, bn: `${surahNamesBn[prefs.surah - 1]} ${prefs.from}–${prefs.to} শিখুন` })}
            </motion.button>
          </div>
        </section>

        {/* review */}
        <section className="card-soft rounded-3xl border border-border bg-card p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">{t({ en: 'Review queue', bn: 'রিভিউ তালিকা' })}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t({ en: 'Spaced repetition brings each ayah back just before you forget it.', bn: 'ভুলে যাওয়ার ঠিক আগে প্রতিটি আয়াত ফিরে আসে।' })}</p>
            </div>
            <span className="rounded-full bg-gold-soft px-3 py-1 text-sm font-semibold tabular-nums text-foreground">{due.length}</span>
          </div>
          <AnimatePresence mode="popLayout">
            {due.length > 0 ? (
              <motion.div key="due" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring}>
                <div className="mt-4 flex max-h-40 flex-wrap gap-1.5 overflow-hidden">
                  {due.slice(0, 24).map((c) => {
                    const [s, a] = parseKey(c.key)
                    return <span key={c.key} className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs tabular-nums">{name(s)} {a}</span>
                  })}
                  {due.length > 24 && <span className="px-1 py-1 text-xs text-muted-foreground">+{due.length - 24}</span>}
                </div>
                <button onClick={startReview} className="mt-5 h-12 w-full rounded-full bg-gold py-3 font-semibold text-background transition active:scale-[0.98]">
                  {t({ en: `Review ${Math.min(20, due.length)} ayahs now`, bn: `এখনই ${Math.min(20, due.length)}টি আয়াত রিভিউ করুন` })}
                </button>
              </motion.div>
            ) : (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 rounded-2xl bg-surface-2 p-6 text-center">
                <UiIcon name="crescent" size={44} className="mx-auto" />
                <p className="mt-2 font-medium">{total ? t({ en: 'You are all caught up', bn: 'সব রিভিউ শেষ' }) : t({ en: 'Nothing to review yet', bn: 'এখনও কিছু রিভিউ নেই' })}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {total
                    ? t({ en: `${tomorrow} ayah${tomorrow === 1 ? '' : 's'} due in the next 24 hours.`, bn: `আগামী ২৪ ঘণ্টায় ${tomorrow}টি আয়াত রিভিউ হবে।` })
                    : t({ en: 'Learn your first ayahs and they will appear here.', bn: 'প্রথম আয়াত শিখলেই এখানে দেখা যাবে।' })}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {total > 0 && (
            <Link href={surahHref(prefs.surah)} className="mt-4 block text-center text-xs text-muted-foreground underline-offset-4 hover:underline">
              {t({ en: 'Open the reader for', bn: 'রিডারে খুলুন' })} {name(prefs.surah)}
            </Link>
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-4 font-display text-2xl">{t({ en: 'Your memorisation map', bn: 'আপনার হিফজ মানচিত্র' })}</h2>
        <MemoryMap memory={memory} onPick={pick} selected={prefs.surah} />
      </section>

      {children}
    </div>
  )
}
