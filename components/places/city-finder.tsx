'use client'
import { useMemo, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import Link from '@/lib/i18n/link'
import { useTx } from '@/lib/lang'

export interface FinderCity { slug: string; en: string; bn: string; country: string; lat: number; lng: number }

const rad = (d: number) => (d * Math.PI) / 180
function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Search the city directory (English / Bangla / country) and find the nearest city from the device location. */
export function CityFinder({ cities, path = '/prayer-times' }: { cities: FinderCity[]; path?: string }) {
  const t = useTx()
  const [q, setQ] = useState('')
  const [near, setNear] = useState<FinderCity | null>(null)
  const [state, setState] = useState<'idle' | 'busy' | 'denied'>('idle')
  const hits = useMemo(() => {
    const n = fold(q.trim())
    if (!n) return []
    return cities.filter((c) => fold(c.en).includes(n) || c.bn.includes(q.trim()) || fold(c.country).includes(n) || c.slug.includes(n)).slice(0, 12)
  }, [q, cities])

  const locate = () => {
    if (!navigator.geolocation) return setState('denied')
    setState('busy')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const me = { lat: p.coords.latitude, lng: p.coords.longitude }
        setNear([...cities].sort((a, b) => km(me, a) - km(me, b))[0])
        setState('idle')
      },
      () => setState('denied'),
      { timeout: 10_000, maximumAge: 600_000 },
    )
  }

  return (
    <div className="card-soft rounded-3xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">{t({ en: 'Search for a city', bn: 'শহর খুঁজুন', ar: 'ابحث عن مدينة' })}</span>
          <Search aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t({ en: 'Search a city — Dhaka, ঢাকা, London…', bn: 'শহর খুঁজুন — ঢাকা, Dhaka, London…', ar: 'ابحث عن مدينة…' })} className="h-12 w-full rounded-2xl border bg-background ps-10 pe-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
        </label>
        <button type="button" onClick={locate} disabled={state === 'busy'} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
          <MapPin className="size-4" /> {state === 'busy' ? t({ en: 'Locating…', bn: 'খোঁজা হচ্ছে…', ar: 'جارٍ التحديد…' }) : t({ en: 'My nearest city', bn: 'আমার নিকটতম শহর', ar: 'أقرب مدينة' })}
        </button>
      </div>
      {state === 'denied' && <p role="status" className="mt-3 text-sm text-muted-foreground">{t({ en: 'Location is unavailable — search for your city instead.', bn: 'অবস্থান পাওয়া যায়নি — শহরের নাম লিখে খুঁজুন।', ar: 'تعذّر تحديد الموقع.' })}</p>}
      {near && (
        <p className="mt-3 text-sm" data-testid="nearest-city">
          {t({ en: 'Nearest city:', bn: 'নিকটতম শহর:', ar: 'أقرب مدينة:' })}{' '}
          <Link href={`${path}/${near.slug}`} className="font-semibold text-primary hover:underline">{t({ en: near.en, bn: near.bn, ar: near.en })}</Link>
        </p>
      )}
      {q.trim() && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={t({ en: 'Matching cities', bn: 'মিলে যাওয়া শহর', ar: 'المدن المطابقة' })}>
          {hits.length === 0 && <li className="text-sm text-muted-foreground">{t({ en: 'No city found.', bn: 'কোনো শহর পাওয়া যায়নি।', ar: 'لا نتائج.' })}</li>}
          {hits.map((c) => (
            <li key={c.slug}><Link href={`${path}/${c.slug}`} className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:border-primary/40 hover:bg-accent">{t({ en: c.en, bn: c.bn, ar: c.en })}</Link></li>
          ))}
        </ul>
      )}
    </div>
  )
}
