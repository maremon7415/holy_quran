'use client'
import { useState } from 'react'
import Link from '@/lib/i18n/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { UiIcon } from '@/components/ui-icon'
import { useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'

export interface Mood {
  id: string
  icon: string
  label: { en: string; bn: string; ar?: string }
  topicSlug: string
  topicTitle: { en: string; bn: string; ar?: string }
  ayah: { ref: string; refAr?: string; ar: string; en: string; bn: string; href: string }
  duaSlug?: string
  duaTitle?: { en: string; bn: string; ar?: string }
}

const spring = { type: 'spring', stiffness: 380, damping: 30 } as const

export function MoodPicker({ moods }: { moods: Mood[] }) {
  const t = useTx()
  const [active, setActive] = useState<string | null>(null)
  const mood = moods.find((m) => m.id === active)
  return (
    <section aria-labelledby="mood-h" className="card-soft relative overflow-hidden rounded-3xl p-5 sm:p-8">
      <div aria-hidden className="bg-pattern pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,#000,transparent_60%)]" />
      <h2 id="mood-h" className="font-display relative text-2xl font-semibold sm:text-3xl">{t({ en: 'How do you feel right now?', bn: 'এই মুহূর্তে আপনার কেমন লাগছে?', ar: 'كيف تشعر الآن؟' })}</h2>
      <p className="relative mt-1 text-sm text-muted-foreground">{t({ en: 'Choose a feeling and we will open a verse and a dua for it.', bn: 'একটি অনুভূতি বেছে নিন, আমরা তার জন্য একটি আয়াত ও দোয়া দেখাব।', ar: 'اختر شعورًا وسنعرض لك آية ودعاءً له.' })}</p>
      <div className="relative mt-5 flex flex-wrap gap-2.5" role="tablist" aria-label={t({ en: 'Moods', bn: 'অনুভূতি', ar: 'المشاعر' })}>
        {moods.map((m, i) => {
          const on = m.id === active
          return (
            <motion.button
              key={m.id}
              role="tab"
              aria-selected={on}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...spring, delay: 0.04 * i }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActive(on ? null : m.id)}
              className={cn(
                'relative inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors',
                on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/40 hover:bg-accent',
              )}
            >
              <UiIcon name={m.icon} size={20} />
              {t(m.label)}
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence mode="wait">
        {mood && (
          <motion.div
            key={mood.id}
            initial={{ opacity: 0, y: 14, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={spring}
            className="relative overflow-hidden"
          >
            <div className="mt-6 rounded-2xl border border-border bg-gold-soft/30 p-5 sm:p-6">
              <p lang="ar" dir="rtl" className="quran-text text-right text-2xl sm:text-3xl">{mood.ayah.ar}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{t({ en: mood.ayah.en, bn: mood.ayah.bn })}</p>
              <Link href={mood.ayah.href} className="mt-1 inline-block text-xs font-semibold text-primary hover:underline">{t({ en: mood.ayah.ref, ar: mood.ayah.refAr })}</Link>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link href={`/topics/${mood.topicSlug}`} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-95">
                  {t({ en: 'More on', bn: 'আরও দেখুন:', ar: 'المزيد عن' })} {t(mood.topicTitle)} <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
                {mood.duaSlug && mood.duaTitle && (
                  <Link href={`/dua/${mood.duaSlug}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-accent active:scale-95">
                    <UiIcon name="dua" size={18} /> {t(mood.duaTitle)}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
