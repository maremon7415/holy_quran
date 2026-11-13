import { T } from '@/lib/i18n/text'
import { GRADE_LABEL, type Grade, type GradeCategory } from '@/lib/hadith/grades'
import type { Locale } from '@/lib/i18n/routes'
import { cn } from '@/lib/utils'

export const GRADE_STYLE: Record<GradeCategory, string> = {
  sahih: 'bg-primary/10 text-primary',
  hasan: 'bg-gold-soft text-gold',
  daif: 'bg-destructive/10 text-destructive',
  other: 'bg-muted text-muted-foreground',
}

export function GradeChip({ category, className, locale, children }: { category: GradeCategory; className?: string; locale: Locale; children?: React.ReactNode }) {
  const l = GRADE_LABEL[category]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold', GRADE_STYLE[category], className)}>
      {children ?? (locale === 'bn' ? l.bn : <T en={l.en} bn={l.bn} ar={l.ar} />)}
    </span>
  )
}

/** "Al-Albani: Sahih" rows. */
export function GradeList({ grades, locale }: { grades: Grade[]; locale: Locale }) {
  if (!grades.length) return null
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {grades.map((g) => (
        <li key={g.grader + g.grade} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 px-3.5 py-2.5 text-sm">
          <span className="min-w-0 truncate text-muted-foreground" lang="en">{g.grader}</span>
          <GradeChip category={g.category} locale={locale}><span lang="en">{g.grade}</span></GradeChip>
        </li>
      ))}
    </ul>
  )
}
