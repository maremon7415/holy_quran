import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'
import { breadcrumbLd } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { T } from '@/lib/i18n/text'
import { Labelled } from '@/lib/i18n/labelled'

/** `ar` is the Arabic display name (shown when the UI language is Arabic; JSON-LD stays in the page language). */
export interface Crumb { name: string; href: string; ar?: string }

const HOME = { en: 'Home', bn: 'হোম' } as const
const HOME_AR = 'الرئيسية'

/**
 * Visible breadcrumb trail + BreadcrumbList JSON-LD. The last crumb is the current page.
 * With `locale="bn"` the Home crumb is Bangla and every href is moved under /bn.
 */
export function Breadcrumbs({ items, className = '', locale = 'en' }: { items: Crumb[]; className?: string; locale?: Locale }) {
  const all: Crumb[] = [{ name: HOME[locale], href: '/' }, ...items].map((c) => ({ ...c, href: localeHref(locale, c.href) }))
  const label = (c: Crumb, i: number) => (locale === 'bn' ? c.name : <T en={c.name} ar={i === 0 ? HOME_AR : c.ar} />)
  return (
    <>
      <JsonLd data={breadcrumbLd(all)} />
      <Labelled as="nav" label={{ en: 'Breadcrumb', bn: 'ব্রেডক্রাম্ব', ar: 'مسار التنقل' }} className={`text-xs text-muted-foreground ${className}`}>
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3 opacity-60 rtl:rotate-180" aria-hidden />}
              {i === all.length - 1 ? (
                <span aria-current="page" className="max-w-[16rem] truncate font-medium text-foreground/80">{label(c, i)}</span>
              ) : (
                <Link href={c.href} className="hover:text-foreground">{label(c, i)}</Link>
              )}
            </li>
          ))}
        </ol>
      </Labelled>
    </>
  )
}
