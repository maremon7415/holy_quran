'use client'
import { useEffect, useState } from 'react'
import { useLang, useMounted, useTx } from '@/lib/lang'
import { fmtClock, zonedYmd, ymdKey, bnDigits } from '@/lib/places/times'
import { REMINDER_NAMES } from '@/lib/prayer/times'

export interface LiveDay { date: string; fajr: number; dhuhr: number; asr: number; maghrib: number; isha: number; friday: boolean }
const KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

/** Live "next prayer" countdown for a city (client island). Also marks the current prayer card in the server-rendered grid (`[data-slot]`). */
export function CityLive({ tz, cityName, days }: { tz: string; cityName: string; days: LiveDay[] }) {
  const mounted = useMounted()
  const lang = useLang()
  const t = useTx()
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  let next: { key: (typeof KEYS)[number] | 'jumuah'; at: number } | null = null
  let current: string | null = null
  if (now != null) {
    const all = days.flatMap((d) => KEYS.map((k) => ({ k, at: d[k], date: d.date, friday: d.friday })))
    const n = all.find((x) => x.at > now)
    if (n) next = { key: n.k === 'dhuhr' && n.friday ? 'jumuah' : n.k, at: n.at }
    const todayKey = ymdKey(zonedYmd(now, tz))
    const today = days.find((d) => d.date === todayKey)
    if (today) {
      const passed = KEYS.filter((k) => today[k] <= now)
      current = passed.length ? passed[passed.length - 1] : null
    }
  }

  useEffect(() => {
    if (now == null) return
    document.querySelectorAll<HTMLElement>('[data-slot]').forEach((el) => {
      const s = el.dataset.slot
      if (s === current) el.setAttribute('data-current', 'true')
      else el.removeAttribute('data-current')
      if (s === next?.key || (s === 'dhuhr' && next?.key === 'jumuah')) el.setAttribute('data-next', 'true')
      else el.removeAttribute('data-next')
    })
  })

  const fmtLeft = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000))
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    const p = (n: number) => String(n).padStart(2, '0')
    const out = `${h ? `${h}:` : ''}${h ? p(m) : m}:${p(sec)}`
    return lang === 'bn' ? bnDigits(out) : out
  }

  const loc = lang === 'bn' ? 'bn' : 'en'
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2" aria-live="off">
      <div className="rounded-3xl border border-border bg-card/80 p-4 backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t({ en: 'Next prayer', bn: 'পরবর্তী নামাজ', ar: 'الصلاة القادمة' })}</p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <span className="font-display text-2xl font-semibold">{mounted && next ? REMINDER_NAMES[next.key][lang] : '—'}</span>
          <span className="font-display text-2xl font-semibold tabular-nums text-primary" data-testid="countdown">{mounted && next && now != null ? fmtLeft(next.at - now) : '—:——'}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{mounted && next ? `${fmtClock(next.at, tz, loc)} · ${cityName}` : ' '}</p>
      </div>
      <div className="rounded-3xl border border-border bg-card/80 p-4 backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t({ en: `Time now in ${cityName}`, bn: `এখন ${cityName}-এ সময়`, ar: `الوقت الآن في ${cityName}` })}</p>
        <p className="font-display mt-1 text-2xl font-semibold tabular-nums">{mounted && now != null ? fmtClock(now, tz, loc) : '—'}</p>
        <p className="mt-1 text-xs text-muted-foreground">{tz.replace(/_/g, ' ')}</p>
      </div>
    </div>
  )
}

/** Marks the table row of the city's current date (`tr[data-date]`). */
export function TodayMarker({ tz }: { tz: string }) {
  useEffect(() => {
    const key = ymdKey(zonedYmd(Date.now(), tz))
    const row = document.querySelector<HTMLElement>(`[data-date="${key}"]`)
    row?.setAttribute('data-today', 'true')
  }, [tz])
  return null
}

export function PrintButton({ className = '' }: { className?: string }) {
  const t = useTx()
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      {t({ en: 'Print', bn: 'প্রিন্ট', ar: 'طباعة' })}
    </button>
  )
}
