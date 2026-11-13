'use client'
import { tajweedLegend } from '@/lib/reader/tajweed'
import { useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'

export function TajweedLegend({ className, compact = false }: { className?: string; compact?: boolean }) {
  const t = useTx()
  return (
    <div className={cn('flex flex-wrap gap-1.5', compact && 'no-scrollbar flex-nowrap overflow-x-auto', className)}>
      {tajweedLegend.map((r) => (
        <span key={r.cls} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          <span className="size-2.5 rounded-full" style={{ background: r.color }} />
          {t(r)}
        </span>
      ))}
    </div>
  )
}
