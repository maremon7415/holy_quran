'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { useMounted, useTx } from '@/lib/lang'
import { chapters, readerHref, surahHref } from '@/lib/quran/chapters'
import { UiIcon } from '@/components/ui-icon'

export function ContinueReading() {
  const mounted = useMounted()
  const t = useTx()
  const recent = useAppStore((s) => s.recentlyViewed)
  const stats = useAppStore((s) => s.readingStats)
  const goal = useAppStore((s) => s.dailyGoal) || 10
  const progress = useAppStore((s) => s.readingProgress)
  if (!mounted) return <div className="card-soft h-[188px] shimmer" />

  const last = recent?.[0]
  const today = new Date().toLocaleDateString('en-CA')
  const todayRead = stats.readingHistory.find((h) => h.date === today)?.versesRead ?? 0
  const pct = Math.min(1, todayRead / goal)
  const c = last ? chapters[last.surahNumber - 1] : null
  const prog = last ? progress[last.surahNumber] : null
  const surahPct = c && prog ? Math.min(1, prog.lastAyahRead / c.versesCount) : 0

  return (
    <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
      <Link href={c ? readerHref(c.id, last!.lastAyahRead || 1) : surahHref(1)} className="card-soft lift group relative overflow-hidden p-6">
        <div aria-hidden className="bg-pattern absolute inset-0" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{c ? t({ en: 'Continue reading', bn: 'পড়া চালিয়ে যান' }) : t({ en: 'Begin your journey', bn: 'যাত্রা শুরু করুন' })}</p>
            <h3 className="mt-2 font-display text-2xl font-semibold">{c ? c.nameSimple : 'Al-Fatihah'}</h3>
            <p className="text-sm text-muted-foreground">{c ? `${t({ en: 'Ayah', bn: 'আয়াত' })} ${last!.lastAyahRead || 1} / ${c.versesCount}` : t({ en: 'The Opening — 7 ayahs', bn: 'সূচনা — ৭ আয়াত' })}</p>
          </div>
          <span className="font-arabic text-4xl text-gold">{c ? c.nameArabic : 'الفاتحة'}</span>
        </div>
        <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-gold" initial={{ width: 0 }} animate={{ width: `${Math.max(4, surahPct * 100)}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <span className="relative mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {t({ en: 'Resume', bn: 'শুরু করুন' })} <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </Link>

      <Link href="/journey" className="card-soft lift flex items-center gap-5 p-6">
        <Ring pct={pct} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t({ en: "Today's goal", bn: 'আজকের লক্ষ্য' })}</p>
          <p className="mt-1 font-display text-2xl font-semibold">{todayRead}<span className="text-base text-muted-foreground"> / {goal}</span></p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><UiIcon name="streak" size={18} /> {stats.currentStreak} {t({ en: 'day streak', bn: 'দিনের ধারাবাহিকতা' })}</p>
        </div>
      </Link>
    </div>
  )
}

function Ring({ pct }: { pct: number }) {
  const r = 34, C = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 80 80" className="size-20 shrink-0 -rotate-90">
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
      <motion.circle cx="40" cy="40" r={r} fill="none" stroke="url(#ring-g)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C}
        initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - pct) }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
      <defs><linearGradient id="ring-g"><stop stopColor="var(--primary)" /><stop offset="1" stopColor="var(--gold)" /></linearGradient></defs>
    </svg>
  )
}
