'use client'
import { motion } from 'framer-motion'
import { chapters, surahNamesBn } from '@/lib/quran/chapters'
import { useLang, useTx } from '@/lib/lang'
import { strength, type Card } from '@/lib/hifz/srs'
import { cn } from '@/lib/utils'

export interface SurahMemory { total: number; known: number; strong: number }

export function surahMemory(cards: Record<string, Card>): SurahMemory[] {
  const out = chapters.map((c) => ({ total: c.versesCount, known: 0, strong: 0 }))
  for (const [k, c] of Object.entries(cards)) {
    const s = +k.split(':')[0]
    if (!out[s - 1]) continue
    const st = strength(c)
    if (st > 0) out[s - 1].known++
    if (st === 3) out[s - 1].strong++
  }
  return out
}

const fill = (m: SurahMemory) => (m.known === 0 ? 'var(--muted)' : `color-mix(in oklab, var(--primary) ${Math.round(25 + (m.known / m.total) * 75)}%, var(--muted))`)

export function MemoryMap({ memory, onPick, selected }: { memory: SurahMemory[]; onPick: (surah: number) => void; selected: number }) {
  const t = useTx()
  const lang = useLang()
  const juzAmma = chapters.filter((c) => c.id >= 78)
  const rest = chapters.filter((c) => c.id < 78)
  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <h3 className="font-display text-xl">{t({ en: 'Juz Amma', bn: 'জুয আম্মা', ar: 'جزء عمّ' })}</h3>
        <p className="text-xs text-muted-foreground">{t({ en: 'Surahs 78–114 · tap to start', bn: 'সূরা ৭৮–১১৪ · ট্যাপ করে শুরু করুন', ar: 'السور ٧٨–١١٤ · اضغط للبدء' })}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {juzAmma.map((c, i) => {
          const m = memory[c.id - 1]
          const pct = Math.round((m.known / m.total) * 100)
          const full = m.known === m.total
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 12) * 0.02 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onPick(c.id)}
              className={cn('relative overflow-hidden rounded-2xl border bg-card p-3 text-start', selected === c.id ? 'border-primary ring-1 ring-primary' : 'border-border')}
            >
              <div className="absolute inset-x-0 bottom-0 bg-primary/15" style={{ height: `${pct}%` }} />
              <div className="relative flex items-baseline justify-between">
                <span className="text-[11px] tabular-nums text-muted-foreground">{c.id}</span>
                {full && <span className="text-xs text-gold">✦</span>}
              </div>
              <p className="relative mb-1 mt-1 font-arabic text-xl leading-[1.9]" dir="rtl">{c.nameArabic}</p>
              <p className="relative truncate text-xs font-medium">{lang === 'bn' ? surahNamesBn[c.id - 1] : lang === 'ar' ? c.nameArabic : c.nameSimple}</p>
              <p className="relative text-[11px] tabular-nums text-muted-foreground">{m.known}/{m.total}</p>
            </motion.button>
          )
        })}
      </div>

      <h3 className="mb-3 mt-8 font-display text-xl">{t({ en: 'All 114 surahs', bn: 'সকল ১১৪ সূরা', ar: 'جميع السور الـ١١٤' })}</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(2.1rem,1fr))] gap-1.5">
        {[...rest, ...juzAmma].map((c) => {
          const m = memory[c.id - 1]
          return (
            <button
              key={c.id}
              onClick={() => onPick(c.id)}
              title={`${c.id}. ${c.nameSimple} — ${m.known}/${m.total}`}
              className={cn('grid aspect-square place-items-center rounded-lg text-[11px] font-medium tabular-nums transition hover:scale-110', m.known === 0 ? 'text-muted-foreground' : 'text-primary-foreground', selected === c.id && 'ring-2 ring-ring ring-offset-1 ring-offset-background')}
              style={{ background: fill(m) }}
            >
              {c.id}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span>{t({ en: 'Less', bn: 'কম', ar: 'أقل' })}</span>
        {[0, 0.3, 0.6, 1].map((f) => (
          <span key={f} className="h-3 w-5 rounded" style={{ background: fill({ total: 10, known: Math.round(f * 10), strong: 0 }) }} />
        ))}
        <span>{t({ en: 'More memorised', bn: 'বেশি মুখস্থ', ar: 'محفوظ أكثر' })}</span>
      </div>
    </div>
  )
}
