import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'
import { breadcrumbLd } from '@/lib/content/seo'

export interface Crumb { name: string; href: string }

/** Visible breadcrumb trail + BreadcrumbList JSON-LD. The last crumb is the current page. */
export function Breadcrumbs({ items, className = '' }: { items: Crumb[]; className?: string }) {
  const all: Crumb[] = [{ name: 'Home', href: '/' }, ...items]
  return (
    <>
      <JsonLd data={breadcrumbLd(all)} />
      <nav aria-label="Breadcrumb" className={`text-xs text-muted-foreground ${className}`}>
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3 opacity-60" aria-hidden />}
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
