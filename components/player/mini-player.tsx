'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp, Loader2, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'
import { usePlayer } from '@/lib/stores/player'
import { useReader } from '@/lib/stores/reader'
import { useClock } from '@/lib/audio/clock'
import { chapters } from '@/lib/quran/chapters'
import { getReciter } from '@/lib/audio/reciters'
import { useTx } from '@/lib/lang'
import { EqBars } from './eq-bars'
import { useSurahLabel } from './use-surah-label'
import { cn } from '@/lib/utils'

const R = 19
const C = 2 * Math.PI * R

/** Play/pause button wrapped in a live progress ring. */
function RingButton({ size = 48, onClick, playing, loading, label }: { size?: number; onClick: () => void; playing: boolean; loading: boolean; label: string }) {
  const f = useClock((s) => s.fraction)
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      aria-label={label}
      className="group relative grid shrink-0 place-items-center rounded-full text-primary-foreground transition-transform active:scale-90"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="22" cy="22" r={R} fill="none" strokeWidth="2.5" className="stroke-border" />
        <circle cx="22" cy="22" r={R} fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-primary" strokeDasharray={C} strokeDashoffset={C * (1 - f)} style={{ transition: 'stroke-dashoffset 0.25s linear' }} />
      </svg>
      <span className="relative grid size-[34px] place-items-center rounded-full bg-primary shadow-md transition-transform group-hover:scale-105">
        {loading ? <Loader2 className="size-4 animate-spin" /> : playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 translate-x-px fill-current" />}
      </span>
    </button>
  )
}

export { RingButton }

export function MiniPlayer() {
  const t = useTx()
  const label = useSurahLabel()
  const queue = usePlayer((s) => s.queue)
  const currentKey = usePlayer((s) => s.currentKey)
  const status = usePlayer((s) => s.status)
  const expanded = usePlayer((s) => s.expanded)
  const buffering = useClock((s) => s.buffering)
  const reciterId = useReader((s) => s.reciterId)
  const p = usePlayer.getState

  const visible = !!queue && !expanded
  const surah = queue?.surah ?? 1
  const ayah = Number(currentKey?.split(':')[1] ?? 1)
  const playing = status === 'playing'
  const loading = status === 'loading' || (playing && buffering)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mini"
          className="pointer-events-none fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-3 lg:bottom-6"
          initial={{ y: 90, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 90, opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
          <div
            role="region"
            aria-label={t({ en: 'Audio player', bn: 'অডিও প্লেয়ার', ar: 'مشغّل الصوت' })}
            className="glass pointer-events-auto relative flex w-full max-w-xl items-center gap-2 overflow-hidden rounded-full border border-border py-1.5 ps-1.5 pe-2 shadow-[0_18px_50px_-14px_rgb(var(--shadow-color)/0.45)]"
          >
            <div aria-hidden className="bg-pattern pointer-events-none absolute inset-0" />
            <button
              onClick={() => p().setExpanded(true)}
              className="relative flex min-w-0 flex-1 items-center gap-3 rounded-full text-start"
              aria-label={t({ en: 'Open full player', bn: 'পূর্ণ প্লেয়ার খুলুন', ar: 'فتح المشغّل الكامل' })}
            >
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-gold-soft/70 ring-1 ring-gold/30">
                {playing ? <EqBars size={18} /> : <span className="font-arabic text-lg leading-none text-gold">{chapters[surah - 1].nameArabic.slice(0, 1)}</span>}
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-sm font-semibold">{label(surah)}</span>
                  <span className="shrink-0 font-arabic text-sm text-gold">{chapters[surah - 1].nameArabic}</span>
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {t({ en: 'Ayah', bn: 'আয়াত', ar: 'آية' })} {ayah} · {getReciter(reciterId).name}
                </span>
              </span>
            </button>

            <div className="relative flex shrink-0 items-center gap-0.5">
              <IconBtn className="hidden sm:grid" label={t({ en: 'Previous ayah', bn: 'আগের আয়াত', ar: 'الآية السابقة' })} onClick={() => p().prev()}><SkipBack className="size-4 fill-current" /></IconBtn>
              <RingButton onClick={() => (status === 'error' ? p().resume() : p().toggle())} playing={playing} loading={loading} label={playing ? t({ en: 'Pause', bn: 'বিরতি', ar: 'إيقاف مؤقت' }) : t({ en: 'Play', bn: 'চালান', ar: 'تشغيل' })} />
              <IconBtn label={t({ en: 'Next ayah', bn: 'পরের আয়াত', ar: 'الآية التالية' })} onClick={() => p().next()}><SkipForward className="size-4 fill-current" /></IconBtn>
              <IconBtn className="hidden sm:grid" label={t({ en: 'Expand', bn: 'বড় করুন', ar: 'توسيع' })} onClick={() => p().setExpanded(true)}><ChevronUp className="size-[18px]" /></IconBtn>
              <IconBtn label={t({ en: 'Close player', bn: 'প্লেয়ার বন্ধ করুন', ar: 'إغلاق المشغّل' })} onClick={() => p().stop()}><X className="size-4" /></IconBtn>
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function IconBtn({ children, label, onClick, className }: { children: React.ReactNode; label: string; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      aria-label={label}
      className={cn('grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-90', className)}
    >
      {children}
    </button>
  )
}
