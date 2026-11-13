'use client'
import { useRef, useState } from 'react'
import { usePlayer, ayahCount } from '@/lib/stores/player'
import { useClock } from '@/lib/audio/clock'
import { useTx } from '@/lib/lang'
import { fmtTime } from './use-surah-label'

/** Seek bar over the whole surah with ayah ticks and the active range band. */
export function SeekBar() {
  const t = useTx()
  const queue = usePlayer((s) => s.queue)
  const currentKey = usePlayer((s) => s.currentKey)
  const fraction = useClock((s) => s.fraction)
  const ticks = useClock((s) => s.ticks)
  const time = useClock((s) => s.time)
  const duration = useClock((s) => s.duration)
  const mode = useClock((s) => s.mode)
  const ref = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<number | null>(null)
  if (!queue) return null

  const count = ayahCount(queue.surah)
  const ayah = Number(currentKey?.split(':')[1] ?? 1)
  const f = drag ?? fraction
  const bandFrom = ticks[queue.from - 1] ?? 0
  const bandTo = queue.to >= count ? 1 : (ticks[queue.to] ?? 1)
  const ranged = queue.from > 1 || queue.to < count

  // decimate ticks so long surahs stay readable
  const shown: number[] = []
  let last = -1
  for (const x of ticks) if (x - last >= 0.012) { shown.push(x); last = x }

  const frac = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
  }
  const dragAyah = drag != null ? Math.max(1, Math.min(count, (ticks.filter((x) => x <= drag + 1e-6).length || 1))) : ayah

  return (
    <div className="select-none" dir="ltr">
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={t({ en: 'Seek through surah', bn: 'সূরার মধ্যে অনুসন্ধান', ar: 'التنقل في السورة' })}
        aria-valuemin={1}
        aria-valuemax={count}
        aria-valuenow={ayah}
        aria-valuetext={`${t({ en: 'Ayah', bn: 'আয়াত', ar: 'آية' })} ${ayah}`}
        className="group relative flex h-9 cursor-pointer touch-none items-center outline-none"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(frac(e)) }}
        onPointerMove={(e) => { if (drag != null) setDrag(frac(e)) }}
        onPointerUp={(e) => { const v = frac(e); setDrag(null); usePlayer.getState().seekFraction(v) }}
        onPointerCancel={() => setDrag(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); usePlayer.getState().next() }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); usePlayer.getState().prev() }
        }}
      >
        <div className="relative h-1.5 w-full rounded-full bg-muted transition-[height] group-hover:h-2">
          {ranged && <div className="absolute inset-y-0 rounded-full bg-primary/20" style={{ left: `${bandFrom * 100}%`, width: `${(bandTo - bandFrom) * 100}%` }} />}
          <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${f * 100}%` }} />
          {shown.map((x, i) => (
            <span key={i} className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-foreground/15" style={{ left: `${x * 100}%` }} />
          ))}
          <span
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-md ring-4 ring-primary/15 transition-transform group-hover:scale-110 group-focus-visible:scale-125"
            style={{ left: `${f * 100}%` }}
          />
        </div>
      </div>
      <div className="mt-0.5 flex justify-between text-xs tabular-nums text-muted-foreground">
        <span>{mode === 'chapter' && duration ? fmtTime(drag != null ? drag * duration : time) : `${t({ en: 'Ayah', bn: 'আয়াত', ar: 'آية' })} ${dragAyah}`}</span>
        <span>{mode === 'chapter' && duration ? fmtTime(duration) : `${count} ${t({ en: 'ayahs', bn: 'আয়াত', ar: 'آية' })}`}</span>
      </div>
    </div>
  )
}
