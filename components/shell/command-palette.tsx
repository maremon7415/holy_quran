'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { AnimatePresence, motion } from 'framer-motion'
import { chapters, surahHref, surahNamesBn, readerHref } from '@/lib/quran/chapters'
import { normalizeLatin } from '@/lib/quran/normalize'
import { useUi } from '@/lib/stores/ui'
import { useTx } from '@/lib/lang'
import { moreNav, primaryNav } from '@/lib/nav'
import { UiIcon } from '@/components/ui-icon'

interface Hit { key: string; surah: number; ayah: number; surahName: string; ar: string; en: string; bn: string }

const POPULAR = [
  { ref: '2:255', en: 'Ayatul Kursi', bn: 'আয়াতুল কুরসি' },
  { ref: '36', en: 'Surah Yasin', bn: 'সূরা ইয়াসিন' },
  { ref: '67', en: 'Surah Mulk', bn: 'সূরা মুলক' },
  { ref: '18', en: 'Surah Kahf', bn: 'সূরা কাহফ' },
  { ref: '55', en: 'Surah Rahman', bn: 'সূরা আর-রহমান' },
  { ref: '2:285', en: 'Last 2 ayahs of Al-Baqarah', bn: 'সূরা বাকারার শেষ দুই আয়াত' },
]

