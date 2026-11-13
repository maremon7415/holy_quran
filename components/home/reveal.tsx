import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Scroll-reveal via CSS scroll-driven animations (progressive enhancement: content is visible without JS / for crawlers). */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return <div className={cn('reveal', className)} style={delay ? { animationDelay: `${delay}s` } : undefined}>{children}</div>
}
