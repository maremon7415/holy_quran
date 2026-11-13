'use client'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Plus, Search, X } from 'lucide-react'
import { useReader } from '@/lib/stores/reader'
import { FEATURED_TRANSLATIONS, fetchTranslationCatalogue, type TranslationMeta } from '@/lib/reader/quran-api'
import { useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'

const cap = (s: string) => s.replace(/^\w/, (c) => c.toUpperCase())
const LANG_BN: Record<string, string> = { bengali: 'বাংলা', english: 'ইংরেজি', urdu: 'উর্দু', hindi: 'হিন্দি', arabic: 'আরবি', indonesian: 'ইন্দোনেশীয়', turkish: 'তুর্কি', persian: 'ফারসি' }

/** Pick any number of extra translations from the Quran.com catalogue (stored as ids in the reader prefs). */
export function TranslationPicker() {
  const t = useTx()
  const ids = useReader((s) => s.extraTr)
  const set = useReader((s) => s.set)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<TranslationMeta[] | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (!open && !ids.length) return
    let off = false
    fetchTranslationCatalogue().then((c) => !off && setCat(c)).catch(() => !off && setErr(true))
    return () => { off = true }
  }, [open, ids.length])

  const byId = useMemo(() => new Map((cat ?? []).map((m) => [m.id, m])), [cat])
  const list = useMemo(() => {
    if (!cat) return []
    const needle = q.trim().toLowerCase()
    const hits = needle
      ? cat.filter((m) => `${m.name} ${m.author} ${m.langName} ${LANG_BN[m.langName] ?? ''}`.toLowerCase().includes(needle))
      : cat
    const featured = needle ? [] : FEATURED_TRANSLATIONS.map((id) => byId.get(id)).filter(Boolean) as TranslationMeta[]
    const rest = hits.filter((m) => !featured.includes(m))
    return [...featured.map((m) => ({ m, featured: true })), ...rest.map((m) => ({ m, featured: false }))]
  }, [cat, q, byId])

  const toggle = (id: number) => set({ extraTr: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] })

  return (
    <div className="mt-3">
      {ids.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2" aria-label={t({ en: 'Extra translations', bn: 'অতিরিক্ত অনুবাদ' })}>
          {ids.map((id) => {
            const m = byId.get(id)
            return (
              <li key={id} className="flex max-w-full items-center gap-1 rounded-full border bg-card py-1 pl-3 pr-1 text-[13px] font-semibold">
                <span className="truncate">{m ? m.name : `#${id}`}</span>
                {m && <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{cap(m.langName)}</span>}
                <button type="button" onClick={() => toggle(id)} className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label={t({ en: `Remove ${m?.name ?? id}`, bn: `সরান ${m?.name ?? id}` })}>
                  <X className="size-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed px-3 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/50 hover:bg-accent"
      >
        <Plus className={cn('size-4 transition-transform', open && 'rotate-45')} />
        {open ? t({ en: 'Done', bn: 'সম্পন্ন' }) : t({ en: 'Add a translation', bn: 'অনুবাদ যোগ করুন' })}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 34 }} className="overflow-hidden">
            <div className="mt-2 rounded-3xl border bg-card p-2">
              <label className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t({ en: 'Search language or translator…', bn: 'ভাষা বা অনুবাদক খুঁজুন…' })}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-label={t({ en: 'Search translations', bn: 'অনুবাদ খুঁজুন' })}
                />
              </label>
              <div className="mt-1 max-h-72 overflow-y-auto overscroll-contain" role="listbox" aria-multiselectable="true">
                {!cat && !err && [0, 1, 2, 3].map((i) => <div key={i} className="shimmer m-2 h-9 rounded-xl bg-muted" />)}
                {err && <p className="p-3 text-sm text-muted-foreground">{t({ en: 'Could not load the list. Check your connection.', bn: 'তালিকা লোড করা যায়নি। ইন্টারনেট সংযোগ দেখুন।' })}</p>}
                {cat && list.length === 0 && <p className="p-3 text-sm text-muted-foreground">{t({ en: 'No match', bn: 'কিছু পাওয়া যায়নি' })}</p>}
                {list.map(({ m, featured }, i) => {
                  const on = ids.includes(m.id)
                  const header = i === 0 && featured ? t({ en: 'Popular', bn: 'জনপ্রিয়' }) : !featured && (i === 0 || list[i - 1].featured) ? t({ en: 'All translations', bn: 'সব অনুবাদ' }) : null
                  return (
                    <div key={`${featured ? 'f' : 'a'}${m.id}`}>
                      {header && <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{header}</p>}
                      <button
                        type="button"
                        role="option"
                        aria-selected={on}
                        onClick={() => toggle(m.id)}
                        className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition', on ? 'bg-accent' : 'hover:bg-muted')}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{m.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{cap(m.langName)}{m.author && m.author !== 'Unknown' && m.author !== m.name ? ` · ${m.author}` : ''}</span>
                        </span>
                        <span className={cn('grid size-6 shrink-0 place-items-center rounded-full border transition', on ? 'border-primary bg-primary text-primary-foreground' : 'text-transparent')}>
                          <Check className="size-3.5" />
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
