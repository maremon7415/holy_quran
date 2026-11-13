'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, Eye, Shuffle, Check } from 'lucide-react'
import { useTx, useLang } from '@/lib/lang'
import { usePlayer } from '@/lib/stores/player'
import { firstLetter, hiddenSet, wordChoices } from '@/lib/hifz/words'
import { formatInterval, GRADES, previewInterval, type Card, type Grade } from '@/lib/hifz/srs'
import type { HifzVerse } from '@/lib/hifz/verses'
import { ArabicBlock } from './arabic-block'
import { ReciteCheck } from './recite-check'
import { cn } from '@/lib/utils'

export interface ChunkCtx {
  surah: number
  verses: HifzVerse[]
  from: number
  to: number
}

const spring = { type: 'spring' as const, stiffness: 380, damping: 30 }

function Translation({ verses }: { verses: HifzVerse[] }) {
  const lang = useLang()
  return (
    <div className="mt-5 space-y-1.5 text-center text-[15px] leading-relaxed text-muted-foreground">
      {verses.map((v) => (
        <p key={v.n} className={lang === 'bn' ? 'font-bangla' : ''}>
          <span className="me-1 text-gold">{v.n}.</span>
          {lang === 'bn' ? v.bn : v.en}
        </p>
      ))}
    </div>
  )
}

