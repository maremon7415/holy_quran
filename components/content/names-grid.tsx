'use client'
import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, RotateCcw, Search, Shuffle, X } from 'lucide-react'
import { useTx } from '@/lib/lang'
import { toBanglaDigits } from '@/lib/quran/chapters'
import { cn } from '@/lib/utils'

export interface NameItem { n: number; slug: string; ar: string; tl: string; tlBn: string; en: string; bn: string; expEn: string; expBn: string }
const spring = { type: 'spring', stiffness: 380, damping: 30 } as const

function FlipCard({ item, index }: { item: NameItem; index: number }) {
  const t = useTx()
  const [flipped, setFlipped] = useState(false)
  const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ ...spring, delay: Math.min(index % 6, 5) * 0.04 }}
      className="[perspective:1000px]"
      onMouseEnter={() => canHover() && setFlipped(true)}
      onMouseLeave={() => canHover() && setFlipped(false)}
    >
      <motion.div className="relative h-[13.5rem] [transform-style:preserve-3d]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }}>
        <button
          type="button"
          aria-label={`${item.tl}: ${item.en}. Flip card`}
          aria-pressed={flipped}
          onClick={(e) => { if (!canHover() || e.detail === 0) setFlipped((f) => !f) }}
          className="card-soft absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-4 text-center [backface-visibility:hidden]"
        >
          <span className="absolute left-3.5 top-3 grid size-7 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">{item.n}</span>
          <span aria-hidden className="bg-pattern pointer-events-none absolute inset-0 rounded-3xl [mask-image:radial-gradient(circle_at_50%_40%,#000,transparent_70%)]" />
          <span lang="ar" dir="rtl" className="font-arabic text-gradient-gold relative py-2 text-[2.6rem] leading-[1.9]">{item.ar}</span>
          <span className="relative mt-1 font-display text-[15px] font-semibold">{item.tl}</span>
          <span className="font-bangla relative text-xs text-muted-foreground">{item.tlBn}</span>
        </button>
        <div className="card-soft absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-accent p-4 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]" aria-hidden={!flipped}>
          <span className="font-display text-base font-semibold leading-tight">{item.en}</span>
          <span className="font-bangla mt-1 text-[15px] text-gold">{item.bn}</span>
          <Link tabIndex={flipped ? 0 : -1} href={`/names-of-allah/${item.slug}`} className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition active:scale-95">
            {t({ en: 'Details', bn: 'বিস্তারিত', ar: 'التفاصيل' })} <ArrowRight className="size-3" />
          </Link>
        </div>
      </motion.div>
    </motion.li>
  )
}

function shuffled<T>(a: T[]) {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] }
  return b
}

function Flashcards({ names }: { names: NameItem[] }) {
  const t = useTx()
  const [deck, setDeck] = useState(names)
  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)
  const [known, setKnown] = useState<number[]>([])
  const cur = deck[i]
  const next = useCallback((k: boolean) => {
    if (k && cur) setKnown((x) => (x.includes(cur.n) ? x : [...x, cur.n]))
    setShow(false)
    setI((x) => (x + 1) % deck.length)
  }, [cur, deck.length])
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>{i + 1} / {deck.length}</span>
        <span className="text-primary">{t({ en: 'Known', bn: 'জানা', ar: 'محفوظ' })}: {known.length}</span>
        <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => { setDeck(shuffled(names)); setI(0); setShow(false) }}><Shuffle className="size-3.5" />{t({ en: 'Shuffle', bn: 'এলোমেলো', ar: 'خلط' })}</button>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><motion.div className="h-full rounded-full bg-primary" animate={{ width: `${((i + 1) / deck.length) * 100}%` }} transition={spring} /></div>
      <AnimatePresence mode="wait">
        <motion.button
          key={cur.n}
          type="button"
          onClick={() => setShow((s) => !s)}
          initial={{ opacity: 0, x: 40, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -40, rotate: -2 }} transition={spring}
          className="card-soft relative mt-5 flex min-h-[20rem] w-full flex-col items-center justify-center rounded-[2rem] p-6 text-center"
        >
          <span aria-hidden className="bg-pattern pointer-events-none absolute inset-0 rounded-[2rem] [mask-image:radial-gradient(circle,#000,transparent_75%)]" />
          <span lang="ar" dir="rtl" className="font-arabic text-gradient-gold relative py-2 text-6xl leading-[1.9] sm:text-7xl">{cur.ar}</span>
          {show ? (
            <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative mt-4 block">
              <span className="font-display block text-xl font-semibold">{cur.tl} · {cur.en}</span>
              <span className="font-bangla mt-1 block text-lg text-gold">{cur.tlBn} · {cur.bn}</span>
            </motion.span>
          ) : (
            <span className="relative mt-6 rounded-full border border-dashed border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground">{t({ en: 'Tap to reveal the meaning', bn: 'অর্থ দেখতে ট্যাপ করুন', ar: 'اضغط لإظهار المعنى' })}</span>
          )}
        </motion.button>
      </AnimatePresence>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => next(false)} className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold transition hover:bg-accent active:scale-95"><RotateCcw className="size-4" />{t({ en: 'Again', bn: 'আবার', ar: 'مرة أخرى' })}</button>
        <button type="button" onClick={() => next(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition active:scale-95"><Check className="size-4" />{t({ en: 'I know it', bn: 'জানি', ar: 'أعرفه' })}</button>
      </div>
    </div>
  )
}

