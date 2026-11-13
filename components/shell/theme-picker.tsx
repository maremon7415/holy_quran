'use client'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMounted, useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'
import { UiIcon } from '@/components/ui-icon'

export const THEMES = [
  { id: 'light', name: { en: 'Pearl', bn: 'মুক্তা', ar: 'لؤلؤ' }, bg: '#f8f7f3', fg: '#15211d', accent: '#0e6b51' },
  { id: 'sand', name: { en: 'Parchment', bn: 'পার্চমেন্ট', ar: 'رَقّ' }, bg: '#f3ead6', fg: '#3a2e1f', accent: '#94661b' },
  { id: 'dusk', name: { en: 'Dusk', bn: 'গোধূলি', ar: 'غسق' }, bg: '#232c31', fg: '#e7ecee', accent: '#7fd1b0' },
  { id: 'dark', name: { en: 'Midnight', bn: 'মধ্যরাত', ar: 'منتصف الليل' }, bg: '#0a110f', fg: '#e9f1ed', accent: '#5ed3a4' },
  { id: 'black', name: { en: 'Pure Black', bn: 'কালো', ar: 'أسود خالص' }, bg: '#000000', fg: '#ececec', accent: '#d9b56a' },
] as const

export const THEME_IDS = THEMES.map((t) => t.id) as unknown as string[]

export function ThemeSwatches({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const t = useTx()
  return (
    <div className={cn('grid grid-cols-5 gap-2', className)} role="radiogroup" aria-label="Theme">
      {THEMES.map((th) => {
        const active = mounted && theme === th.id
        return (
          <button
            key={th.id}
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(th.id)}
            className="group flex flex-col items-center gap-1.5 rounded-xl p-1.5 text-[11px] text-muted-foreground transition hover:text-foreground"
          >
            <span
              className={cn('relative grid size-11 place-items-center overflow-hidden rounded-full border-2 transition-all duration-300', active ? 'scale-105 border-primary shadow-[0_0_0_4px_var(--glow)]' : 'border-border group-hover:scale-105')}
              style={{ background: th.bg }}
            >
              <span className="font-arabic text-lg leading-none" style={{ color: th.fg }}>ن</span>
              <span className="absolute bottom-1 end-1 size-2 rounded-full" style={{ background: th.accent }} />
              {active && <motion.span layoutId="theme-active" className="absolute inset-0 rounded-full ring-2 ring-primary/40" />}
            </span>
            {t(th.name)}
          </button>
        )
      })}
    </div>
  )
}

export function ThemePicker() {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  const t = useTx()
  const isDim = mounted && ['dusk', 'dark', 'black'].includes(resolvedTheme ?? '')
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="grid size-10 place-items-center rounded-full transition hover:bg-muted" aria-label={t({ en: 'Change theme', bn: 'থিম পরিবর্তন', ar: 'تغيير السمة' })}>
          <motion.span key={isDim ? 'moon' : 'sun'} initial={{ rotate: -60, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
            <UiIcon name={isDim ? 'moon' : 'sun'} size={22} />
          </motion.span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] rounded-2xl p-3">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t({ en: 'Reading theme', bn: 'পড়ার থিম', ar: 'سمة القراءة' })}</p>
        <ThemeSwatches />
      </PopoverContent>
    </Popover>
  )
}
