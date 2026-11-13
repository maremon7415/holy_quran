import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { UiIcon } from '@/components/ui-icon'
import { T } from '@/lib/i18n/text'
import { bnNum } from '@/lib/i18n/t'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import type { CollectionMeta } from '@/lib/hadith/collections'
import type { CollectionSummary, HadithEntry } from '@/lib/hadith/hadith'
import { clipText } from '@/lib/hadith/text'
import { collectionUrl, hadithUrl } from '@/lib/hadith/url'
import { GradeChip } from './grades'

export function CollectionCard({ meta, sum, locale }: { meta: CollectionMeta; sum: CollectionSummary; locale: Locale }) {
  const bn = locale === 'bn'
  const n = (x: number) => (bn ? bnNum(x.toLocaleString('en-US')) : x.toLocaleString('en-US'))
  return (
    <Link href={collectionUrl(meta.slug, locale)} className="card-soft lift group relative flex h-full flex-col rounded-3xl p-5">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent"><UiIcon name={meta.icon} size={28} /></span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary">{bn ? meta.name.bn : <T en={meta.name.en} bn={meta.name.bn} ar={meta.name.ar} />}</h3>
          <p lang="ar" dir="rtl" className="font-arabic text-arabic mt-0.5 text-start text-xl leading-[1.9]">{meta.name.ar}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{bn ? meta.desc.bn : <T en={meta.desc.en} bn={meta.desc.bn} ar={meta.desc.ar} />}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs font-semibold">
        <span className="rounded-full bg-muted px-2.5 py-1">{n(sum.count)} {bn ? 'হাদিস' : <T en="hadiths" ar="حديث" />}</span>
        <span className="rounded-full bg-muted px-2.5 py-1">{n(sum.books)} {bn ? 'অধ্যায়' : <T en="books" bn="অধ্যায়" ar="كتابًا" />}</span>
        {meta.authenticity === 'consensus' && <GradeChip category="sahih" locale={locale}>{bn ? 'সহীহ (ঐকমত্য)' : <T en="Authentic (consensus)" bn="সহীহ (ঐকমত্য)" ar="صحيح بالإجماع" />}</GradeChip>}
        <ChevronRight className="ms-auto size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden />
      </div>
    </Link>
  )
}

/** Compact list row for a hadith (book pages, famous lists). */
export function HadithRow({ collection, number, title, entries, locale, cite }: { collection: CollectionMeta; number: number; title?: string; entries?: HadithEntry[]; locale: Locale; cite?: boolean }) {
  const bn = locale === 'bn'
  const first = entries?.[0]
  const text = bn ? first?.bn ?? first?.en : first?.en ?? first?.bn
  const ar = first?.ar
  const grade = entries?.flatMap((e) => e.grades)[0]
  return (
    <li className="card-soft lift group relative rounded-3xl p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link href={hadithUrl(collection.slug, number, locale)} className="font-display text-[17px] font-semibold after:absolute after:inset-0 after:content-[''] group-hover:text-primary" lang={bn ? 'bn' : 'en'}>
          {bn ? `${collection.name.bn} ${bnNum(number)}` : `${cite === false ? '' : collection.cite + ' '}${number}`}
        </Link>
        {title && <span className="min-w-0 text-[15px] text-foreground/85" lang="en">{title}</span>}
        {grade && <GradeChip category={grade.category} locale={locale} className="ms-auto"><span lang="en">{grade.grade}</span></GradeChip>}
      </div>
      {ar && <p lang="ar" dir="rtl" className="font-arabic text-arabic mt-3 line-clamp-2 text-right text-[22px] leading-[2]">{ar}</p>}
      {text && <p className={`mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground ${bn && first?.bn ? 'font-bangla' : ''}`} lang={bn && first?.bn ? 'bn' : 'en'}>{clipText(text, 320)}</p>}
    </li>
  )
}

export const hadithHref = (locale: Locale, p: string) => localeHref(locale, p)
