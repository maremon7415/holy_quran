'use client'
import { Search } from 'lucide-react'
import { useTx } from '@/lib/lang'
import { localeHref, type Locale } from '@/lib/i18n/routes'

/** Plain GET form (works without JS): /hadith/search?q=…&c=…. Placeholder / labels follow the UI language. */
export function HadithSearchForm({ locale, defaultValue = '', collection, autoFocus, size = 'lg' }: { locale: Locale; defaultValue?: string; collection?: string; autoFocus?: boolean; size?: 'md' | 'lg' }) {
  const t = useTx()
  return (
    <form action={localeHref(locale, '/hadith/search')} method="get" role="search" className="w-full">
      <label htmlFor="hadith-q" className="sr-only">{t({ en: 'Search hadith', bn: 'হাদিস খুঁজুন', ar: 'ابحث في الأحاديث' })}</label>
      <div className={`flex items-center gap-2 rounded-full border border-border bg-card/90 ps-4 pe-1.5 shadow-sm backdrop-blur transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 ${size === 'lg' ? 'py-1.5' : 'py-1'}`}>
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          id="hadith-q" name="q" type="search" defaultValue={defaultValue} autoFocus={autoFocus} autoComplete="off" enterKeyHint="search" dir="auto"
          placeholder={t({ en: 'Search hadith: “patience”, “Bukhari 1”, بخاري ١, ধৈর্য', bn: 'হাদিস খুঁজুন: “ধৈর্য”, “বুখারী ১”, “নিয়ত”', ar: 'ابحث في الأحاديث: «الصبر» أو «بخاري ١»' })}
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-muted-foreground/70"
        />
        {collection && <input type="hidden" name="c" value={collection} />}
        <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition active:scale-95">{t({ en: 'Search', bn: 'খুঁজুন', ar: 'بحث' })}</button>
      </div>
    </form>
  )
}
