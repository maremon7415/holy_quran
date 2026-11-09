'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square } from 'lucide-react'
import { useTx } from '@/lib/lang'
import { diffRecitation, type DiffItem } from '@/lib/hifz/words'
import { cn } from '@/lib/utils'

type SR = {
  lang: string; continuous: boolean; interimResults: boolean
  start: () => void; stop: () => void; abort: () => void
  onresult: ((e: any) => void) | null; onend: (() => void) | null; onerror: ((e: any) => void) | null
}

/** Optional voice check (Web Speech API). Renders nothing where unsupported. */
export function ReciteCheck({ words, onResult }: { words: string[]; onResult?: (accuracy: number) => void }) {
  const t = useTx()
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ items: DiffItem[]; extra: string[]; accuracy: number } | null>(null)
  const rec = useRef<SR | null>(null)
  const latest = useRef('')

  useEffect(() => {
    const w = window as any
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition))
    return () => rec.current?.abort()
  }, [])

  useEffect(() => {
    setResult(null); setTranscript('')
  }, [words])

  if (!supported) return null

  const start = () => {
    const w = window as any
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    const r: SR = new Ctor()
    r.lang = 'ar-SA'
    r.continuous = true
    r.interimResults = true
    latest.current = ''
    setError(null); setResult(null); setTranscript('')
    r.onresult = (e: any) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + ' '
      latest.current = text.trim()
      setTranscript(latest.current)
    }
    r.onerror = (e: any) => {
      setError(e?.error === 'not-allowed' ? t({ en: 'Microphone permission was denied.', bn: 'মাইক্রোফোনের অনুমতি দেওয়া হয়নি।' }) : t({ en: 'Could not hear you — try again.', bn: 'শোনা যায়নি — আবার চেষ্টা করুন।' }))
      setListening(false)
    }
    r.onend = () => {
      setListening(false)
      if (latest.current) {
        const d = diffRecitation(words, latest.current)
        setResult(d)
        onResult?.(d.accuracy)
      }
    }
    rec.current = r
    try { r.start(); setListening(true) } catch { setListening(false) }
  }
  const stop = () => rec.current?.stop()

  return (
    <div className="mt-5 rounded-3xl border border-border bg-surface-2/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{t({ en: 'Recite to check', bn: 'তিলাওয়াত করে যাচাই করুন' })}</p>
          <p className="text-xs text-muted-foreground">{t({ en: 'Speak from memory — we compare word by word.', bn: 'মুখস্থ বলুন — শব্দে শব্দে মিলিয়ে দেখা হবে।' })}</p>
        </div>
        <button
          onClick={listening ? stop : start}
          className={cn(
            'relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-primary-foreground transition active:scale-95',
            listening ? 'bg-destructive' : 'bg-primary'
          )}
          aria-label={listening ? 'Stop' : 'Recite'}
        >
          {listening && <span className="pulse-ring absolute inset-0 rounded-full" />}
          {listening ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      {listening && transcript && <p dir="rtl" lang="ar" className="mt-3 text-center font-arabic text-xl text-muted-foreground">{transcript}</p>}
      {result && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <p dir="rtl" lang="ar" className="quran-text text-center text-[length:clamp(22px,6vw,30px)] [line-height:2.2]">
            {result.items.map((it, i) => (
              <span
                key={i}
                className={cn('mx-0.5 rounded-md px-1', it.ok ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive line-through decoration-1')}
              >
                {it.word}
              </span>
            ))}
          </p>
          <p className="mt-2 text-center text-sm font-medium">
            {Math.round(result.accuracy * 100)}% {t({ en: 'matched', bn: 'মিলেছে' })}
            {result.extra.length > 0 && <span className="text-muted-foreground"> · +{result.extra.length} {t({ en: 'extra', bn: 'অতিরিক্ত' })}</span>}
          </p>
          <p className="mt-1 text-center text-[11px] text-muted-foreground">{t({ en: 'Speech recognition is approximate — use it as a guide.', bn: 'স্পিচ রিকগনিশন আনুমানিক — নির্দেশনা হিসেবে দেখুন।' })}</p>
        </motion.div>
      )}
    </div>
  )
}
