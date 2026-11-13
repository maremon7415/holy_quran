'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Coordinates, Qibla } from 'adhan'
import { MapPin, Smartphone } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useMounted, useTx } from '@/lib/lang'
import { UiIcon } from '@/components/ui-icon'
import { LocationPicker } from '@/components/prayer/location-picker'
import { cn } from '@/lib/utils'

const KAABA = { lat: 21.4225, lon: 39.8262 }
const rad = (d: number) => (d * Math.PI) / 180
function distanceKm(lat: number, lon: number) {
  const dLat = rad(KAABA.lat - lat), dLon = rad(KAABA.lon - lon)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(KAABA.lat)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
const CARD = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
const cardinal = (deg: number) => CARD[Math.round(deg / 22.5) % 16]

type Perm = 'unknown' | 'needs' | 'granted' | 'denied'

function useHeading() {
  const [heading, setHeading] = useState<number | null>(null)
  const [perm, setPerm] = useState<Perm>('unknown')
  const unwrapped = useRef<number | null>(null)

  const onOrient = useCallback((e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
    let h: number | null = null
    if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading
    else if (e.absolute && e.alpha !== null) h = (360 - e.alpha) % 360
    else if (e.type === 'deviceorientationabsolute' && e.alpha !== null) h = (360 - e.alpha) % 360
    if (h === null || Number.isNaN(h)) return
    // unwrap so the dial never spins the long way round at 359 -> 0
    const prev = unwrapped.current
    if (prev === null) unwrapped.current = h
    else {
      let d = h - (((prev % 360) + 360) % 360)
      if (d > 180) d -= 360
      if (d < -180) d += 360
      unwrapped.current = prev + d
    }
    setHeading(unwrapped.current)
  }, [])

  const listen = useCallback(() => {
    window.addEventListener('deviceorientationabsolute', onOrient as EventListener, true)
    window.addEventListener('deviceorientation', onOrient as EventListener, true)
  }, [onOrient])

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DOE.requestPermission === 'function') setPerm('needs')
    else { setPerm('granted'); listen() }
    return () => {
      window.removeEventListener('deviceorientationabsolute', onOrient as EventListener, true)
      window.removeEventListener('deviceorientation', onOrient as EventListener, true)
    }
  }, [listen, onOrient])

  const request = async () => {
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    try {
      const r = await DOE.requestPermission?.()
      if (r === 'granted') { setPerm('granted'); listen() } else setPerm('denied')
    } catch { setPerm('denied') }
  }
  return { heading, perm, request }
}

