'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUp, Minimize2, Pause, Play, SlidersHorizontal, Maximize2 } from 'lucide-react'
import { usePlayer } from '@/lib/stores/player'
import { useUi } from '@/lib/stores/ui'
import { useReaderUi } from '@/lib/reader/ui-store'
import { scrollToAyah } from '@/lib/reader/dom'
import { toBanglaDigits } from '@/lib/quran/chapters'
import { useLang, useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'
import { ReaderController } from './reader-controller'
import { ArabicLayers } from './arabic-layers'
import { VerseEnhancer } from './verse-enhancer'
import { SettingsPanel } from './settings-panel'
import { TafsirPanel } from './tafsir-panel'
import { ShareImagePanel } from './share-image-panel'
import { AyahMenu } from './ayah-menu'

export interface ReaderChromeProps {
  /** surah id on surah pages */
  surah?: number
  /** surah ids present on the page (for tajweed / word-by-word data) */
  chapterIds: number[]
  title: string
  titleAr: string
  /** number of ayahs (surah pages) – enables "jump to ayah" by number */
  total?: number
  /** single-ayah pages: panels + controller only (no mini header / dock) */
  minimal?: boolean
}

/** Mirror SiteHeader's hide-on-scroll-down logic so the mini bar can sit under it when it's visible. */
function useScrollState(threshold: number) {
  const [state, setState] = useState({ past: false, headerShown: true })
  useEffect(() => {
    let last = window.scrollY
    let headerShown = true
    const on = () => {
      const y = window.scrollY
      if (Math.abs(y - last) > 6) {
        headerShown = !(y > last && y > 140)
        last = y
      }
      const past = y > threshold
      setState((s) => (s.past === past && s.headerShown === headerShown ? s : { past, headerShown }))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [threshold])
  return state
}

function useIsLg() {
  const [v, setV] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(min-width: 1024px)')
    const on = () => setV(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return v
}

function ProgressBar() {
  const mv = useMotionValue(0)
  const x = useSpring(mv, { stiffness: 260, damping: 36, mass: 0.4 })
  useEffect(() => {
    let raf = 0
    const calc = () => {
      raf = 0
      const list = document.querySelector<HTMLElement>('.verse-list')
      if (!list) return
      const r = list.getBoundingClientRect()
      const p = (window.innerHeight * 0.6 - r.top) / r.height
      mv.set(Math.min(1, Math.max(0, p)))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(calc) }
    calc()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [mv])
  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden bg-transparent">
      <motion.div className="h-full origin-left rtl:origin-right rounded-e-full bg-gradient-to-r from-primary via-primary to-gold" style={{ scaleX: x }} />
    </div>
  )
}

export function ReaderChrome(props: ReaderChromeProps) {
  if (props.minimal) return <MinimalChrome {...props} />
  return <FullChrome {...props} />
}

function MinimalChrome({ surah, chapterIds }: ReaderChromeProps) {
  return (
    <>
      <ReaderController surah={surah} />
      <ArabicLayers chapters={chapterIds} />
      <VerseEnhancer chapters={chapterIds} />
      <SettingsPanel />
      <TafsirPanel />
      <ShareImagePanel />
      <AyahMenu />
    </>
  )
}

function FullChrome({ surah, chapterIds, title, titleAr, total }: ReaderChromeProps) {
  const t = useTx()
  const lang = useLang()
  const { past, headerShown } = useScrollState(420)
  const immersive = useUi((s) => s.immersive)
  const inView = useReaderUi((s) => s.inView)
  const status = usePlayer((s) => s.status)
  const queueSurah = usePlayer((s) => s.queue?.surah ?? null)
  const hasPlayer = status !== 'idle'
  const inputRef = useRef<HTMLInputElement>(null)
  const [jump, setJump] = useState('')

  const digits = (n: number) => (lang === 'bn' ? toBanglaDigits(n) : String(n))
  const viewSurah = inView ? +inView.key.split(':')[0] : surah ?? chapterIds[0]
  const playingHere = hasPlayer && (queueSurah === viewSurah || (surah != null && queueSurah === surah))
  const isPlaying = playingHere && (status === 'playing' || status === 'loading')

  const onPlay = () => {
    const p = usePlayer.getState()
    if (playingHere) return p.toggle()
    const [s, a] = (inView?.key ?? `${surah ?? chapterIds[0]}:1`).split(':').map(Number)
    p.playSurah(s, surah ? (a > 1 ? a : 1) : a)
  }

  const onJump = (e: FormEvent) => {
    e.preventDefault()
    const v = jump.trim()
    if (!v) return
    let key: string | null = null
    if (/^\d{1,3}:\d{1,3}$/.test(v)) key = v
    else if (/^\d{1,3}$/.test(v)) {
      const n = +v
      if (surah && total) key = `${surah}:${Math.min(Math.max(1, n), total)}`
      else key = document.querySelectorAll<HTMLElement>('[data-ayah]')[n - 1]?.dataset.ayah ?? null
    }
    if (key && scrollToAyah(key)) {
      setJump('')
      inputRef.current?.blur()
    }
  }

  const showBar = past && !immersive
  const isLg = useIsLg()
  const dockBottom = immersive || isLg ? (hasPlayer && !immersive ? '6.5rem' : '1.5rem') : `calc(${hasPlayer ? '10.5rem' : '6.25rem'} + env(safe-area-inset-bottom))`

  return (
    <>
      <ReaderController surah={surah} />
      <ArabicLayers chapters={chapterIds} />
      <VerseEnhancer chapters={chapterIds} />

      {/* sticky mini header */}
      <motion.div
        initial={false}
        animate={{ y: showBar ? (headerShown ? 64 : 0) : -80, opacity: showBar ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="reader-chrome fixed inset-x-0 top-0 z-40 border-b bg-background/90 backdrop-blur-xl backdrop-saturate-150 shadow-[0_10px_30px_-22px_rgb(var(--shadow-color)/0.5)]"
        style={{ pointerEvents: showBar ? 'auto' : 'none' }}
        aria-hidden={!showBar}
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex min-w-0 items-center gap-2.5 text-start" aria-label="Back to top">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-primary transition-transform group-hover:-translate-y-0.5"><ArrowUp className="size-4" /></span>
            <span className="min-w-0">
              <span className="block truncate font-display text-[15px] font-semibold leading-tight">{title}</span>
              <span className="block truncate text-[11px] font-medium text-muted-foreground">
                {inView ? (
                  <>
                    {inView.key} · {t({ en: 'Juz', bn: 'পারা', ar: 'الجزء' })} {digits(inView.juz)} · {t({ en: 'Page', bn: 'পৃষ্ঠা', ar: 'الصفحة' })} {digits(inView.page)}
                  </>
                ) : ' '}
              </span>
            </span>
          </button>
          <span className="ms-auto hidden font-arabic text-xl text-gold sm:block" lang="ar">{titleAr}</span>
          <form onSubmit={onJump} className="ms-auto flex items-center sm:ms-3">
            <label className="sr-only" htmlFor="jump-ayah">{t({ en: 'Jump to ayah', bn: 'আয়াতে যান', ar: 'انتقل إلى آية' })}</label>
            <input
              ref={inputRef}
              id="jump-ayah"
              inputMode="numeric"
              value={jump}
              onChange={(e) => setJump(e.target.value.replace(/[^\d:]/g, ''))}
              placeholder={surah ? t({ en: 'Ayah #', bn: 'আয়াত', ar: 'رقم الآية' }) : '2:255'}
              className="h-9 w-[5.5rem] rounded-full border bg-card/70 px-3 text-center text-sm font-semibold tabular-nums outline-none transition focus:w-28 focus:border-primary/50 focus:shadow-[0_0_0_3px_var(--glow)]"
            />
          </form>
          <button type="button" onClick={() => useReaderUi.getState().setSettingsOpen(true)} className="grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-muted" aria-label={t({ en: 'Reading settings', bn: 'সেটিংস', ar: 'إعدادات القراءة' })}>
            <SlidersHorizontal className="size-[18px]" />
          </button>
        </div>
        <ProgressBar />
      </motion.div>

      {/* floating dock */}
      <motion.div
        initial={false}
        animate={{ bottom: dockBottom }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        className="reader-chrome fixed end-3 z-40 sm:end-5 lg:end-8"
        style={{ bottom: dockBottom }}
      >
        <div className="flex flex-col items-center gap-1 rounded-full border bg-popover/90 p-1.5 backdrop-blur-xl lg:flex-row-reverse shadow-[0_18px_40px_-16px_rgb(var(--shadow-color)/0.55)]">
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={onPlay}
            className={cn('grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_var(--primary)]', isPlaying && 'pulse-ring')}
            aria-label={isPlaying ? t({ en: 'Pause', bn: 'বিরতি', ar: 'إيقاف مؤقت' }) : t({ en: 'Play recitation', bn: 'তিলাওয়াত শুনুন', ar: 'تشغيل التلاوة' })}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={isPlaying ? 'pause' : 'play'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                {isPlaying ? <Pause className="size-5" fill="currentColor" /> : <Play className="size-5 translate-x-0.5" fill="currentColor" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={() => useReaderUi.getState().setSettingsOpen(true)} className="grid size-11 place-items-center rounded-full text-foreground/80 transition hover:bg-muted" aria-label={t({ en: 'Reading settings', bn: 'সেটিংস', ar: 'إعدادات القراءة' })}>
            <SlidersHorizontal className="size-[19px]" />
          </motion.button>
          <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={() => useUi.getState().setImmersive(!immersive)} className={cn('size-11 place-items-center rounded-full transition hover:bg-muted', immersive ? 'grid text-primary' : 'hidden text-foreground/80 sm:grid')} aria-label={immersive ? t({ en: 'Exit focus mode', bn: 'ফোকাস মোড বন্ধ', ar: 'الخروج من وضع التركيز' }) : t({ en: 'Focus mode', bn: 'ফোকাস মোড', ar: 'وضع التركيز' })} title="Focus (f)">
            {immersive ? <Minimize2 className="size-[18px]" /> : <Maximize2 className="size-[18px]" />}
          </motion.button>
        </div>
      </motion.div>

      {/* focus-mode exit pill */}
      <AnimatePresence>
        {immersive && (
          <motion.button
            type="button"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            onClick={() => useUi.getState().setImmersive(false)}
            className="reader-chrome glass fixed end-4 top-4 z-50 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-lg"
          >
            <Minimize2 className="size-4" /> {t({ en: 'Exit focus', bn: 'ফোকাস বন্ধ', ar: 'إنهاء التركيز' })} <kbd className="hidden rounded border bg-muted px-1 text-[10px] sm:inline">Esc</kbd>
          </motion.button>
        )}
      </AnimatePresence>

      <SettingsPanel />
      <TafsirPanel />
      <ShareImagePanel />
      <AyahMenu />
    </>
  )
}
