'use client'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Search, X } from 'lucide-react'
import { useLang, useTx } from '@/lib/lang'
import { UiIcon } from '@/components/ui-icon'
import { cn } from '@/lib/utils'

export interface Masala { id: string; category: string; question: { en: string; bn: string }; answer: { en: string; bn: string }; reference: string }

const CAT_BN: Record<string, string> = { Salah: 'নামাজ', Tahara: 'পবিত্রতা', Sawm: 'রোজা', Zakat: 'যাকাত', Hajj: 'হজ্জ' }

export function MasayelView({ items }: { items: Masala[] }) {
  const t = useTx()
  const lang = useLang()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null)

  const cats = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.category)))], [items])
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return items.filter((m) => (cat === 'All' || m.category === cat) && (!s || [m.question.en, m.answer.en, m.question.bn, m.answer.bn, m.reference].some((x) => x.toLowerCase().includes(s))))
  }, [items, q, cat])
  const catLabel = (c: string) => (c === 'All' ? t({ en: 'All', bn: 'সব', ar: 'الكل' }) : lang === 'bn' ? CAT_BN[c] ?? c : c)

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
      <header className="relative mb-6 overflow-hidden rounded-[2rem] border bg-card px-6 py-8 sm:px-10">
        <div aria-hidden className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-5">
          <UiIcon name="tafsir" size={64} className="hidden sm:block" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t({ en: 'Masayel · Fiqh Q&A', bn: 'মাসায়েল · ফিকহ প্রশ্নোত্তর', ar: 'المسائل · أسئلة فقهية' })}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold leading-tight sm:text-4xl">{t({ en: 'Everyday Islamic rulings', bn: 'দৈনন্দিন ইসলামি মাসায়েল', ar: 'أحكام شرعية يومية' })}</h1>
            <p className="mt-2 text-muted-foreground">{t({ en: 'Concise answers on worship with references. Consult a qualified scholar for personal rulings.', bn: 'ইবাদতের সংক্ষিপ্ত উত্তর, রেফারেন্সসহ। ব্যক্তিগত সিদ্ধান্তে যোগ্য আলেমের পরামর্শ নিন।', ar: 'إجابات موجزة في العبادات مع المراجع. استشر عالمًا مؤهلًا في المسائل الشخصية.' })}</p>
          </div>
        </div>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t({ en: 'Search questions & answers…', bn: 'প্রশ্ন ও উত্তর খুঁজুন…', ar: 'ابحث في الأسئلة والأجوبة…' })} aria-label="Search" className="h-12 w-full rounded-full border bg-card pl-11 pr-11 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
        {q && <button aria-label="Clear" onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
      </div>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn('h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition active:scale-95', cat === c ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/40')}>{catLabel(c)}</button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <AnimatePresence initial={false}>
          {list.map((m) => {
            const isOpen = open === m.id
            return (
              <motion.article layout key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="card-soft lift overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen} className="flex w-full items-start gap-4 p-5 text-left">
                  <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-2"><UiIcon name={m.category === 'Salah' ? 'prayer' : m.category === 'Sawm' ? 'moon' : 'heart'} size={26} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 inline-block rounded-full bg-gold-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">{catLabel(m.category)}</span>
                    <span className="block font-display text-lg font-semibold leading-snug">{t({ en: m.question.en, bn: m.question.bn })}</span>
                  </span>
                  <ChevronDown className={cn('mt-2 size-5 shrink-0 text-muted-foreground transition', isOpen && 'rotate-180')} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 34 }} className="overflow-hidden">
                      <div className="space-y-3 border-t px-5 pb-5 pt-4">
                        <p className="leading-relaxed">{m.answer.en}</p>
                        <p lang="bn" className="font-bangla leading-relaxed text-muted-foreground">{m.answer.bn}</p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gold">{m.reference}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </AnimatePresence>
        {list.length === 0 && (
          <div className="card-soft p-10 text-center">
            <UiIcon name="search" size={64} className="mx-auto" />
            <p className="mt-3 font-display text-xl font-semibold">{t({ en: 'No matching questions', bn: 'কোনো প্রশ্ন পাওয়া যায়নি', ar: 'لا توجد أسئلة مطابقة' })}</p>
            <button onClick={() => { setQ(''); setCat('All') }} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{t({ en: 'Clear filters', bn: 'ফিল্টার মুছুন', ar: 'مسح عوامل التصفية' })}</button>
          </div>
        )}
      </div>
    </div>
  )
}
