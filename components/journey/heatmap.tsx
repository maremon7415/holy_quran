'use client'
import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTx } from '@/lib/lang'

const levelFill = (n: number) =>
  n <= 0 ? 'color-mix(in oklab, var(--foreground) 9%, var(--card))' : `color-mix(in oklab, var(--primary) ${n < 5 ? 30 : n < 10 ? 52 : n < 20 ? 75 : 100}%, var(--muted))`

const ds = (d: Date) => d.toLocaleDateString('en-CA')

/** GitHub-style 53-week activity grid. `data` maps YYYY-MM-DD → count. */
export function Heatmap({ data }: { data: Record<string, number> }) {
  const t = useTx()
  const scroller = useRef<HTMLDivElement>(null)
  const { cells, months, total, activeDays } = useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    start.setDate(start.getDate() - 364 - end.getDay())
    const cells: { date: string; n: number; future: boolean }[] = []
    const months: { col: number; label: string }[] = []
    let total = 0, activeDays = 0
    for (let i = 0; i < 53 * 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i)
      const key = ds(d)
      const n = data[key] ?? 0
      const future = d > end
      if (!future) { total += n; if (n) activeDays++ }
      cells.push({ date: key, n, future })
      if (d.getDate() <= 7 && d.getDay() === 0) months.push({ col: Math.floor(i / 7), label: d.toLocaleDateString(undefined, { month: 'short' }) })
    }
    return { cells, months, total, activeDays }
  }, [data])
  useEffect(() => { if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth }, [])
  return (
    <div>
      <div ref={scroller} className="no-scrollbar overflow-x-auto pb-1">
        <div className="relative w-max pt-5 [--c:11px] [--g:3px] lg:[--c:17px] lg:[--g:4px]">
          {months.map((m) => (
            <span key={m.col} className="absolute top-0 text-[10px] text-muted-foreground" style={{ left: `calc(${m.col} * (var(--c) + var(--g)))` }}>{m.label}</span>
          ))}
          <div className="grid grid-flow-col grid-rows-7 gap-[var(--g)]">
            {cells.map((c, i) => (
              <motion.span
                key={c.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: c.future ? 0 : 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.0015, 0.5) }}
                title={`${c.date}: ${c.n}`}
                className="h-[var(--c)] w-[var(--c)] rounded-[3px]"
                style={{ background: levelFill(c.n) }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{t({ en: `${total} verses & ayahs across ${activeDays} active days`, bn: `${activeDays} সক্রিয় দিনে ${total}টি আয়াত` })}</span>
        <span className="flex items-center gap-1">
          {t({ en: 'Less', bn: 'কম' })}
          {[0, 1, 5, 10, 20].map((n) => <span key={n} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: levelFill(n) }} />)}
          {t({ en: 'More', bn: 'বেশি' })}
        </span>
      </div>
    </div>
  )
}
