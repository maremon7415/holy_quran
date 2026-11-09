'use client'
import { motion } from 'framer-motion'
import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors duration-300', checked ? 'bg-primary' : 'bg-muted-foreground/25')}
    >
      <motion.span
        className="block size-6 rounded-full bg-card shadow-[0_2px_6px_rgb(0_0_0/0.25)]"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      />
    </button>
  )
}

export function SwitchRow({ icon, title, hint, checked, onChange }: { icon?: ReactNode; title: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 px-1 py-2.5">
      {icon && <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight">{title}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={checked} onChange={onChange} label={title} />
    </label>
  )
}

export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string }) {
  const id = useId()
  return (
    <div className={cn('relative flex rounded-2xl bg-muted p-1', className)} role="radiogroup">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn('relative flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors', on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            {on && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-xl bg-card shadow-sm" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function RangeRow({ label, value, min, max, step = 1, onChange, suffix = 'px' }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; suffix?: string }) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div className="py-2">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums text-muted-foreground">{value}{suffix}</span>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - step * 2))} className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold active:scale-90" aria-label={`Decrease ${label}`}>A<sup className="text-[8px]">−</sup></button>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="reader-range" style={{ ['--fill' as string]: `${fill}%` }} aria-label={label} />
        <button type="button" onClick={() => onChange(Math.min(max, value + step * 2))} className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-base font-bold active:scale-90" aria-label={`Increase ${label}`}>A<sup className="text-[9px]">+</sup></button>
      </div>
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="mb-2 mt-6 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground first:mt-2">{children}</p>
}