export function CommandPalette() {
  const open = useUi((s) => s.paletteOpen)
  const setOpen = useUi((s) => s.setPaletteOpen)
  const router = useRouter()
  const t = useTx()
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/input|textarea|select/i.test((e.target as HTMLElement)?.tagName) && !(e.target as HTMLElement)?.isContentEditable)) {
        e.preventDefault()
        setOpen(!useUi.getState().paletteOpen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => { if (!open) { setQ(''); setHits([]) } }, [open])

  // full-text search
  useEffect(() => {
    const query = q.trim()
    if (query.length < 3 || /^\d/.test(query)) { setHits([]); setTotal(0); return }
    setLoading(true)
    const ctl = new AbortController()
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=12`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((d) => { setHits(d.hits); setTotal(d.total) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 220)
    return () => { clearTimeout(id); ctl.abort() }
  }, [q])

  const ref = useMemo(() => {
    const m = q.trim().match(/^(\d{1,3})(?:\s*[:.\s]\s*(\d{1,3}))?$/)
    if (!m) return null
    const s = +m[1], a = m[2] ? +m[2] : undefined
    const c = chapters[s - 1]
    if (!c || (a && a > c.versesCount)) return null
    return { s, a, c }
  }, [q])

  const surahMatches = useMemo(() => {
    const nq = normalizeLatin(q)
    if (!q.trim()) return chapters.slice(0, 0)
    return chapters
      .filter((c, i) =>
        normalizeLatin(c.nameSimple).replace(/-/g, ' ').includes(nq) || normalizeLatin(c.nameSimple).replace(/[\s-]/g, '').includes(nq.replace(/\s/g, '')) ||
        normalizeLatin(c.meaning).includes(nq) || surahNamesBn[i].includes(q.trim()) || c.nameArabic.includes(q.trim()) || String(c.id) === q.trim())
      .slice(0, 6)
  }, [q])

  const go = (href: string) => { setOpen(false); router.push(href) }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-start justify-center px-3 pt-[8vh] sm:pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: -16, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: -10, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border bg-popover shadow-2xl"
          >
            <Command shouldFilter={false} label="Search the Quran" className="flex max-h-[75vh] flex-col">
              <div className="flex items-center gap-3 border-b px-4">
                <UiIcon name="search" size={22} />
                <Command.Input
                  autoFocus value={q} onValueChange={setQ}
                  placeholder={t({ en: 'Search surah, 2:255, “mercy”, رحمة, ধৈর্য…', bn: 'সূরা, ২:২৫৫, “ধৈর্য”, رحمة খুঁজুন…' })}
                  className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
                {loading && <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                <kbd className="hidden rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">ESC</kbd>
              </div>
              <Command.List className="overflow-y-auto overscroll-contain p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
                <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {loading ? t({ en: 'Searching 6,236 ayahs…', bn: '৬,২৩৬ আয়াতে খোঁজা হচ্ছে…' }) : t({ en: 'No results. Try another word or a reference like 2:255.', bn: 'কিছু পাওয়া যায়নি। অন্য শব্দ বা ২:২৫৫ এর মতো লিখুন।' })}
                </Command.Empty>

                {ref && (
                  <Command.Group heading={t({ en: 'Go to', bn: 'যান' })}>
                    <Item onSelect={() => go(ref.a ? readerHref(ref.s, ref.a) : surahHref(ref.s))} icon="read"
                      title={ref.a ? `${ref.c.nameSimple} ${ref.s}:${ref.a}` : `${ref.s}. ${ref.c.nameSimple}`} sub={ref.c.meaning} right={ref.c.nameArabic} />
                  </Command.Group>
                )}

                {!q.trim() && (
                  <>
                    <Command.Group heading={t({ en: 'Popular', bn: 'জনপ্রিয়' })}>
                      {POPULAR.map((p) => {
                        const [s, a] = p.ref.split(':').map(Number)
                        return <Item key={p.ref} icon="sparkle" onSelect={() => go(a ? surahHref(s, a) : surahHref(s))} title={t(p)} sub={p.ref} right={chapters[s - 1].nameArabic} />
                      })}
                    </Command.Group>
                    <Command.Group heading={t({ en: 'Explore', bn: 'এক্সপ্লোর' })}>
                      {[...primaryNav, ...moreNav].map((n) => <Item key={n.href} icon={n.icon} onSelect={() => go(n.href)} title={t(n.label)} sub={n.desc ? t(n.desc) : undefined} />)}
                    </Command.Group>
                  </>
                )}

                {surahMatches.length > 0 && (
                  <Command.Group heading={t({ en: 'Surahs', bn: 'সূরা' })}>
                    {surahMatches.map((c) => (
                      <Item key={c.id} icon="quran" onSelect={() => go(surahHref(c.id))} title={`${c.id}. ${t({ en: c.nameSimple, bn: surahNamesBn[c.id - 1] })}`} sub={`${c.meaning} · ${c.versesCount} ${t({ en: 'ayahs', bn: 'আয়াত' })}`} right={c.nameArabic} />
                    ))}
                  </Command.Group>
                )}

                {hits.length > 0 && (
                  <Command.Group heading={`${t({ en: 'Ayahs', bn: 'আয়াত' })} · ${total}`}>
                    {hits.map((h) => (
                      <Command.Item key={h.key} value={h.key} onSelect={() => go(readerHref(h.surah, h.ayah))}
                        className="flex cursor-pointer flex-col gap-1.5 rounded-2xl px-3 py-3 data-[selected=true]:bg-accent">
                        <div className="flex items-center justify-between text-xs text-muted-foreground"><span className="font-semibold text-primary">{h.surahName} {h.key}</span></div>
                        <p dir="rtl" className="line-clamp-1 font-arabic text-lg text-arabic">{h.ar}</p>
                        <p className="line-clamp-2 text-sm text-muted-foreground"><Mark text={/[ঀ-৿]/.test(q) ? h.bn : h.en} q={q} /></p>
                      </Command.Item>
                    ))}
                    {total > hits.length && (
                      <Item icon="search" onSelect={() => go(`/search?q=${encodeURIComponent(q)}`)} title={t({ en: `See all ${total} results`, bn: `সব ${total}টি ফলাফল দেখুন` })} />
                    )}
                  </Command.Group>
                )}
              </Command.List>
              <div className="hidden items-center gap-4 border-t px-4 py-2 text-[11px] text-muted-foreground sm:flex">
                <span><kbd className="rounded border px-1">↑↓</kbd> {t({ en: 'navigate', bn: 'নেভিগেট' })}</span>
                <span><kbd className="rounded border px-1">↵</kbd> {t({ en: 'open', bn: 'খুলুন' })}</span>
                <span className="ml-auto">{t({ en: 'Tip: type 36 or 2:255', bn: 'টিপ: ৩৬ বা 2:255 লিখুন' })}</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Item({ icon, title, sub, right, onSelect }: { icon: string; title: string; sub?: string; right?: string; onSelect: () => void }) {
  return (
    <Command.Item value={title + (sub ?? '')} onSelect={onSelect} className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 data-[selected=true]:bg-accent">
      <UiIcon name={icon} size={28} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{title}</span>
        {sub && <span className="truncate text-xs text-muted-foreground">{sub}</span>}
      </span>
      {right && <span className="font-arabic text-lg text-muted-foreground">{right}</span>}
    </Command.Item>
  )
}

function Mark({ text, q }: { text: string; q: string }) {
  const terms = q.trim().split(/\s+/).filter((t) => t.length > 1).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!terms.length) return <>{text}</>
  const parts = text.split(new RegExp(`(${terms.join('|')})`, 'gi'))
  return <>{parts.map((p, i) => (i % 2 ? <mark key={i} className="rounded bg-gold-soft px-0.5 text-foreground">{p}</mark> : p))}</>
}
