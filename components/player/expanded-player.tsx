'use client'
import { useEffect, useRef, useState } from 'react'
import Link from '@/lib/i18n/link'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { BookOpen, ChevronDown, Loader2, Minus, Pause, Play, Plus, Repeat, Repeat1, SkipBack, SkipForward, X } from 'lucide-react'
import { usePlayer, ayahCount } from '@/lib/stores/player'
import { useReader } from '@/lib/stores/reader'
import { useClock } from '@/lib/audio/clock'
import { useSleep, type SleepMode } from '@/lib/audio/sleep'
import { usePlayerPrefs } from '@/lib/audio/prefs'
import { fetchVerseText, type VerseText } from '@/lib/audio/api'
import { getReciter } from '@/lib/audio/reciters'
import { chapters, readerHref, toArabicDigits } from '@/lib/quran/chapters'
import { useTx, useLang } from '@/lib/lang'
import { UiIcon } from '@/components/ui-icon'
import { cn } from '@/lib/utils'
import { SeekBar } from './seek-bar'
import { ReciterPicker } from './reciter-picker'
import { ReciterMonogram } from './reciter-monogram'
import { EqBars } from './eq-bars'
import { useSurahLabel } from './use-surah-label'

/* ------------------------------------------------------------------ ambient background */
function Ambient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -start-1/4 -top-1/3 size-[80vmax] rounded-full"
        style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--primary) 26%, transparent), transparent)' }}
        animate={{ x: [0, 80, -30, 0], y: [0, 50, 110, 0], scale: [1, 1.12, 0.95, 1] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-1/3 -end-1/4 size-[70vmax] rounded-full"
        style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--gold) 24%, transparent), transparent)' }}
        animate={{ x: [0, -70, 20, 0], y: [0, -60, -20, 0], scale: [1, 0.92, 1.1, 1] }}
        transition={{ duration: 38, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="bg-pattern absolute left-1/2 top-1/2 size-[170vmax] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{ opacity: 'calc(var(--pattern-opacity) * 2.4)', maskImage: 'radial-gradient(circle, #000 8%, transparent 42%)', WebkitMaskImage: 'radial-gradient(circle, #000 8%, transparent 42%)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 420, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ verse */
function useVerse(key: string | null) {
  const [v, setV] = useState<VerseText | null>(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    if (!key) return
    let live = true
    setErr(false)
    fetchVerseText(key).then((r) => live && setV(r)).catch(() => live && setErr(true))
    // warm the next ayah
    const [s, a] = key.split(':').map(Number)
    if (a < ayahCount(s)) fetchVerseText(`${s}:${a + 1}`).catch(() => {})
    return () => { live = false }
  }, [key])
  return { verse: v && v.key === key ? v : null, loading: !!key && !(v && v.key === key) && !err, err }
}

function VerseCard({ currentKey }: { currentKey: string }) {
  const t = useTx()
  const lang = useLang()
  const { verse, loading, err } = useVerse(currentKey)
  const word = usePlayer((s) => s.currentWord)
  const showEn = useReader((s) => s.showEn)
  const showBn = useReader((s) => s.showBn)
  const box = useRef<HTMLDivElement>(null)
  const wordEls = useRef(new Map<number, HTMLElement>())

  // keep the active word centred inside the scrollable card
  useEffect(() => {
    const el = word != null ? wordEls.current.get(word) : null
    const c = box.current
    if (!el || !c || c.scrollHeight <= c.clientHeight + 4) return
    c.scrollTo({ top: el.offsetTop - c.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' })
  }, [word])
  useEffect(() => { box.current?.scrollTo({ top: 0 }) }, [currentKey])

  const n = Number(currentKey.split(':')[1])
  const bnFirst = lang === 'bn'
  const trEn = showEn && verse?.en ? <p key="en" lang="en" className="text-center text-[length:var(--trans-size,17px)] leading-relaxed text-foreground/90">{verse.en}</p> : null
  const trBn = showBn && verse?.bn ? <p key="bn" lang="bn" className="font-bangla text-center text-[length:var(--trans-size,17px)] leading-relaxed text-foreground/90">{verse.bn}</p> : null

  return (
    <div className="card-soft relative overflow-hidden bg-card/80 p-4 backdrop-blur-sm sm:p-6">
      <div ref={box} className="no-scrollbar max-h-[34vh] overflow-y-auto lg:max-h-[44vh]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            {loading && (
              <div className="space-y-3 py-4" aria-busy>
                <div className="shimmer h-9 w-full rounded-xl bg-muted" />
                <div className="shimmer ms-auto h-9 w-2/3 rounded-xl bg-muted" />
              </div>
            )}
            {err && <p className="py-6 text-center text-sm text-muted-foreground">{t({ en: 'Could not load the ayah text (offline?). Audio keeps playing.', bn: 'আয়াতের লেখা লোড হয়নি। অডিও চলছে।', ar: 'تعذّر تحميل نص الآية (غير متصل؟). يستمر تشغيل الصوت.' })}</p>}
            {verse && (
              <>
                <p className="quran-text text-center text-[length:clamp(26px,calc(var(--quran-size,34px)*1.12),54px)] leading-[2.2]" lang="ar" dir="rtl">
                  {verse.words.length
                    ? verse.words.map((w) => (
                        <span
                          key={w.pos}
                          ref={(el) => { if (el) wordEls.current.set(w.pos, el); else wordEls.current.delete(w.pos) }}
                          className={cn(
                            'inline-block rounded-xl px-1 transition-[background-color,color,transform] duration-200',
                            word === w.pos && 'scale-[1.04] bg-highlight text-[color:var(--word-active)]'
                          )}
                        >
                          {w.text}{' '}
                        </span>
                      ))
                    : verse.ar}
                  <span className="ayah-marker">{toArabicDigits(n)}</span>
                </p>
                <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
                  {bnFirst ? <>{trBn}{trEn}</> : <>{trEn}{trBn}</>}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ controls */
function Chip({ active, children, onClick, className, label }: { active?: boolean; children: React.ReactNode; onClick: () => void; className?: string; label?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        'h-9 min-w-11 rounded-full border px-3.5 text-sm font-medium tabular-nums transition active:scale-95',
        active ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-card/70 text-foreground hover:bg-muted',
        className
      )}
    >
      {children}
    </button>
  )
}

function Panel({ icon, title, children, aside }: { icon?: string; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="card-soft bg-card/80 p-4 backdrop-blur-sm">
      <header className="mb-3 flex items-center gap-2">
        {icon && <UiIcon name={icon} size={20} />}
        <h3 className="flex-1 text-sm font-semibold">{title}</h3>
        {aside}
      </header>
      {children}
    </section>
  )
}

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <button aria-label={`${label} −`} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid size-8 place-items-center rounded-full border border-border bg-card/70 transition hover:bg-muted active:scale-90 disabled:opacity-40"><Minus className="size-3.5" /></button>
      <span className="w-10 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button aria-label={`${label} +`} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid size-8 place-items-center rounded-full border border-border bg-card/70 transition hover:bg-muted active:scale-90 disabled:opacity-40"><Plus className="size-3.5" /></button>
    </div>
  )
}

function SleepPanel() {
  const t = useTx()
  const { mode, endsAt, set } = useSleep()
  const [, tick] = useState(0)
  useEffect(() => {
    if (!endsAt) return
    const i = setInterval(() => tick((x) => x + 1), 1000)
    return () => clearInterval(i)
  }, [endsAt])
  const left = endsAt ? Math.max(0, Math.round((endsAt - Date.now()) / 1000)) : 0
  const opts: { m: SleepMode; l: string }[] = [
    { m: null, l: t({ en: 'Off', bn: 'বন্ধ', ar: 'إيقاف' }) },
    { m: 15, l: '15m' },
    { m: 30, l: '30m' },
    { m: 60, l: '60m' },
    { m: 'end', l: t({ en: 'End of surah', bn: 'সূরার শেষে', ar: 'نهاية السورة' }) },
  ]
  return (
    <Panel icon="moon" title={t({ en: 'Sleep timer', bn: 'স্লিপ টাইমার', ar: 'مؤقت النوم' })} aside={endsAt ? <span className="text-xs font-medium tabular-nums text-primary">{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span> : null}>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <Chip key={String(o.m)} active={mode === o.m} onClick={() => set(o.m)}>{o.l}</Chip>
        ))}
      </div>
    </Panel>
  )
}

