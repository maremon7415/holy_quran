'use client'
import { Bookmark } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { useMounted, useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'

/** Bookmark toggle backed by lib/store.ts (persisted locally, no account needed). */
export function DuaBookmark({ slug, variant = 'icon', className }: { slug: string; variant?: 'icon' | 'pill'; className?: string }) {
  const t = useTx()
  const mounted = useMounted()
  const saved = useAppStore((s) => s.bookmarkedDuas.includes(slug))
  const toggle = useAppStore((s) => s.toggleDuaBookmark)
  const on = mounted && saved
  const label = on ? t({ en: 'Saved', bn: 'সংরক্ষিত' }) : t({ en: 'Save', bn: 'সংরক্ষণ' })
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      aria-pressed={on}
      aria-label={on ? 'Remove bookmark' : 'Bookmark this dua'}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(slug) }}
      className={cn(
        variant === 'icon'
          ? 'grid size-9 place-items-center rounded-full transition hover:bg-accent'
          : 'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold transition hover:border-primary/40 hover:bg-accent',
        on && 'text-gold',
        className,
      )}
    >
      <Bookmark className={cn('size-[18px]', variant === 'pill' && 'size-3.5', on && 'fill-current')} />
      {variant === 'pill' && label}
    </motion.button>
  )
}
