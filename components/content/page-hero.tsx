import type { ReactNode } from 'react'
import { UiIcon } from '@/components/ui-icon'

/** Calm hero block used at the top of every content page. */
export function PageHero({ eyebrow, icon, title, subtitle, children, arabic }: { eyebrow?: string; icon?: string; title: ReactNode; subtitle?: ReactNode; children?: ReactNode; arabic?: string }) {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-accent via-card to-gold-soft/40 px-5 py-8 sm:px-10 sm:py-12">
      <div aria-hidden className="bg-pattern absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_70%)]" />
      <div aria-hidden className="absolute -left-16 -top-16 -z-10 size-56 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-20 right-0 -z-10 size-64 rounded-full bg-gold/10 blur-3xl" />
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          {icon && <UiIcon name={icon} size={16} />} {eyebrow}
        </p>
      )}
      {arabic && <p lang="ar" dir="rtl" className="font-arabic text-gradient-gold mb-2 text-4xl sm:text-5xl">{arabic}</p>}
      <h1 className="font-display max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{subtitle}</p>}
      {children}
    </section>
  )
}

export const pageShell = 'mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-16'
