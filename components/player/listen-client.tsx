'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Loader2, Pause, Play, Search } from 'lucide-react'
import { usePlayer } from '@/lib/stores/player'
import { useReader } from '@/lib/stores/reader'
import { reciters, getReciter, type ReciterStyle } from '@/lib/audio/reciters'
import { chapters, surahHref, resolveChapterId } from '@/lib/quran/chapters'
import { useMounted, useTx } from '@/lib/lang'
import { UiIcon } from '@/components/ui-icon'
import { cn } from '@/lib/utils'
import { ReciterMonogram } from './reciter-monogram'
import { EqBars } from './eq-bars'
import { useSurahLabel } from './use-surah-label'

/** Hydration-safe reciter id (persisted store). */
function useReciterId() {
  const id = useReader((s) => s.reciterId)
  const mounted = useMounted()
  return mounted ? id : 7
}

export function PlayAllButton() {
  const t = useTx()
  const queue = usePlayer((s) => s.queue)
  const status = usePlayer((s) => s.status)
  const playing = status === 'playing'
  const active = !!queue
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => (active ? usePlayer.getState().toggle() : usePlayer.getState().playSurah(1))}
      className="inline-flex h-12 items-center gap-2.5 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_14px_30px_-12px_var(--glow)] transition hover:brightness-110"
    >
      {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
      {active ? (playing ? t({ en: 'Pause', bn: 'বিরতি', ar: 'إيقاف مؤقت' }) : t({ en: 'Resume', bn: 'চালিয়ে যান', ar: 'استئناف' })) : t({ en: 'Play all from Al-Fatihah', bn: 'আল-ফাতিহা থেকে সব শুনুন', ar: 'تشغيل الكل من الفاتحة' })}
    </motion.button>
  )
}

export function ReciterGallery() {
  const t = useTx()
  const reciterId = useReciterId()
  const [style, setStyle] = useState<ReciterStyle | 'all'>('all')
  const list = useMemo(() => (style === 'all' ? reciters : reciters.filter((r) => r.style === style)), [style])
  const styles: (ReciterStyle | 'all')[] = ['all', 'Murattal', 'Mujawwad', 'Muallim']

  return (
    <section aria-labelledby="reciters-h" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="reciters-h" className="font-display text-2xl font-semibold sm:text-3xl">{t({ en: 'Choose a reciter', bn: 'ক্বারী বাছাই করুন', ar: 'اختر قارئًا' })}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t({ en: `${reciters.length} voices · currently ${getReciter(reciterId).name}`, bn: `${reciters.length} জন ক্বারী · এখন ${getReciter(reciterId).name}`, ar: `${reciters.length} قارئًا · الحالي: ${getReciter(reciterId).name}` })}</p>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist">
          {styles.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={style === s}
              onClick={() => setStyle(s)}
              className={cn('h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition active:scale-95', style === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted')}
            >
              {s === 'all' ? t({ en: 'All', bn: 'সব', ar: 'الكل' }) : s}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((r) => {
          const active = r.id === reciterId
          return (
            <button
              key={r.id}
              onClick={() => useReader.getState().set({ reciterId: r.id })}
              aria-pressed={active}
              className={cn(
                'lift card-soft relative flex items-center gap-3.5 p-3.5 text-left',
                active && '!border-primary/50 bg-accent ring-2 ring-primary/20'
              )}
            >
              <ReciterMonogram name={r.name} size={56} active={active} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{r.name}</span>
                <span className="block truncate font-arabic text-[15px] text-muted-foreground">{r.ar}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-medium text-gold">{r.style}</span>
                  {r.note && <span className="truncate text-[11px] text-muted-foreground">{r.note}</span>}
                </span>
              </span>
              {active && <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function SurahRow({ id }: { id: number }) {
  const t = useTx()
  const label = useSurahLabel()
  const c = chapters[id - 1]
  const isCurrent = usePlayer((s) => s.queue?.surah === id)
  const status = usePlayer((s) => s.status)
  const playing = isCurrent && status === 'playing'
  const loading = isCurrent && status === 'loading'
  return (
    <li className="min-w-0">
      <div className={cn('group flex items-center gap-3 rounded-2xl border p-2.5 pr-3 transition', isCurrent ? 'border-primary/40 bg-accent' : 'border-transparent hover:border-border hover:bg-card')}>
        <button
          onClick={() => (isCurrent ? usePlayer.getState().toggle() : usePlayer.getState().playSurah(id))}
          aria-label={`${playing ? t({ en: 'Pause', bn: 'বিরতি', ar: 'إيقاف مؤقت' }) : t({ en: 'Play', bn: 'চালান', ar: 'تشغيل' })} ${c.nameSimple}`}
          className={cn('relative grid size-12 shrink-0 place-items-center rounded-full transition active:scale-90', isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground')}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : playing ? <EqBars size={16} className="text-primary-foreground" /> : <Play className="size-4 translate-x-px fill-current" />}
        </button>
        <Link href={surahHref(id)} className="flex min-w-0 flex-1 items-center gap-3">
          <span className="w-7 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">{id}</span>
          <span className="min-w-0 flex-1">
            <span className={cn('block truncate text-[15px] font-semibold', isCurrent && 'text-primary')}>{label(id)}</span>
            <span className="block truncate text-xs text-muted-foreground">{c.meaning} · {c.versesCount} {t({ en: 'ayahs', bn: 'আয়াত', ar: 'آية' })}</span>
          </span>
          <span className="shrink-0 font-arabic text-xl text-gold">{c.nameArabic}</span>
        </Link>
      </div>
    </li>
  )
}

export function SurahAudioList() {
  const t = useTx()
  const [q, setQ] = useState('')
  const ids = useMemo(() => {
    const s = q.trim()
    if (!s) return chapters.map((c) => c.id)
    const n = resolveChapterId(s)
    const low = s.toLowerCase()
    return chapters.filter((c) => c.id === n || c.nameSimple.toLowerCase().includes(low) || c.meaning.toLowerCase().includes(low) || c.nameArabic.includes(s) || (c.nameBn ?? '').includes(s)).map((c) => c.id)
  }, [q])

  return (
    <section aria-labelledby="surahs-h" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="surahs-h" className="flex items-center gap-2 font-display text-2xl font-semibold sm:text-3xl">
          <UiIcon name="listen" size={30} /> {t({ en: 'All 114 surahs', bn: 'সকল ১১৪ সূরা', ar: 'جميع السور الـ١١٤' })}
        </h2>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t({ en: 'Search surah…', bn: 'সূরা খুঁজুন…', ar: 'ابحث عن سورة…' })}
            aria-label={t({ en: 'Search surah', bn: 'সূরা খুঁজুন', ar: 'ابحث عن سورة' })}
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>
      {ids.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">{t({ en: 'No surah found', bn: 'কোনো সূরা পাওয়া যায়নি', ar: 'لم يُعثر على سورة' })}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2 xl:grid-cols-3">
          {ids.map((id) => <SurahRow key={id} id={id} />)}
        </ul>
      )}
    </section>
  )
}