export function QiblaView() {
  const mounted = useMounted()
  const t = useTx()
  const location = useAppStore((s) => s.location)
  const { heading, perm, request } = useHeading()
  const [changing, setChanging] = useState(false)
  const buzzed = useRef(false)

  const { latitude, longitude } = location
  const has = latitude !== null && longitude !== null
  const bearing = has ? Qibla(new Coordinates(latitude!, longitude!)) : null
  const km = has ? distanceKm(latitude!, longitude!) : null
  const live = heading !== null
  const rel = live && bearing !== null ? ((((bearing - heading!) % 360) + 540) % 360) - 180 : null // -180..180
  const aligned = rel !== null && Math.abs(rel) < 4

  useEffect(() => {
    if (aligned && !buzzed.current) { buzzed.current = true; try { navigator.vibrate?.([30, 40, 30]) } catch { /* noop */ } }
    if (!aligned && rel !== null && Math.abs(rel) > 12) buzzed.current = false
  }, [aligned, rel])

  if (!mounted) return <div className="mx-auto max-w-3xl px-4 pb-32 pt-8"><div className="card-soft h-[34rem] shimmer" /></div>

  if (!has || bearing === null || km === null) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-32 pt-8 sm:px-6">
        <div className="card-soft relative overflow-hidden p-8 text-center">
          <div aria-hidden className="bg-pattern absolute inset-0 opacity-60" />
          <div className="relative">
            <UiIcon name="qibla" size={88} className="mx-auto" />
            <h1 className="mt-4 font-display text-2xl font-semibold">{t({ en: 'Find the Qibla', bn: 'কিবলা খুঁজুন' })}</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t({ en: 'We need your location to point towards the Kaaba in Makkah.', bn: 'কাবার দিক দেখাতে আপনার অবস্থান প্রয়োজন।' })}</p>
            <LocationPicker className="mt-6 text-left" />
          </div>
        </div>
      </div>
    )
  }

  const dial = live ? -heading! : 0
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5)

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{t({ en: 'Qibla compass', bn: 'কিবলা কম্পাস' })}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{t({ en: 'Qibla Direction', bn: 'কিবলার দিক' })}</h1>
        </div>
        <button onClick={() => setChanging((v) => !v)} className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium transition hover:border-primary/40">
          <MapPin className="size-4 text-primary" /> {location.city ?? t({ en: 'My location', bn: 'আমার অবস্থান' })}
        </button>
      </div>
      {changing && <div className="card-soft mb-4 p-4"><LocationPicker compact /></div>}

      <section className="card-soft relative overflow-hidden rounded-[2rem] px-4 pb-6 pt-8 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className={cn('absolute left-1/2 top-1/3 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] transition-opacity duration-700', aligned ? 'opacity-100' : 'opacity-50')} />
          <div className="bg-pattern absolute inset-0 opacity-70 [mask-image:radial-gradient(circle_at_50%_40%,black,transparent_70%)]" />
        </div>

        {/* status */}
        <div className="relative mb-4 text-center">
          <p className={cn('inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition', aligned ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted-foreground')}>
            {aligned ? <>{t({ en: 'You are facing the Qibla', bn: 'আপনি কিবলার দিকে মুখ করে আছেন' })} ✓</>
              : live ? t({ en: `Turn ${rel! > 0 ? 'right' : 'left'} ${Math.abs(Math.round(rel!))}°`, bn: `${Math.abs(Math.round(rel!))}° ${rel! > 0 ? 'ডানে' : 'বামে'} ঘুরুন` })
              : t({ en: 'Static bearing from North', bn: 'উত্তর থেকে স্থির দিক' })}
          </p>
        </div>

        {/* compass */}
        <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
          <svg viewBox="-200 -200 400 400" className="size-full overflow-visible" role="img" aria-label={`Qibla is ${Math.round(bearing)} degrees ${cardinal(bearing)}`}>
            <defs>
              <radialGradient id="qface" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="var(--card)" /><stop offset="1" stopColor="var(--surface-2)" />
              </radialGradient>
            </defs>
            <circle r="190" fill="url(#qface)" className="stroke-border" strokeWidth="2" />
            <circle r="136" fill="none" className="stroke-border" strokeWidth="1" strokeDasharray="2 5" />
            {/* fixed lubber mark */}
            <path d="M0,-203 l-9,-17 h18 z" className={aligned ? 'fill-primary' : 'fill-gold'} />
            <motion.g initial={false} animate={{ rotate: dial }} transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.6 }} style={{ originX: '0px', originY: '0px' }}>
              {ticks.map((d) => (
                <line key={d} x1="0" x2="0" y1={-182} y2={d % 90 === 0 ? -164 : d % 30 === 0 ? -169 : -175} transform={`rotate(${d})`} className={d % 90 === 0 ? 'stroke-foreground' : 'stroke-muted-foreground/50'} strokeWidth={d % 90 === 0 ? 2.5 : 1.2} strokeLinecap="round" />
              ))}
              {[['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([l, d]) => (
                <g key={l as string} transform={`rotate(${d})`}>
                  <text y="-142" textAnchor="middle" transform={`rotate(${-(d as number)} 0 -142)`} className={cn('font-display text-[22px] font-semibold', l === 'N' ? 'fill-primary' : 'fill-muted-foreground')}>{l}</text>
                </g>
              ))}
              {/* qibla needle on the dial */}
              <g transform={`rotate(${bearing})`}>
                <line y1="-8" y2="-118" className="stroke-gold" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" />
                <circle cy="-150" r="30" className={cn('transition-all', aligned ? 'fill-primary/25' : 'fill-gold/20')} />
                <g transform={`rotate(${-bearing} 0 -150)`}>
                  <motion.g animate={{ rotate: live ? -dial : 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.6 }} style={{ originX: '0px', originY: '-150px' }}>
                    <image href="/icons/ui/kaaba.png" x="-22" y="-172" width="44" height="44" />
                  </motion.g>
                </g>
              </g>
            </motion.g>
            {/* centre hub */}
            <circle r="9" className="fill-gold stroke-card" strokeWidth="3" />
          </svg>
        </div>

        {/* readouts */}
        <div className="relative mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { k: t({ en: 'Bearing', bn: 'দিক' }), v: `${Math.round(bearing)}°`, s: cardinal(bearing) },
            { k: t({ en: 'Distance', bn: 'দূরত্ব' }), v: Math.round(km).toLocaleString(), s: 'km' },
            { k: t({ en: 'Heading', bn: 'আপনার মুখ' }), v: live ? `${Math.round(((heading! % 360) + 360) % 360)}°` : '—', s: live ? cardinal(((heading! % 360) + 360) % 360) : t({ en: 'no sensor', bn: 'সেন্সর নেই' }) },
          ].map((r) => (
            <div key={r.k} className="rounded-2xl bg-surface-2 px-2 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{r.k}</p>
              <p className="font-display text-2xl font-semibold tabular-nums">{r.v}</p>
              <p className="text-xs text-muted-foreground">{r.s}</p>
            </div>
          ))}
        </div>

        {perm === 'needs' && !live && (
          <div className="relative mt-5 text-center">
            <button onClick={request} className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[0_14px_30px_-14px_var(--glow)] transition active:scale-[0.98]">
              <Smartphone className="size-4" /> {t({ en: 'Enable live compass', bn: 'লাইভ কম্পাস চালু করুন' })}
            </button>
          </div>
        )}
        {perm === 'denied' && <p className="relative mt-4 text-center text-sm text-muted-foreground">{t({ en: 'Compass access was denied. Allow motion & orientation in Safari settings, or use the bearing above.', bn: 'কম্পাস অনুমতি দেওয়া হয়নি। সেটিংসে মোশন অনুমতি দিন, অথবা উপরের দিক ব্যবহার করুন।' })}</p>}
        {!live && perm !== 'needs' && perm !== 'denied' && (
          <p className="relative mt-4 text-center text-sm text-muted-foreground">
            {t({ en: `No compass sensor detected. Face North, then turn ${Math.round(bearing)}° clockwise (${cardinal(bearing)}) towards the Kaaba. Open this page on your phone for a live compass.`, bn: `কম্পাস সেন্সর নেই। উত্তরমুখী হয়ে ${Math.round(bearing)}° ঘড়ির কাঁটার দিকে ঘুরুন (${cardinal(bearing)})। লাইভ কম্পাসের জন্য ফোনে খুলুন।` })}
          </p>
        )}
      </section>

      <div className="card-soft mt-4 flex items-center gap-4 p-4 sm:p-5">
        <UiIcon name="kaaba" size={56} />
        <div>
          <p className="font-display text-lg font-semibold">{t({ en: 'Kaaba, Makkah al-Mukarramah', bn: 'কাবা, মক্কা আল-মুকাররমা' })}</p>
          <p className="text-sm text-muted-foreground">{KAABA.lat.toFixed(4)}°N, {KAABA.lon.toFixed(4)}°E · {Math.round(km).toLocaleString()} km</p>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">{t({ en: 'Keep your phone flat and away from magnets or metal for best accuracy.', bn: 'সঠিক ফলাফলের জন্য ফোন সমতলে রাখুন এবং চুম্বক বা ধাতু থেকে দূরে রাখুন।' })}</p>
    </div>
  )
}
