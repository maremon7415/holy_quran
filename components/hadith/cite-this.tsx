'use client'
import { CopyButton } from '@/components/content/copy-button'
import { useTx } from '@/lib/lang'

export interface CiteFormats { short: string; full: string; markdown: string; quote: string }

/** "Cite this hadith": ready-to-paste citation formats with one-click copy. */
export function CiteThis({ formats }: { formats: CiteFormats }) {
  const t = useTx()
  const rows: { id: keyof CiteFormats; label: { en: string; bn: string; ar: string } }[] = [
    { id: 'short', label: { en: 'Short reference', bn: 'সংক্ষিপ্ত রেফারেন্স', ar: 'إحالة مختصرة' } },
    { id: 'full', label: { en: 'Full citation', bn: 'পূর্ণ উদ্ধৃতি', ar: 'توثيق كامل' } },
    { id: 'quote', label: { en: 'Quote with link', bn: 'উদ্ধৃতিসহ লিংক', ar: 'اقتباس مع الرابط' } },
    { id: 'markdown', label: { en: 'Markdown link', bn: 'মার্কডাউন লিংক', ar: 'رابط ماركداون' } },
  ]
  return (
    <ul className="grid gap-2.5">
      {rows.map((r) => (
        <li key={r.id} className="rounded-2xl border border-border bg-background/60 p-3.5">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{t(r.label)}</span>
            <CopyButton text={formats[r.id]} />
          </div>
          <p dir="auto" className="whitespace-pre-line break-words text-sm leading-relaxed text-foreground/90" lang="en">{formats[r.id]}</p>
        </li>
      ))}
    </ul>
  )
}
