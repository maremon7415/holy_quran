'use client'
import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/** 8-point star (Rub el Hizb) path in a 20x20 box. */
function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path fill="currentColor" d="M10 0l2.2 4.3 4.5-1.7-1.7 4.5L19.3 10l-4.3 2.2 1.7 4.5-4.5-1.7L10 20l-2.2-4.3-4.5 1.7 1.7-4.5L.7 10 5 7.8 3.3 3.3l4.5 1.7z" />
    </svg>
  )
}

const COLORS = ['text-gold', 'text-primary', 'text-foreground/70', 'text-gold']

/** Tasteful confetti of tiny eight-point stars. Change `burst` (a number/key) to fire; falsy = idle. */
export function StarBurst({ burst, count = 34 }: { burst: number | string | null | false; count?: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.4
        const v = 120 + Math.random() * 260
        return {
          id: i,
          x: Math.cos(a) * v,
          y: Math.sin(a) * v * 0.8 - 80,
          r: (Math.random() - 0.5) * 540,
          s: 7 + Math.random() * 12,
          d: Math.random() * 0.15,
          c: COLORS[i % COLORS.length],
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burst, count]
  )
  return (
    <AnimatePresence>
      {burst ? (
        <div key={String(burst)} className="pointer-events-none fixed inset-0 z-[80] grid place-items-center overflow-hidden" aria-hidden>
          {parts.map((p) => (
            <motion.span
              key={p.id}
              className={`absolute ${p.c}`}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: 0 }}
              animate={{ x: p.x, y: [0, p.y, p.y + 260], opacity: [0, 1, 1, 0], scale: [0.2, 1, 0.9], rotate: p.r }}
              transition={{ duration: 2.1, delay: p.d, ease: 'easeOut', times: [0, 0.35, 1] }}
            >
              <Star size={p.s} />
            </motion.span>
          ))}
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export { Star as EightStar }
