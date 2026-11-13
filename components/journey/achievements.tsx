'use client'
import { motion } from 'framer-motion'
import { useTx } from '@/lib/lang'
import { UiIcon } from '@/components/ui-icon'
import type { Achievement } from '@/lib/hifz/achievements'
import { cn } from '@/lib/utils'

export function AchievementGrid({ items }: { items: Achievement[] }) {
  const t = useTx()
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {items.map((a, i) => {
        const done = a.value >= a.target
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, delay: Math.min(i, 8) * 0.03 }}
            whileHover={{ y: -3 }}
            className={cn('relative overflow-hidden rounded-3xl border p-4 text-center', done ? 'border-gold/50 bg-gold-soft' : 'border-border bg-card')}
          >
            <div className={cn('mx-auto grid h-16 w-16 place-items-center rounded-full', done ? 'bg-card shadow-sm' : 'bg-muted')}>
              <UiIcon name={a.icon} size={38} className={done ? '' : 'opacity-35 grayscale'} />
            </div>
            <p className="mt-3 text-sm font-semibold leading-tight">{t({ en: a.en, bn: a.bn })}</p>
            <p className="mt-1 min-h-8 text-[11px] leading-snug text-muted-foreground">{t({ en: a.descEn, bn: a.descBn })}</p>
            {done ? (
              <p className="mt-2 text-[11px] font-semibold text-gold">{t({ en: 'Unlocked', bn: 'অর্জিত' })} ✦</p>
            ) : (
              <div className="mt-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/60" style={{ width: `${(a.value / a.target) * 100}%` }} /></div>
                <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">{a.value} / {a.target}</p>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
