import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'
import { breadcrumbLd } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'

export interface Crumb { name: string; href: string }

const HOME = { en: 'Home', bn: 'হোম' } as const

/**
 * Visible breadcrumb trail + BreadcrumbList JSON-LD. The last crumb is the current page.
 * With `locale="bn"` the Home crumb is Bangla and every href is moved under /bn.
 */
export function Breadcrumbs({ items, className = '', locale = 'en' }: { items: Crumb[]; className?: string; locale?: Locale }) {
  const all: Crumb[] = [{ name: HOME[locale], href: '/' }, ...items].map((c) => ({ ...c, href: localeHref(locale, c.href) }))
  return (
    <>
      <JsonLd data={breadcrumbLd(all)} />
      <nav aria-label={locale === 'bn' ? 'ব্রেডক্রাম্ব' : 'Breadcrumb'} className={`text-xs text-muted-foreground ${className}`}>
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3 opacity-60 rtl:rotate-180" aria-hidden />}
              {i === all.length - 1 ? (
                <span aria-current="page" className="max-w-[16rem] truncate font-medium text-foreground/80">{c.name}</span>
              ) : (
                <Link href={c.href} className="hover:text-foreground">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