function Quiz({ names }: { names: NameItem[] }) {
  const t = useTx()
  const makeRound = useCallback(() => {
    const target = names[Math.floor(Math.random() * names.length)]
    const opts = shuffled([target, ...shuffled(names.filter((x) => x.n !== target.n)).slice(0, 3)])
    return { target, opts }
  }, [names])
  const [round, setRound] = useState(makeRound)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState({ ok: 0, total: 0, streak: 0 })
  const answer = (n: number) => {
    if (picked != null) return
    setPicked(n)
    setScore((s) => ({ ok: s.ok + (n === round.target.n ? 1 : 0), total: s.total + 1, streak: n === round.target.n ? s.streak + 1 : 0 }))
  }
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>{t({ en: 'Score', bn: 'স্কোর', ar: 'النتيجة' })}: {score.ok}/{score.total}</span>
        <span className="text-gold">{t({ en: 'Streak', bn: 'ধারা', ar: 'التتابع' })}: {score.streak}</span>
      </div>
      <div className="card-soft relative overflow-hidden rounded-[2rem] p-6 text-center">
        <span aria-hidden className="bg-pattern pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle,#000,transparent_75%)]" />
        <p className="relative text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t({ en: 'What does this Name mean?', bn: 'এই নামের অর্থ কী?', ar: 'ما معنى هذا الاسم؟' })}</p>
        <p lang="ar" dir="rtl" className="font-arabic text-gradient-gold relative mt-2 py-2 text-6xl leading-[1.9]">{round.target.ar}</p>
        {picked != null && <p className="relative font-display text-lg font-semibold">{round.target.tl}</p>}
      </div>
      <div className="mt-4 grid gap-2.5">
        {round.opts.map((o) => {
          const right = picked != null && o.n === round.target.n
          const wrong = picked === o.n && o.n !== round.target.n
          return (
            <motion.button
              key={o.n} type="button" whileTap={{ scale: 0.98 }} onClick={() => answer(o.n)} disabled={picked != null}
              animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              className={cn('rounded-2xl border px-4 py-3.5 text-left text-[15px] font-semibold transition-colors', right ? 'border-primary bg-primary text-primary-foreground' : wrong ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border bg-card hover:bg-accent')}
            >
              {t({ en: o.en, bn: o.bn })}
            </motion.button>
          )
        })}
      </div>
      {picked != null && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} type="button" onClick={() => { setRound(makeRound()); setPicked(null) }} className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground active:scale-95">
          {t({ en: 'Next Name', bn: 'পরের নাম', ar: 'الاسم التالي' })}
        </motion.button>
      )}
    </div>
  )
}

type Mode = 'browse' | 'flash' | 'quiz'
export function NamesExplorer({ names }: { names: NameItem[] }) {
  const t = useTx()
  const [mode, setMode] = useState<Mode>('browse')
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return names
    return names.filter((n) => String(n.n) === s || n.tl.toLowerCase().includes(s) || n.en.toLowerCase().includes(s) || n.bn.includes(q.trim()) || n.tlBn.includes(q.trim()) || n.ar.includes(q.trim()))
  }, [names, q])
  const modes: { id: Mode; label: { en: string; bn: string; ar?: string } }[] = [
    { id: 'browse', label: { en: 'Browse', bn: 'সব নাম', ar: 'تصفّح' } },
    { id: 'flash', label: { en: 'Flashcards', bn: 'ফ্ল্যাশকার্ড', ar: 'بطاقات' } },
    { id: 'quiz', label: { en: 'Quiz', bn: 'কুইজ', ar: 'اختبار' } },
  ]
  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 flex flex-col gap-3 bg-background/85 px-4 pb-3 pt-2 backdrop-blur-md sm:top-16 sm:-mx-6 sm:flex-row sm:items-center sm:px-6">
        <div role="tablist" className="relative inline-flex w-full rounded-full border border-border bg-card p-1 sm:w-auto">
          {modes.map((m) => (
            <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => setMode(m.id)} className={cn('relative flex-1 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors sm:flex-none', mode === m.id ? 'text-primary-foreground' : 'text-foreground/70 hover:text-foreground')}>
              {mode === m.id && <motion.span layoutId="names-mode" transition={spring} className="absolute inset-0 rounded-full bg-primary" />}
              <span className="relative">{t(m.label)}</span>
            </button>
          ))}
        </div>
        {mode === 'browse' && (
          <label className="relative block flex-1">
            <span className="sr-only">Search names</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t({ en: 'Search: Rahman, mercy, الرحمن, দয়া, 12…', bn: 'খুঁজুন: রহমান, দয়া, الرحمن, ১২…', ar: 'ابحث: الرحمن، الرحمة، 12…' })} className="h-11 w-full rounded-full border border-border bg-card pl-11 pr-10 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
            {q && <button type="button" aria-label="Clear" onClick={() => setQ('')} className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-muted"><X className="size-4" /></button>}
          </label>
        )}
      </div>
      <div className="mt-5">
        {mode === 'browse' && (
          <>
            <p className="mb-3 text-xs text-muted-foreground">{t({ en: `${list.length} of 99 · tap a card to see its meaning`, bn: `৯৯টির মধ্যে ${toBanglaDigits(list.length)}টি · অর্থ দেখতে কার্ডে ট্যাপ করুন`, ar: `${list.length} من ٩٩ · اضغط على البطاقة لترى معناها` })}</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((n, i) => <FlipCard key={n.n} item={n} index={i} />)}
            </ul>
            {list.length === 0 && <p className="card-soft rounded-3xl p-10 text-center text-sm text-muted-foreground">{t({ en: 'No Name matches your search.', bn: 'কোনো নাম পাওয়া যায়নি।', ar: 'لا يوجد اسم مطابق لبحثك.' })}</p>}
          </>
        )}
        {mode === 'flash' && <Flashcards names={names} />}
        {mode === 'quiz' && <Quiz names={names} />}
      </div>
    </div>
  )
}