function Controls({ onPickReciter }: { onPickReciter: () => void }) {
  const t = useTx()
  const queue = usePlayer((s) => s.queue)!
  const currentKey = usePlayer((s) => s.currentKey)
  const loop = usePlayer((s) => s.loop)
  const { reciterId, playbackRate, repeatAyah, autoScroll, set } = useReader()
  const autoNext = usePlayerPrefs((s) => s.autoNext)
  const count = ayahCount(queue.surah)
  const to = Math.min(queue.to, count)
  const ayah = Number(currentKey?.split(':')[1] ?? queue.from)
  const r = getReciter(reciterId)
  const p = usePlayer.getState
  const whole = queue.from === 1 && queue.to >= count

  return (
    <div className="space-y-3">
      <button onClick={onPickReciter} className="card-soft lift flex w-full items-center gap-3 bg-card/80 p-3 text-start backdrop-blur-sm">
        <ReciterMonogram name={r.name} size={48} active />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{t({ en: 'Reciter', bn: 'ক্বারী', ar: 'القارئ' })}</span>
          <span className="block truncate text-sm font-semibold">{r.name}</span>
          <span className="block truncate font-arabic text-sm text-muted-foreground">{r.ar} · {r.style}</span>
        </span>
        <span className="rounded-full border border-border px-3 py-1.5 text-xs font-medium">{t({ en: 'Change', bn: 'পরিবর্তন', ar: 'تغيير' })}</span>
      </button>

      <Panel icon="listen" title={t({ en: 'Speed', bn: 'গতি', ar: 'السرعة' })} aside={<span className="text-xs tabular-nums text-muted-foreground">{playbackRate}×</span>}>
        <div className="grid grid-cols-5 gap-1.5">
          {[0.75, 0.9, 1, 1.25, 1.5].map((v) => (
            <Chip key={v} active={playbackRate === v} onClick={() => set({ playbackRate: v })} className="!px-0">{v}×</Chip>
          ))}
        </div>
      </Panel>

      <Panel icon="repeat" title={t({ en: 'Repeat each ayah', bn: 'প্রতিটি আয়াত পুনরাবৃত্তি', ar: 'تكرار كل آية' })}>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 5, 10].map((v) => (
            <Chip key={v} active={repeatAyah === v} onClick={() => set({ repeatAyah: v })} className="!px-0">{v === 1 ? t({ en: 'Off', bn: 'বন্ধ', ar: 'إيقاف' }) : `${v}×`}</Chip>
          ))}
        </div>
      </Panel>

      <Panel
        icon="hifz"
        title={t({ en: 'Range & loop', bn: 'রেঞ্জ ও লুপ', ar: 'النطاق والتكرار' })}
        aside={
          <Chip active={loop} onClick={() => p().setLoop(!loop)} className="h-8 !px-3 text-xs" label={t({ en: 'Loop range', bn: 'রেঞ্জ লুপ', ar: 'تكرار النطاق' })}>
            <span className="inline-flex items-center gap-1.5"><Repeat className="size-3.5" />{t({ en: 'Loop', bn: 'লুপ', ar: 'تكرار' })}</span>
          </Chip>
        }
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{t({ en: 'From ayah', bn: 'শুরু', ar: 'من الآية' })}</div>
            <Stepper label={t({ en: 'From ayah', bn: 'শুরু', ar: 'من الآية' })} value={queue.from} min={1} max={to} onChange={(v) => p().setRange(v, queue.to)} />
          </div>
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{t({ en: 'To ayah', bn: 'শেষ', ar: 'إلى الآية' })}</div>
            <Stepper label={t({ en: 'To ayah', bn: 'শেষ', ar: 'إلى الآية' })} value={to} min={queue.from} max={count} onChange={(v) => p().setRange(queue.from, v)} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip active={queue.from === ayah && to === ayah && loop} onClick={() => { p().setRange(ayah, ayah); p().setLoop(true) }} className="h-8 text-xs">{t({ en: 'Loop this ayah', bn: 'এই আয়াত লুপ', ar: 'تكرار هذه الآية' })}</Chip>
          <Chip active={whole} onClick={() => { p().setRange(1, Number.MAX_SAFE_INTEGER); p().setLoop(false) }} className="h-8 text-xs">{t({ en: 'Whole surah', bn: 'পুরো সূরা', ar: 'السورة كاملة' })}</Chip>
        </div>
      </Panel>

      <SleepPanel />

      <section className="card-soft divide-y divide-border bg-card/80 backdrop-blur-sm">
        <Toggle label={t({ en: 'Continue to next surah', bn: 'পরের সূরায় চলুন', ar: 'المتابعة إلى السورة التالية' })} on={autoNext} onChange={(v) => usePlayerPrefs.getState().set({ autoNext: v })} />
        <Toggle label={t({ en: 'Auto-scroll reader', bn: 'রিডার অটো-স্ক্রল', ar: 'تمرير تلقائي في القارئ' })} on={autoScroll} onChange={(v) => set({ autoScroll: v })} />
      </section>
    </div>
  )
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm">
      <span>{label}</span>
      <span className={cn('relative h-6 w-10 rounded-full transition-colors', on ? 'bg-primary' : 'bg-muted')}>
        <motion.span className="absolute top-0.5 size-5 rounded-full bg-white shadow" animate={{ left: on ? 18 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ transport */
function Transport() {
  const t = useTx()
  const status = usePlayer((s) => s.status)
  const loop = usePlayer((s) => s.loop)
  const buffering = useClock((s) => s.buffering)
  const repeatAyah = useReader((s) => s.repeatAyah)
  const p = usePlayer.getState
  const playing = status === 'playing'
  const loading = status === 'loading' || (playing && buffering)
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      <button
        onClick={() => p().setLoop(!loop)}
        aria-pressed={loop}
        aria-label={t({ en: 'Loop', bn: 'লুপ', ar: 'تكرار' })}
        className={cn('grid size-11 place-items-center rounded-full transition active:scale-90', loop ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted')}
      >
        {repeatAyah > 1 ? <Repeat1 className="size-5" /> : <Repeat className="size-5" />}
      </button>
      <button onClick={() => p().prev()} aria-label={t({ en: 'Previous ayah', bn: 'আগের আয়াত', ar: 'الآية السابقة' })} className="grid size-12 place-items-center rounded-full transition hover:bg-muted active:scale-90"><SkipBack className="size-6 fill-current" /></button>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => (status === 'error' ? p().resume() : p().toggle())}
        aria-label={playing ? t({ en: 'Pause', bn: 'বিরতি', ar: 'إيقاف مؤقت' }) : t({ en: 'Play', bn: 'চালান', ar: 'تشغيل' })}
        className={cn('grid size-[4.5rem] place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_14px_34px_-10px_var(--glow)]', playing && 'pulse-ring')}
      >
        {loading ? <Loader2 className="size-7 animate-spin" /> : playing ? <Pause className="size-8 fill-current" /> : <Play className="size-8 translate-x-0.5 fill-current" />}
      </motion.button>
      <button onClick={() => p().next()} aria-label={t({ en: 'Next ayah', bn: 'পরের আয়াত', ar: 'الآية التالية' })} className="grid size-12 place-items-center rounded-full transition hover:bg-muted active:scale-90"><SkipForward className="size-6 fill-current" /></button>
      <span className="grid size-11 place-items-center" aria-hidden>
        <EqBars playing={playing} size={20} />
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ sheet */
export function ExpandedPlayer() {
  const t = useTx()
  const label = useSurahLabel()
  const queue = usePlayer((s) => s.queue)
  const currentKey = usePlayer((s) => s.currentKey)
  const expanded = usePlayer((s) => s.expanded)
  const [picker, setPicker] = useState(false)
  const controls = useDragControls()
  const close = () => usePlayer.getState().setExpanded(false)

  useEffect(() => {
    if (!expanded) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') (picker ? setPicker(false) : close()) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [expanded, picker])
  useEffect(() => { if (!expanded) setPicker(false) }, [expanded])

  const show = expanded && !!queue && !!currentKey
  const surah = queue?.surah ?? 1
  const ayah = Number(currentKey?.split(':')[1] ?? 1)
  const c = chapters[surah - 1]

  return (
    <AnimatePresence>
      {show && queue && currentKey && (
        <motion.div
          key="sheet"
          role="dialog"
          aria-modal="true"
          aria-label={t({ en: 'Now playing', bn: 'এখন চলছে', ar: 'قيد التشغيل' })}
          className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-background"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 340, damping: 36 }}
          drag="y"
          dragControls={controls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, i) => { if (i.offset.y > 140 || i.velocity.y > 700) close() }}
        >
          <Ambient />

          {/* header — also the drag handle */}
          <header
            onPointerDown={(e) => { if (!(e.target as HTMLElement).closest('a,button')) controls.start(e) }}
            className="relative z-10 mx-auto flex w-full max-w-6xl touch-none items-center gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6"
          >
            <button onClick={close} aria-label={t({ en: 'Minimise player', bn: 'প্লেয়ার ছোট করুন', ar: 'تصغير المشغّل' })} className="grid size-11 place-items-center rounded-full bg-card/70 ring-1 ring-border backdrop-blur transition active:scale-90"><ChevronDown className="size-5" /></button>
            <div className="min-w-0 flex-1 text-center">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t({ en: 'Now playing', bn: 'এখন চলছে', ar: 'قيد التشغيل' })}</div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="truncate font-display text-lg font-semibold">{label(surah)}</span>
                <span className="font-arabic text-lg text-gold">{c.nameArabic}</span>
              </div>
            </div>
            <Link
              href={readerHref(surah, ayah)}
              onClick={close}
              className="flex h-11 items-center gap-2 rounded-full bg-card/70 px-3.5 text-sm font-medium ring-1 ring-border backdrop-blur transition active:scale-95 sm:px-4"
              aria-label={t({ en: 'Follow along in the reader', bn: 'রিডারে অনুসরণ করুন', ar: 'تابع التلاوة في القارئ' })}
            >
              <BookOpen className="size-4" />
              <span className="hidden sm:inline">{t({ en: 'Follow along', bn: 'অনুসরণ করুন', ar: 'تابع في القارئ' })}</span>
            </Link>
            <button onClick={() => usePlayer.getState().stop()} aria-label={t({ en: 'Close player', bn: 'প্লেয়ার বন্ধ করুন', ar: 'إغلاق المشغّل' })} className="grid size-11 place-items-center rounded-full bg-card/70 ring-1 ring-border backdrop-blur transition active:scale-90"><X className="size-5" /></button>
          </header>

          <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 pt-2 sm:px-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8 lg:pt-6">
              <div className="space-y-5 lg:sticky lg:top-2 lg:self-start">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="rounded-full bg-card/70 px-3 py-1 ring-1 ring-border backdrop-blur">{c.meaning} · {c.revelationPlace === 'makkah' ? t({ en: 'Makki', bn: 'মাক্কী', ar: 'مكية' }) : t({ en: 'Madani', bn: 'মাদানী', ar: 'مدنية' })}</span>
                  <span className="rounded-full bg-card/70 px-3 py-1 font-medium tabular-nums text-foreground ring-1 ring-border backdrop-blur">{t({ en: 'Ayah', bn: 'আয়াত', ar: 'آية' })} {ayah} / {c.versesCount}</span>
                </div>
                <VerseCard currentKey={currentKey} />
                <SeekBar />
                <Transport />
              </div>
              <Controls onPickReciter={() => setPicker(true)} />
            </div>
          </div>

          <AnimatePresence>{picker && <ReciterPicker onClose={() => setPicker(false)} />}</AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
