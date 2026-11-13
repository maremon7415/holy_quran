'use client'
import { useEffect, useState } from 'react'
import { useLang, useTx } from '@/lib/lang'
import { bnNum } from '@/lib/i18n/t'

export interface CountdownTarget {
  key: string
  /** Absolute instant the event begins (ISO 8601 with offset) */
  iso: string
  label: { en: string; bn: string; ar: string }
  /** SSR text shown before hydration (never time-dependent) */
  date: string
}

const MS = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }
const DAY = 864e5

function useNow() {
  // null on the server and for the first client render => identical markup, no hydration mismatch
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Live countdown(s) to an event. Renders dashes until mounted (hydration-safe), a status line once the day has begun or passed. */
export function EventCountdown({ targets }: { targets: CountdownTarget[] }) {
  const t = useTx()
  const lang = useLang()
  const now = useNow()
  const n = (v: number | string) => (lang === 'bn' ? bnNum(v) : String(v))
  return (
    <div className="grid gap-3 sm:grid-cols-2" data-testid="event-countdown">
      {targets.map((x) => {
        const diff = now === null ? null : new Date(x.iso).getTime() - now
        const parts = diff !== null && diff > 0 ? { d: Math.floor(diff / MS.d), h: Math.floor((diff % MS.d) / MS.h), m: Math.floor((diff % MS.h) / MS.m), s: Math.floor((diff % MS.m) / MS.s) } : null
        const status = diff === null ? null : diff > 0 ? 'upcoming' : diff > -DAY ? 'today' : 'past'
        return (
          <div key={x.key} data-status={status ?? 'loading'} className="rounded-3xl border border-border bg-card/85 p-4 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{t(x.label)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{x.date}</p>
            {status === 'today' ? (
              <p className="font-display mt-3 text-2xl font-semibold text-gold" role="status">{t({ en: 'Today', bn: 'আজ', ar: 'اليوم' })}</p>
            ) : status === 'past' ? (
              <p className="font-display mt-3 text-xl font-semibold text-muted-foreground">{t({ en: 'This date has passed', bn: 'তারিখটি পার হয়ে গেছে', ar: 'مضى هذا التاريخ' })}</p>
            ) : (
              <div role="timer" aria-live="off" className="mt-3 grid grid-cols-4 gap-2 text-center" dir="ltr">
                {(['d', 'h', 'm', 's'] as const).map((k) => (
                  <div key={k} className="rounded-2xl bg-muted/60 px-1 py-2">
                    <p className="font-display text-2xl font-semibold tabular-nums leading-none sm:text-3xl" data-unit={k}>{parts ? n(k === 'd' ? parts.d : pad(parts[k])) : '–'}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t({ d: { en: 'days', bn: 'দিন', ar: 'يوم' }, h: { en: 'hours', bn: 'ঘণ্টা', ar: 'ساعة' }, m: { en: 'min', bn: 'মিনিট', ar: 'دقيقة' }, s: { en: 'sec', bn: 'সেকেন্ড', ar: 'ثانية' } }[k])}</p>
                  </div>
                ))}
              </div>
            )}
            {parts && <span className="sr-only">{t({ en: `${parts.d} days remaining`, bn: `${bnNum(parts.d)} দিন বাকি`, ar: `متبقي ${parts.d} يومًا` })}</span>}
          </div>
        )
      })}
    </div>
  )
}

/** Inline “in N days” for lists. The server-computed number is shown first; the client refreshes it on mount. */
export function DaysUntil({ iso, initialDays }: { iso: string; initialDays: number }) {
  const t = useTx()
  const lang = useLang()
  const [days, setDays] = useState(initialDays)
  useEffect(() => {
    const calc = () => setDays(Math.ceil((new Date(iso).getTime() - Date.now()) / DAY))
    calc()
    const id = window.setInterval(calc, 60_000)
    return () => window.clearInterval(id)
  }, [iso])
  const n = lang === 'bn' ? bnNum(days) : String(days)
  return (
    <span data-testid="days-until" className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
      {days > 1 ? t({ en: `in ${n} days`, bn: `${n} দিন পর`, ar: `بعد ${n} يومًا` }) : days === 1 ? t({ en: 'tomorrow', bn: 'আগামীকাল', ar: 'غدًا' }) : days === 0 ? t({ en: 'today', bn: 'আজ', ar: 'اليوم' }) : t({ en: 'in progress / passed', bn: 'চলমান / গত', ar: 'جارٍ / مضى' })}
    </span>
  )
}
