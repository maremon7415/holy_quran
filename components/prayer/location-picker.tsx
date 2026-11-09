'use client'
import { useEffect, useRef, useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useTx } from '@/lib/lang'
import { usePrayerPrefs } from '@/lib/stores/prayer'
import { UiIcon } from '@/components/ui-icon'
import { cn } from '@/lib/utils'

interface Place { id: number; name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone?: string }

/** Geolocation button + Open-Meteo city search. Writes to the persisted store location. */
export function LocationPicker({ className, compact }: { className?: string; compact?: boolean }) {
  const t = useTx()
  const setLocation = useAppStore((s) => s.setLocation)
  const setTz = usePrayerPrefs((s) => s.setTz)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [busy, setBusy] = useState(false)
  const [geoBusy, setGeoBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const seq = useRef(0)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setResults([]); return }
    const id = ++seq.current
    setBusy(true)
    const h = setTimeout(async () => {
      try {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=6&language=en&format=json`)
        const j = await r.json()
        if (id === seq.current) setResults(j.results ?? [])
      } catch { if (id === seq.current) setResults([]) }
      finally { if (id === seq.current) setBusy(false) }
    }, 300)
    return () => clearTimeout(h)
  }, [q])

  const locate = () => {
    setMsg(null)
    if (!navigator.geolocation) { setMsg(t({ en: 'Location is not supported here — search a city instead.', bn: 'লোকেশন সাপোর্ট নেই — শহর খুঁজুন।' })); return }
    setGeoBusy(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords
        let city = t({ en: 'My location', bn: 'আমার অবস্থান' })
        try {
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          const j = await r.json()
          city = j.city || j.locality || city
        } catch { /* keep default */ }
        setTz(null)
        setLocation({ latitude, longitude, city })
        setGeoBusy(false)
      },
      (e) => {
        setGeoBusy(false)
        setMsg(e.code === 1
          ? t({ en: 'Location permission denied — search your city below.', bn: 'অনুমতি দেওয়া হয়নি — নিচে শহর খুঁজুন।' })
          : t({ en: 'Could not get your position — search your city below.', bn: 'অবস্থান পাওয়া যায়নি — নিচে শহর খুঁজুন।' }))
      },
      { timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <button onClick={locate} disabled={geoBusy} className={cn('inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground shadow-[0_14px_30px_-14px_var(--glow)] transition active:scale-[0.98] disabled:opacity-60', compact ? 'h-10 text-sm' : 'h-12')}>
        {geoBusy ? <Loader2 className="size-4 animate-spin" /> : <UiIcon name="qibla" size={20} />}
        {t({ en: 'Use my location', bn: 'আমার অবস্থান ব্যবহার করুন' })}
      </button>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t({ en: 'Or search a city…', bn: 'অথবা শহর খুঁজুন…' })}
          aria-label={t({ en: 'Search city', bn: 'শহর খুঁজুন' })}
          className="h-11 w-full rounded-full border bg-background pl-11 pr-10 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
        {busy ? <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          : q && <button aria-label="Clear" onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
      </div>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      {results.length > 0 && (
        <ul className="overflow-hidden rounded-2xl border bg-card">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => { setTz(p.timezone ?? null); setLocation({ latitude: p.latitude, longitude: p.longitude, city: p.name }); setQ(''); setResults([]) }}
                className="flex w-full items-center gap-3 border-b px-4 py-3 text-left text-sm transition last:border-0 hover:bg-accent"
              >
                <UiIcon name="mosque" size={22} />
                <span className="font-medium">{p.name}</span>
                <span className="truncate text-muted-foreground">{[p.admin1, p.country].filter(Boolean).join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
