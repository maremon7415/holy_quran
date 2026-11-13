'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { UiIcon } from '@/components/ui-icon'
import { DuaBookmark } from './dua-bookmark'
import { useAppStore } from '@/lib/store'
import { useMounted, useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'

export interface DuaItem {
  slug: string
  cat: string
  title: { en: string; bn: string }
  ar: string
  tl: string
  meaning: { en: string; bn: string }
  source: string
  keywords?: string[]
}
export interface DuaCat { id: string; title: { en: string; bn: string }; icon: string }

const spring = { type: 'spring', stiffness: 380, damping: 30 } as const
const strip = (s: string) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '').replace(/[إأآٱ]/g, 'ا')

export function DuaLibrary({ duas, cats }: { duas: DuaItem[]; cats: DuaCat[] }) {
  const t = useTx()
  const mounted = useMounted()
  const bookmarks = useAppStore((s) => s.bookmarkedDuas)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')

  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const d of duas) m[d.cat] = (m[d.cat] ?? 0) + 1
    return m
  }, [duas])

  const list = useMemo(() => {
    const n = q.trim().toLowerCase()
    const na = strip(q.trim())
    return duas.filter((d) => {
      if (cat === 'saved' && !bookmarks.includes(d.slug)) return false
      if (cat !== 'all' && cat !== 'saved' && d.cat !== cat) return false
      if (!n) return true
      return (
        d.title.en.toLowerCase().includes(n) || d.title.bn.includes(q.trim()) || d.meaning.en.toLowerCase().includes(n) ||
        d.meaning.bn.includes(q.trim()) || d.tl.toLowerCase().includes(n) || strip(d.ar).includes(na) ||
        d.source.toLowerCase().includes(n) || (d.keywords ?? []).some((k) => k.toLowerCase().includes(n))
      )
    })
  }, [duas, q, cat, bookmarks])

  const chip = (id: string, label: string, icon?: string, count?: number) => (
    <button
      key={id}
      type="button"
      onClick={() => setCat(id)}
      className={cn(
        'relative inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors',
        cat === id ? 'border-primary text-primary-foreground' : 'border-border bg-card text-foreground/80 hover:border-primary/40 hover:bg-accent',
      )}
    >
      {cat === id && <motion.span layoutId="dua-chip" transition={spring} className="absolute inset-0 -z-0 rounded-full bg-primary" />}
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {icon && <UiIcon name={icon} size={16} />}{label}{count != null && <span className="text-[11px] opacity-70">{count}</span>}
      </span>
    </button>
  )

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 bg-background/85 px-4 pb-3 pt-2 backdrop-blur-md sm:top-16 sm:-mx-6 sm:px-6">
        <label className="relative block">
          <span className="sr-only">Search duas</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t({ en: 'Search duas: anxiety, sleep, رب, রিজিক…', bn: 'দোয়া খুঁজুন: দুশ্চিন্তা, ঘুম, رب, রিজিক…', ar: 'ابحث في الأدعية: القلق، النوم، ربّنا…' })}
            className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-11 text-[15px] shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          {q && (
            <button type="button" aria-label="Clear" onClick={() => setQ('')} className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-muted"><X className="size-4" /></button>
          )}
        </label>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Dua categories">
          {chip('all', t({ en: 'All', bn: 'সব', ar: 'الكل' }), undefined, duas.length)}
          {mounted && bookmarks.length > 0 && chip('saved', t({ en: 'Saved', bn: 'সংরক্ষিত', ar: 'المحفوظات' }), 'bookmark', bookmarks.length)}
          {cats.map((c) => chip(c.id, t(c.title), c.icon, counts[c.id] ?? 0))}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">{list.length} {t({ en: 'duas', bn: 'টি দোয়া', ar: 'دعاء' })}</p>

      <motion.ul layout className="mt-3 grid gap-3.5 sm:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((d, i) => (
            <motion.li
              key={d.slug}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ ...spring, delay: Math.min(i, 8) * 0.025 }}
            >
              <div className="card-soft lift group relative flex h-full flex-col rounded-3xl p-5">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/dua/${d.slug}`} className="font-display text-[17px] font-semibold leading-snug after:absolute after:inset-0 after:content-[''] group-hover:text-primary">
                    {t(d.title)}
                  </Link>
                  <div className="relative z-10 -mr-1.5 -mt-1.5"><DuaBookmark slug={d.slug} /></div>
                </div>
                <p lang="ar" dir="rtl" className="font-arabic mt-3 line-clamp-2 text-right text-[22px] leading-[2] text-arabic">{d.ar}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{t(d.meaning)}</p>
                <p className="mt-auto pt-3 text-[11px] font-semibold uppercase tracking-wide text-gold">{d.source.split(';')[0]}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {list.length === 0 && (
        <div className="card-soft mt-6 rounded-3xl p-10 text-center">
          <UiIcon name="dua" size={44} className="mx-auto opacity-70" />
          <p className="mt-3 font-semibold">{t({ en: 'No duas match your search', bn: 'কোনো দোয়া পাওয়া যায়নি', ar: 'لا توجد أدعية مطابقة لبحثك' })}</p>
          <button type="button" className="mt-3 text-sm font-semibold text-primary hover:underline" onClick={() => { setQ(''); setCat('all') }}>{t({ en: 'Clear filters', bn: 'ফিল্টার মুছুন', ar: 'مسح عوامل التصفية' })}</button>
        </div>
      )}
    </div>
  )
}
