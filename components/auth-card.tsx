'use client'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { UiIcon } from '@/components/ui-icon'

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="card-soft w-full max-w-md rounded-[2rem] p-7 sm:p-9">
      <div className="mb-7 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-surface-2"><UiIcon name="crescent" size={44} /></span>
        <h1 className="mt-4 font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
      <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
    </motion.div>
  )
}

export const fieldCls = 'h-12 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
export const btnCls = 'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground shadow-[0_14px_30px_-14px_var(--glow)] transition active:scale-[0.98] disabled:opacity-60'
