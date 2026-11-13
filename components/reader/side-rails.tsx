'use client'
import Link from '@/lib/i18n/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { chapters, surahHref, surahNamesBn } from '@/lib/quran/chapters'
import { normalizeLatin } from '@/lib/quran/normalize'
import { useReaderUi } from '@/lib/reader/ui-store'
import { useReader } from '@/lib/stores/reader'
import { scrollToAyah } from '@/lib/reader/dom'
import { useLang, useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'
import { TajweedLegend } from './tajweed-legend'

/** xl left rail: quick surah switcher. */
export function SurahRail({ current }: { current: number }) {
  const t = useTx()
  const lang = useLang()
  const [q, setQ] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const list = useMemo(() => {
    const n = normalizeLatin(q)
    if (!n) return chapters
    return chapters.filter((c) => String(c.id) === q.trim() || normalizeLatin(c.nameSimple).includes(n) || normalizeLatin(c.meaning).includes(n) || surahNamesBn[c.id - 1].includes(q.trim()))
  }, [q])
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-current]')
    if (el && listRef.current) listRef.current.scrollTop = el.offsetTop - 120
  }, [])
  return (
    <div className="flex max-h-[calc(100dvh-13rem)] flex-col rounded-3xl border bg-card/60 p-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t({ en: 'Find surah…', bn: 'সূরা খুঁজুন…', ar: 'ابحث عن سورة…' })}
        className="mb-2 h-10 w-full shrink-0 rounded-2xl border bg-background px-3 text-sm outline-none transition focus:border-primary/50"
        aria-label="Filter surahs"
      />
      <div ref={listRef} className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto">
        {list.map((c) => (
          <Link
            key={c.id}
            href={surahHref(c.id)}
            data-current={c.id === current ? '' : undefined}
            className={cn('flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm transition-colors', c.id === current ? 'bg-accent font-semibold text-accent-foreground' : 'text-foreground/80 hover:bg-muted')}
          >
            <span className="w-6 text-end text-xs tabular-nums text-muted-foreground">{c.id}</span>
            <span className="min-w-0 flex-1 truncate">{lang === 'bn' ? surahNamesBn[c.id - 1] : lang === 'ar' ? c.nameArabic : c.nameSimple}</span>
            <span className="font-arabic text-base text-muted-foreground" lang="ar">{c.nameArabic}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

/** xl right rail: ayah number grid synced with the ayah in view. */
export function AyahRail({ surah, total }: { surah: number; total: number }) {
  const t = useTx()
  const inView = useReaderUi((s) => s.inView)
  const tajweed = useReader((s) => s.tajweed)
  const cur = inView ? +inView.key.split(':')[1] : 0
  const gridRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const g = gridRef.current
    const el = g?.querySelector<HTMLElement>(`[data-n="${cur}"]`)
    if (g && el) {
      const top = el.offsetTop - g.clientHeight / 2
      g.scrollTo({ top, behavior: 'smooth' })
    }
  }, [cur])
  return (
    <div className="flex max-h-[calc(100dvh-13rem)] flex-col gap-3">
      <div className="flex min-h-0 flex-col rounded-3xl border bg-card/60 p-3">
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{t({ en: 'Ayahs', bn: 'আয়াত', ar: 'الآيات' })}</p>
        <div ref={gridRef} className="no-scrollbar grid min-h-0 grid-cols-5 gap-1 overflow-y-auto">
          {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              data-n={n}
              onClick={() => scrollToAyah(`${surah}:${n}`)}
              className={cn('h-8 rounded-lg text-xs font-semibold tabular-nums transition-colors', n === cur ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      {tajweed && (
        <div className="rounded-3xl border bg-card/60 p-3">
          <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{t({ en: 'Tajweed', bn: 'তাজবীদ', ar: 'التجويد' })}</p>
          <TajweedLegend />
        </div>
      )}
    </div>
  )
}

/** Inline tajweed legend under the header (hidden on xl where the rail shows it). */
export function TajweedNotice({ className }: { className?: string }) {
  const on = useReader((s) => s.tajweed)
  if (!on) return null
  return <TajweedLegend compact className={cn('mt-4 px-1', className)} />
}
