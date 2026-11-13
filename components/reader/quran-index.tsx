'use client'
import Link from '@/lib/i18n/link'
import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { chapters, juzHref, readerHref, surahHref, surahNamesBn, toBanglaDigits } from '@/lib/quran/chapters'
import type { ChapterLite } from '@/lib/quran/types'
import { useAppStore } from '@/lib/store'
import { useUi } from '@/lib/stores/ui'
import { useLang, useMounted, useTx } from '@/lib/lang'
import { getJuzName } from '@/lib/reader/juz'
import { cn } from '@/lib/utils'
import { UiIcon } from '@/components/ui-icon'

export interface JuzLite { juz: number; map: Record<string, string>; count: number }

type Tab = 'surah' | 'juz' | 'order'
type Place = 'all' | 'makkah' | 'madinah'
type Sort = 'default' | 'short' | 'long'

function ProgressRing({ value, size = 52 }: { value: number; size?: number }) {
  const r = size / 2 - 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="pointer-events-none absolute inset-0 -rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="2.5" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value) }}
        transition={{ type: 'spring', stiffness: 60, damping: 18 }}
      />
    </svg>
  )
}

function SurahCard({ c, i, progress }: { c: ChapterLite; i: number; progress: number }) {
  const makki = c.revelationPlace === 'makkah'
  return (
    <motion.li layout="position" transition={{ type: 'spring', stiffness: 380, damping: 34 }} className="list-none">
      <Link href={surahHref(c.id)} className="card-soft lift group animate-fade-up relative flex items-center gap-3.5 p-3.5 pe-4 active:scale-[0.985]" style={{ animationDelay: `${Math.min(i, 24) * 22}ms` }}>
        <span className="relative grid size-[52px] shrink-0 place-items-center">
          <span className="star-badge size-[52px] font-display text-[15px] font-bold text-gold">{c.id}</span>
          {progress > 0 && progress < 1 && <ProgressRing value={progress} />}
          {progress >= 1 && <span className="absolute -end-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground shadow"><Check className="size-3" strokeWidth={3} /></span>}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold leading-tight">
            <span className="en-only">{c.nameSimple}</span>
            <span className="bn-only font-bangla">{surahNamesBn[c.id - 1]}</span>
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
            <span className="en-only">{c.meaning}</span>
            <span className="bn-only font-bangla">{c.nameBn ?? c.meaning}</span>
          </span>
          <span className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <span className={cn('rounded-full px-1.5 py-px', makki ? 'bg-gold-soft text-gold' : 'bg-accent text-primary')}>{makki ? 'Makki' : 'Madani'}</span>
            <span>{c.versesCount} ayahs</span>
          </span>
        </span>
        <span className="font-arabic text-[1.65rem] leading-none text-arabic transition-colors duration-300 group-hover:text-primary" lang="ar">{c.nameArabic}</span>
      </Link>
    </motion.li>
  )
}

