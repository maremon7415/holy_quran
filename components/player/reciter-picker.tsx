'use client'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronLeft, Search } from 'lucide-react'
import { reciters } from '@/lib/audio/reciters'
import { useReader } from '@/lib/stores/reader'
import { useTx } from '@/lib/lang'
import { ReciterMonogram } from './reciter-monogram'
import { cn } from '@/lib/utils'

/** Searchable reciter list, slides over the expanded player. */
export function ReciterPicker({ onClose }: { onClose: () => void }) {
  const t = useTx()
  const [q, setQ] = useState('')
  const reciterId = useReader((s) => s.reciterId)
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? reciters.filter((r) => `${r.name} ${r.ar} ${r.style} ${r.note ?? ''}`.toLowerCase().includes(s)) : reciters
  }, [q])

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col bg-background"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
    >
      <div className="mx-auto flex w-full max-w-2xl items-center gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button onClick={onClose} aria-label={t({ en: 'Back', bn: 'পিছনে', ar: 'رجوع' })} className="grid size-10 place-items-center rounded-full hover:bg-muted"><ChevronLeft className="size-5" /></button>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t({ en: 'Search reciters…', bn: 'ক্বারী খুঁজুন…', ar: 'ابحث عن قارئ…' })}
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {list.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">{t({ en: 'No reciter found', bn: 'কোনো ক্বারী পাওয়া যায়নি', ar: 'لم يُعثر على قارئ' })}</p>}
        <ul className="space-y-1.5">
          {list.map((r) => {
            const active = r.id === reciterId
            return (
              <li key={r.id}>
                <button
                  onClick={() => { useReader.getState().set({ reciterId: r.id }); onClose() }}
                  className={cn('flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition active:scale-[0.99]', active ? 'border-primary/40 bg-accent' : 'border-transparent hover:bg-muted')}
                >
                  <ReciterMonogram name={r.name} active={active} size={46} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{r.name}</span>
                    <span className="block truncate font-arabic text-base text-muted-foreground">{r.ar}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-medium text-gold">{r.style}</span>
                    {r.chapter && <span className="text-[10px] text-muted-foreground">{t({ en: 'word-synced', bn: 'শব্দ-সিঙ্ক', ar: 'متزامن بالكلمات' })}</span>}
                  </span>
                  {active && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </motion.div>
  )
}
