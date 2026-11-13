'use client'
import { useEffect, useMemo, useState } from 'react'
import { useLang, useTx } from '@/lib/lang'
import { addDays, fmtDate, ymdKey, type Ymd } from '@/lib/places/dates'
import { fmtHijri, gregorianOf, hijriOf, HIJRI_MONTHS, type Hijri } from '@/lib/places/hijri'

const localToday = (): Ymd => {
  const d = new Date()
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }
}
const field = 'h-11 w-full rounded-2xl border bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20'

/** Trilingual Hijri date block. The server renders today's date in Asia/Dhaka; on mount it switches to the visitor's own calendar day. */
export function HijriLive({ greg: g0 }: { greg: Ymd }) {
  const t = useTx()
  const [greg, setGreg] = useState<Ymd>(g0)
  useEffect(() => { setGreg(localToday()) }, [])
  const uq = hijriOf(greg)
  const bd = hijriOf(addDays(greg, -1))
  const lang = useLang()
  const loc = lang === 'bn' ? 'bn' : 'en'
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2" data-testid="hijri-live">
      <div className="rounded-3xl border border-border bg-card/85 p-5 backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{t({ en: 'Hijri date today (Umm al-Qura)', bn: 'আজকের হিজরি তারিখ (উম্মুল কুরা)', ar: 'التاريخ الهجري اليوم (أم القرى)' })}</p>
        <p lang="ar" dir="rtl" className="font-arabic text-gradient-gold mt-2 text-3xl leading-[1.8] sm:text-4xl">{fmtHijri(uq, 'ar')}</p>
        <p className="font-display text-2xl font-semibold" data-testid="hijri-en">{fmtHijri(uq, 'en')}</p>
        <p lang="bn" className="font-bangla mt-1 text-lg">{fmtHijri(uq, 'bn')}</p>
        <p className="mt-3 text-sm text-muted-foreground">{fmtDate(greg, loc, { weekday: true })}</p>
      </div>
      <div className="rounded-3xl border border-border bg-card/85 p-5 backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">{t({ en: 'Bangladesh — typical date (estimate)', bn: 'বাংলাদেশ — সাধারণত যে তারিখ (আনুমানিক)', ar: 'بنغلاديش — التاريخ المعتاد (تقديري)' })}</p>
        <p className="font-display mt-2 text-2xl font-semibold" data-testid="hijri-bd">{fmtHijri(bd, lang)}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t({ en: 'Bangladesh follows local moon sighting and is often one day behind Saudi Arabia. This is an estimate (Umm al-Qura minus one day), not an official announcement.', bn: 'বাংলাদেশে স্থানীয় চাঁদ দেখার ভিত্তিতে তারিখ নির্ধারিত হয় এবং প্রায়ই সৌদি আরবের একদিন পরে থাকে। এটি আনুমানিক (উম্মুল কুরা থেকে এক দিন কম), সরকারি ঘোষণা নয়।', ar: 'تعتمد بنغلاديش على الرؤية المحلية وغالبًا تتأخر يومًا عن السعودية. هذا تقدير وليس إعلانًا رسميًا.' })}</p>
      </div>
    </div>
  )
}

