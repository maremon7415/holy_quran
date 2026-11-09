'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useReaderUi } from '@/lib/reader/ui-store'
import { fetchTafsir, TAFSIRS } from '@/lib/reader/quran-api'
import { sanitizeHtml } from '@/lib/reader/sanitize'
import { readAyahText } from '@/lib/reader/dom'
import { chapters, surahHref } from '@/lib/quran/chapters'
import { useLang, useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'
import { Panel } from './panel'

type State = { status: 'loading' } | { status: 'error' } | { status: 'ok'; html: string; covers: string[] }

export function TafsirPanel() {
  const t = useTx()
  const lang = useLang()
  const key = useReaderUi((s) => s.tafsirKey)
  const open = useReaderUi((s) => s.openTafsir)
  const [tab, setTab] = useState<number>(169)
  const [state, setState] = useState<State>({ status: 'loading' })
  const [lastKey, setLastKey] = useState<string | null>(null)
  if (key && key !== lastKey) setLastKey(key)
  const k = key ?? lastKey

  useEffect(() => setTab(lang === 'bn' ? 165 : 169), [lang])

  useEffect(() => {
    if (!key) return
    let off = false
    setState({ status: 'loading' })
    fetchTafsir(tab, key)
      .then((d) => !off && setState({ status: 'ok', html: sanitizeHtml(d.text), covers: d.verses }))
      .catch(() => !off && setState({ status: 'error' }))
    return () => { off = true }
  }, [key, tab])

  const [s, a] = (k ?? '1:1').split(':').map(Number)
  const c = chapters[s - 1]
  const ar = k ? readAyahText(k).ar : ''
  const neighbour = (d: number) => {
    const n = a + d
    if (n < 1 || n > c.versesCount) return null
    return `${s}:${n}`
  }
  const go = (d: number) => {
    const nk = neighbour(d)
    if (nk) open(nk)
  }
  const meta = TAFSIRS.find((x) => x.id === tab)!

  return (
    <Panel
      open={!!key}
      onOpenChange={(o) => !o && open(null)}
      wide
      title={<span>{t({ en: 'Tafsir', bn: 'তাফসীর' })} <span className="text-muted-foreground">· {c?.nameSimple} {k}</span></span>}
      footer={
        <div className="flex items-center justify-between gap-2">
          <button type="button" disabled={!neighbour(-1)} onClick={() => go(-1)} className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-40">
            <ChevronLeft className="size-4" /> {t({ en: 'Previous', bn: 'আগের' })}
          </button>
          {k && (
            <Link href={surahHref(s, a)} onClick={() => open(null)} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              {t({ en: 'Ayah page', bn: 'আয়াত পেজ' })} <ExternalLink className="size-3.5" />
            </Link>
          )}
          <button type="button" disabled={!neighbour(1)} onClick={() => go(1)} className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-40">
            {t({ en: 'Next', bn: 'পরের' })} <ChevronRight className="size-4" />
          </button>
        </div>
      }
    >
      {ar && (
        <p className="quran-text mb-4 rounded-3xl bg-surface-2 px-4 py-3 text-right text-[26px] leading-[2.1]" lang="ar">{ar}</p>
      )}
      <div className="sticky top-0 z-10 -mx-5 mb-4 bg-popover/95 px-5 pb-2 pt-1 backdrop-blur">
        <div className="flex gap-1 rounded-2xl bg-muted p-1" role="tablist">
          {TAFSIRS.map((x) => (
            <button
              key={x.id}
              role="tab"
              type="button"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={cn('relative flex-1 rounded-xl px-2 py-2 text-[13px] font-semibold transition-colors', tab === x.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              {tab === x.id && <motion.span layoutId="tafsir-tab" className="absolute inset-0 rounded-xl bg-card shadow-sm" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className={cn('relative', x.lang === 'bn' && 'font-bangla')}>{t(x.name)}</span>
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${k}-${tab}-${state.status}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
          {state.status === 'loading' && (
            <div className="space-y-3">
              {[92, 100, 84, 96, 70, 88].map((w, i) => <div key={i} className="shimmer h-4 rounded-full bg-muted" style={{ width: `${w}%` }} />)}
            </div>
          )}
          {state.status === 'error' && <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">{t({ en: 'Could not load tafsir. Check your connection and try again.', bn: 'তাফসীর লোড করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।' })}</p>}
          {state.status === 'ok' &&
            (state.html ? (
              <>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{meta.full}{state.covers.length > 1 && ` · ${state.covers[0]}–${state.covers[state.covers.length - 1].split(':')[1]}`}</p>
                <div className={cn('reader-prose', meta.lang === 'bn' && 'font-bangla')} lang={meta.lang} dir={meta.lang === 'ar' ? 'rtl' : 'ltr'} dangerouslySetInnerHTML={{ __html: state.html }} />
              </>
            ) : (
              <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                {t({ en: 'The commentary for this ayah is included with a neighbouring ayah.', bn: 'এই আয়াতের তাফসীর পার্শ্ববর্তী আয়াতের সাথে দেওয়া হয়েছে।' })}{' '}
                {neighbour(-1) && <button type="button" className="font-semibold text-primary underline-offset-2 hover:underline" onClick={() => go(-1)}>{t({ en: 'See previous ayah', bn: 'আগের আয়াত দেখুন' })}</button>}
              </div>
            ))}
        </motion.div>
      </AnimatePresence>
    </Panel>
  )
}