/* ------------------------------ 1. Listen ------------------------------ */
export function ListenStep({ ctx, defaultLoops }: { ctx: ChunkCtx; defaultLoops: number }) {
  const t = useTx()
  const [loops, setLoops] = useState(defaultLoops)
  const [done, setDone] = useState(0)
  const status = usePlayer((s) => s.status)
  const currentKey = usePlayer((s) => s.currentKey)
  const currentWord = usePlayer((s) => s.currentWord)
  const active = useRef(false)
  const prev = useRef(status)
  const loopsRef = useRef(loops)
  loopsRef.current = loops
  const doneRef = useRef(0)

  const start = () => {
    active.current = true
    doneRef.current = 0
    setDone(0)
    usePlayer.getState().playRange(ctx.surah, ctx.from, ctx.to)
  }

  // count finished passes → replay until `loops`
  useEffect(() => {
    const was = prev.current
    prev.current = status
    if (!active.current) return
    if ((was === 'playing' || was === 'loading') && status === 'idle') {
      doneRef.current += 1
      setDone(doneRef.current)
      if (doneRef.current < loopsRef.current) usePlayer.getState().playRange(ctx.surah, ctx.from, ctx.to)
      else active.current = false
    }
  }, [status, ctx.surah, ctx.from, ctx.to])

  useEffect(() => () => { active.current = false; usePlayer.getState().stop() }, [])

  const playing = status === 'playing' || status === 'loading'
  const running = active.current && status !== 'idle'

  return (
    <div>
      <ArabicBlock
        verses={ctx.verses}
        renderWord={(v, i, w) => {
          const on = currentKey === `${ctx.surah}:${v.n}` && currentWord === i + 1
          return (
            <span className={cn('rounded-lg px-0.5 transition-colors duration-200', on && 'bg-primary/15 text-[color:var(--word-active)]')}>{w}</span>
          )
        }}
      />
      <Translation verses={ctx.verses} />
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {[1, 3, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => setLoops(n)}
              className={cn('h-8 min-w-10 rounded-full px-3 text-sm font-medium transition', loops === n ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              {n}×
            </button>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => (running ? usePlayer.getState().toggle() : start())}
          className="relative grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing && <span className="pulse-ring absolute inset-0 rounded-full" />}
          {playing && running ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ms-0.5 h-6 w-6 fill-current" />}
        </motion.button>
        <p className="text-sm text-muted-foreground">
          {t({ en: 'Listen', bn: 'শুনুন', ar: 'استمع' })} {Math.min(done + (running ? 1 : 0), loops)} / {loops}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------ 2. Read along ------------------------------ */
export function ReadStep({ ctx }: { ctx: ChunkCtx }) {
  const t = useTx()
  const [tapped, setTapped] = useState<string | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)
  const [showTr, setShowTr] = useState(true)
  const pad = (n: number) => String(n).padStart(3, '0')
  const tap = (v: HifzVerse, i: number) => {
    setTapped(`${v.n}-${i}`)
    try {
      audio.current?.pause()
      audio.current = new Audio(`https://audio.qurancdn.com/wbw/${pad(ctx.surah)}_${pad(v.n)}_${pad(i + 1)}.mp3`)
      audio.current.play().catch(() => {})
    } catch {}
    setTimeout(() => setTapped((c) => (c === `${v.n}-${i}` ? null : c)), 900)
  }
  useEffect(() => () => audio.current?.pause(), [])
  return (
    <div>
      <p className="mb-3 text-center text-xs text-muted-foreground">{t({ en: 'Tap any word to hear it.', bn: 'যেকোনো শব্দে ট্যাপ করে শুনুন।', ar: 'اضغط على أي كلمة لسماعها.' })}</p>
      <ArabicBlock
        verses={ctx.verses}
        renderWord={(v, i, w) => (
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => tap(v, i)}
            className={cn('rounded-lg px-0.5 transition-colors hover:bg-accent', tapped === `${v.n}-${i}` && 'bg-primary/15 text-[color:var(--word-active)]')}
          >
            {w}
          </motion.button>
        )}
      />
      {showTr && <Translation verses={ctx.verses} />}
      <div className="mt-4 flex justify-center">
        <button onClick={() => setShowTr((s) => !s)} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          {showTr ? t({ en: 'Hide translation', bn: 'অনুবাদ লুকান', ar: 'إخفاء الترجمة' }) : t({ en: 'Show translation', bn: 'অনুবাদ দেখান', ar: 'إظهار الترجمة' })}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------ 3. Fade ------------------------------ */
const LEVELS = [0, 30, 60, 100]
export function FadeStep({ ctx, hints: hintsDefault }: { ctx: ChunkCtx; hints: boolean }) {
  const t = useTx()
  const [level, setLevel] = useState(1)
  const [hints, setHints] = useState(hintsDefault)
  const [seed, setSeed] = useState(7)
  const [peek, setPeek] = useState<Set<string>>(new Set())
  const pct = LEVELS[level]
  const hidden = useMemo(() => Object.fromEntries(ctx.verses.map((v) => [v.n, hiddenSet(v.words.length, pct, seed + v.n)])), [ctx.verses, pct, seed])
  useEffect(() => { setPeek(new Set()) }, [level, seed])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {LEVELS.map((l, i) => (
          <button
            key={l}
            onClick={() => setLevel(i)}
            className={cn('h-9 min-w-14 rounded-full border px-3 text-sm font-medium transition', i === level ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground')}
          >
            {l}%
          </button>
        ))}
      </div>
      <ArabicBlock
        verses={ctx.verses}
        renderWord={(v, i, w) => {
          const hide = hidden[v.n]?.has(i) && !peek.has(`${v.n}-${i}`)
          if (!hide) return <span>{w}</span>
          return (
            <motion.button
              type="button"
              layout
              onClick={() => setPeek((s) => new Set(s).add(`${v.n}-${i}`))}
              className="mx-0.5 inline-block rounded-lg bg-muted px-2 align-baseline text-muted-foreground"
              style={{ minWidth: `${Math.max(1.6, w.length * 0.38)}em` }}
              aria-label={t({ en: 'Hidden word — tap to reveal', bn: 'লুকানো শব্দ — দেখতে ট্যাপ করুন', ar: 'كلمة مخفية — انقر لإظهارها' })}
            >
              {hints ? <span className="opacity-80">{firstLetter(w)}<span className="opacity-40">…</span></span> : <span className="opacity-0">·</span>}
            </motion.button>
          )
        }}
      />
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
        <button onClick={() => setHints((h) => !h)} className={cn('rounded-full border px-3 py-1.5 transition', hints ? 'border-gold bg-gold-soft text-foreground' : 'border-border text-muted-foreground')}>
          {t({ en: 'First-letter hints', bn: 'প্রথম অক্ষরের ইঙ্গিত', ar: 'تلميح الحرف الأول' })}
        </button>
        <button onClick={() => setSeed((s) => s + 1)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground">
          <Shuffle className="h-3.5 w-3.5" /> {t({ en: 'Shuffle', bn: 'বদলান', ar: 'خلط' })}
        </button>
        <button onClick={() => setPeek(new Set(ctx.verses.flatMap((v) => v.words.map((_, i) => `${v.n}-${i}`))))} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground">
          <Eye className="h-3.5 w-3.5" /> {t({ en: 'Reveal all', bn: 'সব দেখান', ar: 'إظهار الكل' })}
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        {level < 3 ? t({ en: 'Recite aloud, tapping hidden words only if stuck. Then raise the level.', bn: 'জোরে পড়ুন, আটকে গেলে লুকানো শব্দে ট্যাপ করুন। তারপর স্তর বাড়ান।', ar: 'اتلُ بصوت مسموع، واضغط على الكلمات المخفية عند التوقف فقط. ثم ارفع المستوى.' }) : t({ en: 'Everything is hidden — recite it all from memory, then move on to the recall test.', bn: 'সবকিছু লুকানো — পুরোটা মুখস্থ বলুন, তারপর রিকল টেস্টে যান।', ar: 'كل شيء مخفي — اتلُ الآيات كاملة من حفظك، ثم انتقل إلى اختبار الاستذكار.' })}
      </p>
    </div>
  )
}

/* ------------------------------ 4. Recall ------------------------------ */
export function GradeBar({ card, onGrade, suggested }: { card?: Card; onGrade: (g: Grade) => void; suggested?: Grade }) {
  const t = useTx()
  const lang = useLang()
  const tone = ['border-destructive/40 text-destructive', 'border-gold/50 text-gold', 'border-primary/50 text-primary', 'border-primary bg-primary text-primary-foreground'] as const
  return (
    <div className="grid grid-cols-4 gap-2">
      {GRADES.map((g) => (
        <motion.button
          key={g.g}
          whileTap={{ scale: 0.94 }}
          onClick={() => onGrade(g.g)}
          className={cn(
            'relative flex flex-col items-center rounded-2xl border bg-card px-1 py-3 text-sm font-semibold transition hover:-translate-y-0.5',
            tone[g.g],
            suggested === g.g && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
          )}
        >
          {t({ en: g.en, bn: g.bn, ar: g.ar })}
          <span className="mt-0.5 text-[11px] font-normal opacity-70">{formatInterval(previewInterval(card, g.g), lang)}</span>
        </motion.button>
      ))}
    </div>
  )
}

export function RecallStep({ ctx, poolWords, card, onGrade }: { ctx: ChunkCtx; poolWords: string[]; card?: Card; onGrade: (g: Grade) => void }) {
  const t = useTx()
  const flat = useMemo(() => ctx.verses.flatMap((v) => v.words.map((w, i) => ({ v: v.n, i, w }))), [ctx.verses])
  const words = useMemo(() => flat.map((f) => f.w), [flat])
  const [pos, setPos] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [shake, setShake] = useState(0)
  const [wrong, setWrong] = useState<string | null>(null)
  const [voice, setVoice] = useState<number | null>(null)
  const done = pos >= flat.length
  const choices = useMemo(() => (done ? [] : wordChoices(words, pos, poolWords)), [done, words, pos, poolWords])
  const endRef = useRef<HTMLSpanElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [pos])

  const pick = (w: string) => {
    if (w === words[pos]) { setPos((p) => p + 1); setWrong(null) }
    else { setMistakes((m) => m + 1); setShake((s) => s + 1); setWrong(w) }
  }
  const reveal = () => { setHintsUsed((h) => h + 1); setPos((p) => p + 1); setWrong(null) }

  const errors = mistakes + hintsUsed
  const ratio = errors / Math.max(1, flat.length)
  let suggested: Grade = errors === 0 ? 3 : ratio <= 0.1 ? 2 : ratio <= 0.35 ? 1 : 0
  if (voice !== null) suggested = Math.min(suggested, voice >= 0.9 ? 3 : voice >= 0.7 ? 2 : voice >= 0.45 ? 1 : 0) as Grade

  // shown words per ayah
  const shown = (v: HifzVerse) => v.words.map((w, i) => ({ w, show: flat.findIndex((f) => f.v === v.n && f.i === i) < pos }))

  return (
    <div>
      <p dir="rtl" lang="ar" className="quran-text text-center text-[length:clamp(26px,7vw,36px)] [line-height:2.3]">
        {ctx.verses.map((v) => {
          const sw = shown(v)
          const complete = sw.every((x) => x.show)
          return (
            <span key={v.n}>
              {sw.map((x, i) => (
                <span key={i}>
                  {x.show ? (
                    <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="inline-block">{x.w}</motion.span>
                  ) : (
                    <span className="mx-1 inline-block h-[0.55em] w-[1.6em] rounded-full bg-muted align-middle" />
                  )}{' '}
                </span>
              ))}
              {complete && <span className="ayah-marker">{String(v.n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d])}</span>}{' '}
            </span>
          )
        })}
        <span ref={endRef} />
      </p>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key="choices" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
            <p className="mb-3 text-center text-xs text-muted-foreground">
              {t({ en: 'Which word comes next?', bn: 'পরের শব্দ কোনটি?', ar: 'ما الكلمة التالية؟' })} <span className="tabular-nums">({pos + 1}/{flat.length})</span>
            </p>
            <motion.div key={shake} animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.35 }} className="grid grid-cols-3 gap-2">
              {choices.map((c) => (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => pick(c)}
                  dir="rtl"
                  lang="ar"
                  className={cn(
                    'quran-text min-h-14 rounded-2xl border bg-card px-2 py-1 text-center text-[length:clamp(20px,5.5vw,26px)] [line-height:1.9] transition hover:-translate-y-0.5 hover:border-primary/50',
                    wrong === c ? 'border-destructive/60 bg-destructive/10' : 'border-border'
                  )}
                >
                  {c}
                </motion.button>
              ))}
            </motion.div>
            <div className="mt-3 flex justify-center">
              <button onClick={reveal} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
                <Eye className="h-4 w-4" /> {t({ en: 'Reveal next word', bn: 'পরের শব্দ দেখান', ar: 'إظهار الكلمة التالية' })}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="grade" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mt-6">
            <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-primary">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-3.5 w-3.5" /></span>
              {errors === 0 ? t({ en: 'Flawless!', bn: 'নির্ভুল!', ar: 'بلا أخطاء!' }) : t({ en: `${mistakes} slip${mistakes === 1 ? '' : 's'} · ${hintsUsed} reveal${hintsUsed === 1 ? '' : 's'}`, bn: `${mistakes} ভুল · ${hintsUsed} বার দেখেছেন`, ar: `أخطاء: ${mistakes} · تلميحات: ${hintsUsed}` })}
            </div>
            <Translation verses={ctx.verses} />
            <p className="mb-3 mt-5 text-center text-xs text-muted-foreground">{t({ en: 'How well did you remember it?', bn: 'কতটা মনে ছিল?', ar: 'ما مدى تذكّرك لها؟' })}</p>
            <GradeBar card={card} onGrade={onGrade} suggested={suggested} />
          </motion.div>
        )}
      </AnimatePresence>
      <ReciteCheck words={words} onResult={setVoice} />
    </div>
  )
}
