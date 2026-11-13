'use client'
import { Pause, Play } from 'lucide-react'
import { usePlayer } from '@/lib/stores/player'
import { useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'

/** Round play/pause button for one ayah (or a range) using the global audio player. */
export function PlayAyah({ surah, from, to, className }: { surah: number; from: number; to?: number; className?: string }) {
  const t = useTx()
  const active = usePlayer((s) => s.queue?.surah === surah && s.queue.from === from && s.status !== 'idle')
  const playing = usePlayer((s) => s.status === 'playing' || s.status === 'loading')
  const on = active && playing
  const click = () => {
    const p = usePlayer.getState()
    if (active) return p.toggle()
    p.playRange(surah, from, to ?? from)
  }
  const label = on ? t({ en: 'Pause', bn: 'বিরতি', ar: 'إيقاف مؤقت' }) : t({ en: 'Play this ayah', bn: 'এই আয়াত শুনুন', ar: 'تشغيل هذه الآية' })
  return (
    <button
      type="button"
      onClick={click}
      aria-label={`${label} ${surah}:${from}${to && to !== from ? `-${to}` : ''}`}
      aria-pressed={on}
      data-play-ayah={`${surah}:${from}`}
      className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--primary)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary', on && 'pulse-ring', className)}
    >
      {on ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4 translate-x-px rtl:-translate-x-px" fill="currentColor" />}
    </button>
  )
}
