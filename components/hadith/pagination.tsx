import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { bnNum } from '@/lib/i18n/t'
import { T } from '@/lib/i18n/text'
import type { Locale } from '@/lib/i18n/routes'

/** Prev / numbered / next links. `href(p)` builds the URL of page p. Links are real anchors (crawlable). */
export function Pagination({ page, pages, href, locale }: { page: number; pages: number; href: (p: number) => string; locale: Locale }) {
  if (pages <= 1) return null
  const bn = locale === 'bn'
  const set = new Set<number>([1, pages, page - 1, page, page + 1])
  if (page <= 3) { set.add(2); set.add(3) }
  if (page >= pages - 2) { set.add(pages - 1); set.add(pages - 2) }
  const nums = [...set].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b)
  const cls = 'inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-border bg-card px-3 text-sm font-semibold transition hover:border-primary/40 hover:bg-accent'
  return (
    <nav aria-label={bn ? 'পৃষ্ঠা' : 'Pagination'} className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && <Link href={href(page - 1)} rel="prev" className={cls}><ArrowLeft className="size-4 rtl:rotate-180" /><span className="ms-1.5 hidden sm:inline">{bn ? 'আগের' : <T en="Previous" ar="السابق" />}</span></Link>}
      {nums.map((p, i) => (
        <span key={p} className="contents">
          {i > 0 && nums[i - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
          {p === page ? <span aria-current="page" className={`${cls} border-primary bg-primary text-primary-foreground hover:bg-primary`}>{bn ? bnNum(p) : p}</span> : <Link href={href(p)} className={cls}>{bn ? bnNum(p) : p}</Link>}
        </span>
      ))}
      {page < pages && <Link href={href(page + 1)} rel="next" className={cls}><span className="me-1.5 hidden sm:inline">{bn ? 'পরের' : <T en="Next" ar="التالي" />}</span><ArrowRight className="size-4 rtl:rotate-180" /></Link>}
    </nav>
  )
}
