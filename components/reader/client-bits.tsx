'use client'
import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Pause, Play, SlidersHorizontal } from 'lucide-react'
import { usePlayer } from '@/lib/stores/player'
import { useReaderUi } from '@/lib/reader/ui-store'
import { useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'

/** Big "Play surah" CTA (or play a single-ayah range). */
export function PlayButton({ surah, from, to, label, className }: { surah: number; from?: number; to?: number; label?: { en: string; bn: string; ar?: string }; className?: string }) {
  const t = useTx()
  const active = usePlayer((s) => s.queue?.surah === surah && s.status !== 'idle' && (from == null || (s.queue.from === from)))
  const playing = usePlayer((s) => s.status === 'playing' || s.status === 'loading')
  const on = active && playing
  const click = () => {
    const p = usePlayer.getState()
    if (active) return p.toggle()
    if (from != null) p.playRange(surah, from, to ?? from)
    else p.playSurah(surah)
  }
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={click}
      className={cn('group inline-flex items-center gap-2.5 rounded-full bg-primary py-2.5 ps-2.5 pe-5 text-sm font-semibold text-primary-foreground shadow-[0_12px_28px_-12px_var(--primary)] transition-shadow hover:shadow-[0_16px_34px_-12px_var(--primary)]', className)}
    >
      <span className={cn('grid size-8 place-items-center rounded-full bg-primary-foreground/15', on && 'pulse-ring')}>
        {on ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4 translate-x-px" fill="currentColor" />}
      </span>
      {on ? t({ en: 'Pause', bn: 'বিরতি', ar: 'إيقاف مؤقت' }) : t(label ?? { en: 'Play surah', bn: 'সূরা শুনুন', ar: 'تشغيل السورة' })}
    </motion.button>
  )
}

export function SettingsButton({ className }: { className?: string }) {
  const t = useTx()
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => useReaderUi.getState().setSettingsOpen(true)}
      className={cn('inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary/40', className)}
    >
      <SlidersHorizontal className="size-4" /> {t({ en: 'Settings', bn: 'সেটিংস', ar: 'الإعدادات' })}
    </motion.button>
  )
}

/** Height-animated disclosure whose content is always server-rendered (SEO). */
export function Disclosure({ label, children, defaultOpen = false, className, preview = false }: { label: { en: string; bn: string; ar?: string }; children: ReactNode; defaultOpen?: boolean; className?: string; /** show a faded peek when closed */ preview?: boolean }) {
  const t = useTx()
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={className}>
      <div className={cn('relative', preview && !open && 'max-h-40 overflow-hidden fade-bottom')}>
        <div className={preview ? undefined : 'collapse-grid'} data-open={open ? '1' : '0'}>
          <div>{children}</div>
        </div>
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-accent"
      >
        {open ? t({ en: 'Show less', bn: 'কম দেখান', ar: 'عرض أقل' }) : t(label)}
        <ChevronDown className={cn('size-4 transition-transform duration-300', open && 'rotate-180')} />
      </button>
    </div>
  )
}