export function QuranIndex({ order, juzs }: { order: number[]; juzs: JuzLite[] }) {
  const t = useTx()
  const mounted = useMounted()
  const [tab, setTab] = useState<Tab>('surah')
  const [place, setPlace] = useState<Place>('all')
  const [sort, setSort] = useState<Sort>('default')
  const progressMap = useAppStore((s) => s.readingProgress)

  const list = useMemo(() => {
    let l = tab === 'order' ? order.map((id) => chapters[id - 1]) : [...chapters]
    if (place !== 'all') l = l.filter((c) => c.revelationPlace === place)
    if (sort === 'short') l = [...l].sort((a, b) => a.versesCount - b.versesCount)
    if (sort === 'long') l = [...l].sort((a, b) => b.versesCount - a.versesCount)
    return l
  }, [tab, place, sort, order])

  const prog = (id: number) => {
    if (!mounted) return 0
    const p = progressMap[id]
    if (!p) return 0
    if (p.completed) return 1
    return Math.min(0.99, p.versesRead / (chapters[id - 1].versesCount || 1))
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'surah', label: t({ en: 'Surah', bn: 'সূরা', ar: 'السورة' }) },
    { id: 'juz', label: t({ en: 'Juz', bn: 'পারা', ar: 'الجزء' }) },
    { id: 'order', label: t({ en: 'Revelation order', bn: 'অবতরণ ক্রম', ar: 'ترتيب النزول' }) },
  ]

  return (
    <section aria-label="Surah index" className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-full border bg-card p-1 shadow-sm" role="tablist">
          {tabs.map((x) => (
            <button key={x.id} role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)} className={cn('relative flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex-none', tab === x.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {tab === x.id && <motion.span layoutId="qi-tab" className="absolute inset-0 rounded-full bg-primary" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative">{x.label}</span>
            </button>
          ))}
        </div>
        {tab !== 'juz' && (
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            {([['all', t({ en: 'All', bn: 'সব', ar: 'الكل' })], ['makkah', 'Makki'], ['madinah', 'Madani']] as [Place, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setPlace(id)} className={cn('shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95', place === id ? 'border-primary bg-accent text-primary' : 'bg-card text-muted-foreground hover:text-foreground')}>{label}</button>
            ))}
            <span className="mx-1 w-px shrink-0 bg-border" />
            {([['default', t({ en: 'Mushaf order', bn: 'ক্রমানুসারে', ar: 'ترتيب المصحف' })], ['short', t({ en: 'Shortest', bn: 'ছোট', ar: 'الأقصر' })], ['long', t({ en: 'Longest', bn: 'বড়', ar: 'الأطول' })]] as [Sort, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setSort(id)} className={cn('shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95', sort === id ? 'border-primary bg-accent text-primary' : 'bg-card text-muted-foreground hover:text-foreground')}>{label}</button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === 'juz' ? (
          <motion.ol key="juz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {juzs.map((j, i) => {
              const name = getJuzName(j.juz)
              const entries = Object.entries(j.map)
              return (
                <li key={j.juz} className="animate-fade-up list-none" style={{ animationDelay: `${Math.min(i, 18) * 25}ms` }}>
                  <Link href={juzHref(j.juz)} className="card-soft lift group flex h-full flex-col p-4">
                    <span className="flex items-center gap-3">
                      <span className="star-badge size-11 shrink-0 font-display text-sm font-bold text-gold">{j.juz}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">Juz {j.juz} <span className="font-bangla text-xs text-muted-foreground">· পারা {toBanglaDigits(j.juz)}</span></span>
                        <span className="block truncate text-xs text-muted-foreground">{name.tl} · {j.count} ayahs</span>
                      </span>
                      <span className="font-arabic text-xl text-arabic" lang="ar">{name.ar}</span>
                    </span>
                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {entries.map(([s, range]) => (
                        <span key={s} className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-foreground/75">{chapters[+s - 1].nameSimple} <span className="text-muted-foreground">{range}</span></span>
                      ))}
                    </span>
                  </Link>
                </li>
              )
            })}
          </motion.ol>
        ) : (
          <motion.div key="surahs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            <LayoutGroup>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((c, i) => <SurahCard key={c.id} c={c} i={i} progress={prog(c.id)} />)}
              </ol>
            </LayoutGroup>
            <p className="mt-6 text-center text-xs text-muted-foreground">{list.length} {t({ en: 'surahs', bn: 'টি সূরা', ar: 'سورة' })}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export function SearchTrigger() {
  const t = useTx()
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={() => useUi.getState().setPaletteOpen(true)}
      className="group mx-auto mt-7 flex h-14 w-full max-w-xl items-center gap-3 rounded-full border bg-card/90 ps-5 pe-2 text-start text-muted-foreground shadow-[0_18px_40px_-24px_rgb(var(--shadow-color)/0.5)] backdrop-blur transition hover:border-primary/40"
    >
      <UiIcon name="search" size={22} />
      <span className="flex-1 truncate text-[15px]">{t({ en: 'Search surah, ayah (2:255) or any word…', bn: 'সূরা, আয়াত (২:২৫৫) বা যেকোনো শব্দ খুঁজুন…', ar: 'ابحث عن سورة أو آية (2:255) أو أي كلمة…' })}</span>
      <kbd className="hidden rounded-full border bg-muted px-2.5 py-1 text-[11px] font-bold sm:block">⌘K</kbd>
      <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105"><span className="rtl:rotate-180">→</span></span>
    </motion.button>
  )
}

const POPULAR = [
  { id: 36, ayah: undefined, en: 'Yasin', bn: 'ইয়াসিন', ar: 'يس' },
  { id: 67, ayah: undefined, en: 'Al-Mulk', bn: 'মুলক', ar: 'الملك' },
  { id: 18, ayah: undefined, en: 'Al-Kahf', bn: 'কাহফ', ar: 'الكهف' },
  { id: 55, ayah: undefined, en: 'Ar-Rahman', bn: 'আর-রহমান', ar: 'الرحمن' },
  { id: 2, ayah: 255, en: 'Ayatul Kursi', bn: 'আয়াতুল কুরসি', ar: 'آية الكرسي' },
  { id: 56, ayah: undefined, en: "Al-Waqi'ah", bn: 'ওয়াকিয়া', ar: 'الواقعة' },
]

export function ContinueReading() {
  const t = useTx()
  const lang = useLang()
  const mounted = useMounted()
  const recent = useAppStore((s) => s.recentlyViewed)
  const progress = useAppStore((s) => s.readingProgress)
  const last = mounted ? recent[0] : undefined
  const c = last ? chapters[last.surahNumber - 1] : undefined
  const p = c ? progress[c.id] : undefined
  const pct = c && p ? Math.round(Math.min(1, p.versesRead / c.versesCount) * 100) : 0

  return (
    <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-[1.2fr_1fr]">
      <div className="min-h-[124px]">
        {c && last ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <Link href={readerHref(c.id, last.lastAyahRead > 1 ? last.lastAyahRead : undefined)} className="card-soft lift group relative flex h-full items-center gap-4 overflow-hidden p-4 text-start">
              <div className="bg-pattern pointer-events-none absolute inset-0" />
              <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-accent"><UiIcon name="read" size={34} /></span>
              <span className="relative min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{t({ en: 'Continue reading', bn: 'পড়া চালিয়ে যান', ar: 'تابع القراءة' })}</span>
                <span className="mt-0.5 block truncate font-display text-lg font-semibold">{lang === 'bn' ? `সূরা ${surahNamesBn[c.id - 1]}` : lang === 'ar' ? `سورة ${c.nameArabic}` : `Surah ${c.nameSimple}`}</span>
                <span className="block text-xs text-muted-foreground">{t({ en: `Ayah ${last.lastAyahRead} of ${c.versesCount}`, bn: `আয়াত ${toBanglaDigits(last.lastAyahRead)} / ${toBanglaDigits(c.versesCount)}`, ar: `الآية ${last.lastAyahRead} من ${c.versesCount}` })} · {pct}%</span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.span className="block h-full rounded-full bg-gradient-to-r from-primary to-gold" initial={{ width: 0 }} animate={{ width: `${Math.max(pct, 3)}%` }} transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.2 }} />
                </span>
              </span>
              <span className="relative font-arabic text-2xl text-gold" lang="ar">{c.nameArabic}</span>
            </Link>
          </motion.div>
        ) : (
          <Link href={surahHref(1)} className="card-soft lift group relative flex h-full items-center gap-4 overflow-hidden p-4 text-start">
            <div className="bg-pattern pointer-events-none absolute inset-0" />
            <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-accent"><UiIcon name="quran" size={34} /></span>
            <span className="relative min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{t({ en: 'Begin your journey', bn: 'যাত্রা শুরু করুন', ar: 'ابدأ رحلتك' })}</span>
              <span className="mt-0.5 block font-display text-lg font-semibold">{t({ en: 'Surah Al-Fatihah', bn: 'সূরা আল-ফাতিহা', ar: 'سورة الفاتحة' })}</span>
              <span className="block text-xs text-muted-foreground">{t({ en: 'The Opening · 7 ayahs', bn: 'সূচনা · ৭ আয়াত', ar: 'الفاتحة · ٧ آيات' })}</span>
            </span>
            <span className="relative font-arabic text-2xl text-gold" lang="ar">الفاتحة</span>
          </Link>
        )}
      </div>
      <div className="card-soft p-4 text-start">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{t({ en: 'Popular', bn: 'জনপ্রিয়', ar: 'الأكثر قراءة' })}</p>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR.map((x) => (
            <Link key={x.en} href={surahHref(x.id, x.ayah)} className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold transition hover:bg-accent hover:text-primary active:scale-95">
              {t({ en: x.en, bn: x.bn })}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
