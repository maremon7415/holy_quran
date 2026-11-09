'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const bars = [
  { d: 0.9, h: [0.35, 1, 0.5, 0.85, 0.35] },
  { d: 0.7, h: [0.8, 0.3, 1, 0.45, 0.8] },
  { d: 1.1, h: [0.5, 0.9, 0.3, 1, 0.5] },
  { d: 0.8, h: [1, 0.45, 0.75, 0.3, 1] },
]

/** Tiny animated equalizer. `playing=false` freezes it into resting bars. */
export function EqBars({ playing = true, className, size = 16 }: { playing?: boolean; className?: string; size?: number }) {
  return (
    <span className={cn('inline-flex items-end gap-[2px] text-primary', className)} style={{ height: size, width: size }} aria-hidden>
      {bars.map((b, i) => (
        <motion.span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-current"
          style={{ height: '100%' }}
          initial={false}
          animate={playing ? { scaleY: b.h } : { scaleY: 0.3 }}
          transition={playing ? { duration: b.d, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring', stiffness: 300, damping: 24 }}
        />
      ))}
    </span>
  )
}
