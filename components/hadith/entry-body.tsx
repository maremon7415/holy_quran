import { T } from '@/lib/i18n/text'
import type { HadithEntry } from '@/lib/hadith/hadith'
import type { Locale } from '@/lib/i18n/routes'
import { cn } from '@/lib/utils'

/** Arabic (RTL, font-arabic) + English + Bangla blocks of one narration. */
export function EntryBody({ e, locale, className }: { e: HadithEntry; locale: Locale; className?: string }) {
  const bn = locale === 'bn'
  const en = e.en && (
    <figure key="en" className="card-soft p-5 sm:p-6">
      <figcaption className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{bn ? <span lang="en">English translation</span> : <T en="English translation" bn="ইংরেজি অনুবাদ" ar="الترجمة الإنجليزية" />}</figcaption>
      <blockquote lang="en" className="text-[length:var(--trans-size,17px)] leading-[1.85]">{e.en}</blockquote>
    </figure>
  )
  const bnFig = e.bn && (
    <figure key="bn" lang="bn" className="card-soft p-5 sm:p-6">
      <figcaption className="mb-2 font-bangla text-xs font-bold text-primary">{bn ? 'বাংলা অনুবাদ' : <span lang="bn">বাংলা অনুবাদ</span>}</figcaption>
      <blockquote className="font-bangla text-[length:calc(var(--trans-size,17px)*1.05)] leading-[1.95]">{e.bn}</blockquote>
    </figure>
  )
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {e.ar && (
        <p lang="ar" dir="rtl" className="font-arabic text-arabic text-right text-[length:calc(var(--quran-size,34px)*0.78)] leading-[2.2] sm:text-[length:calc(var(--quran-size,34px)*0.85)]">{e.ar}</p>
      )}
      {e.narrator && (
        <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground/80">{bn ? 'বর্ণনাকারী' : <T en="Narrator" bn="বর্ণনাকারী" ar="الراوي" />}:</span> <span lang="en">{e.narrator}</span></p>
      )}
      {bn ? <>{bnFig}{en}</> : <>{en}{bnFig}</>}
    </div>
  )
}
