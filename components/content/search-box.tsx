'use client'
import { Search } from 'lucide-react'
import { useTx } from '@/lib/lang'

/** The /search form (a plain GET form, so it works without JS); localised placeholder and button. */
export function SearchBox({ q }: { q: string }) {
  const t = useTx()
  return (
    <form action="/search" role="search" className="relative mt-6 max-w-xl">
      <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input name="q" defaultValue={q} autoComplete="off" aria-label={t({ en: 'Search the Quran', bn: 'কুরআনে অনুসন্ধান', ar: 'ابحث في القرآن' })} placeholder={t({ en: 'Search the Quran…', bn: 'কুরআনে খুঁজুন…', ar: 'ابحث في القرآن…' })} className="h-12 w-full rounded-full border border-border bg-card ps-11 pe-28 text-[15px] shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
      <button type="submit" className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition active:scale-95">{t({ en: 'Search', bn: 'খুঁজুন', ar: 'بحث' })}</button>
    </form>
  )
}