/** Gregorian ↔ Hijri (Umm al-Qura) converter. */
export function HijriConverter({ initial }: { initial: Ymd }) {
  const t = useTx()
  const lang = useLang()
  const loc = lang === 'bn' ? 'bn' : 'en'
  const [gDate, setGDate] = useState(ymdKey(initial))
  useEffect(() => { setGDate(ymdKey(localToday())) }, [])
  const gRes = useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(gDate)
    if (!m) return null
    const y = +m[1]
    if (y < 1900 || y > 2076) return 'range' as const
    return hijriOf({ y, m: +m[2], d: +m[3] })
  }, [gDate])

  const [hy, setHy] = useState(1448)
  const [hm, setHm] = useState(1)
  const [hd, setHd] = useState(1)
  useEffect(() => { const h = hijriOf(localToday()); setHy(h.y); setHm(h.m); setHd(h.d) }, [])
  const hRes = useMemo(() => (hy >= 1318 && hy <= 1500 ? gregorianOf(hy, hm, hd) : 'range' as const), [hy, hm, hd])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form className="card-soft rounded-3xl p-5" onSubmit={(e) => e.preventDefault()} aria-labelledby="g2h">
        <h3 id="g2h" className="font-semibold">{t({ en: 'Gregorian → Hijri', bn: 'ইংরেজি → হিজরি', ar: 'ميلادي ← هجري' })}</h3>
        <label className="mt-3 block text-sm">
          <span className="mb-1.5 block text-muted-foreground">{t({ en: 'Gregorian date', bn: 'ইংরেজি তারিখ', ar: 'التاريخ الميلادي' })}</span>
          <input type="date" value={gDate} min="1900-01-01" max="2076-12-31" onChange={(e) => setGDate(e.target.value)} className={field} />
        </label>
        <div className="mt-4 min-h-14 rounded-2xl bg-muted/60 p-3 text-sm" aria-live="polite" data-testid="g2h-result">
          {gRes === 'range' ? t({ en: 'Supported range: 1900–2076.', bn: 'সমর্থিত সীমা: ১৯০০–২০৭৬।', ar: 'النطاق المدعوم: ١٩٠٠–٢٠٧٦.' }) : gRes ? (
            <>
              <p className="font-display text-lg font-semibold">{fmtHijri(gRes, lang)}</p>
              <p lang="ar" dir="rtl" className="font-arabic text-lg">{fmtHijri(gRes, 'ar')}</p>
            </>
          ) : '—'}
        </div>
      </form>
      <form className="card-soft rounded-3xl p-5" onSubmit={(e) => e.preventDefault()} aria-labelledby="h2g">
        <h3 id="h2g" className="font-semibold">{t({ en: 'Hijri → Gregorian', bn: 'হিজরি → ইংরেজি', ar: 'هجري ← ميلادي' })}</h3>
        <div className="mt-3 grid grid-cols-[1fr_2fr_1fr] gap-2">
          <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">{t({ en: 'Year', bn: 'সাল', ar: 'السنة' })}</span>
            <input type="number" inputMode="numeric" value={hy} min={1318} max={1500} onChange={(e) => setHy(+e.target.value)} className={field} /></label>
          <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">{t({ en: 'Month', bn: 'মাস', ar: 'الشهر' })}</span>
            <select value={hm} onChange={(e) => setHm(+e.target.value)} className={field}>{HIJRI_MONTHS[lang].map((n, i) => <option key={n} value={i + 1}>{i + 1}. {n}</option>)}</select></label>
          <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">{t({ en: 'Day', bn: 'তারিখ', ar: 'اليوم' })}</span>
            <select value={hd} onChange={(e) => setHd(+e.target.value)} className={field}>{Array.from({ length: 30 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
        </div>
        <div className="mt-4 min-h-14 rounded-2xl bg-muted/60 p-3 text-sm" aria-live="polite" data-testid="h2g-result">
          {hRes === 'range' ? t({ en: 'Supported range: 1318–1500 AH.', bn: 'সমর্থিত সীমা: ১৩১৮–১৫০০ হিজরি।', ar: 'النطاق المدعوم: ١٣١٨–١٥٠٠ هـ.' }) : hRes ? (
            <p className="font-display text-lg font-semibold">{fmtDate(hRes, loc, { weekday: true })}</p>
          ) : t({ en: 'That month has only 29 days in this year.', bn: 'এই বছরে ওই মাসে ২৯ দিন।', ar: 'هذا الشهر ٢٩ يومًا في هذه السنة.' })}
        </div>
      </form>
    </div>
  )
}

export type { Hijri }
