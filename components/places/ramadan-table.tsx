'use client'
import { useEffect, useState } from 'react'
import { useLang, useTx } from '@/lib/lang'
import { bnDigits, zonedYmd, ymdKey } from '@/lib/places/dates'
import { cn } from '@/lib/utils'

export interface RamadanRow {
  date: string
  /** Ramadan day number by the Umm al-Qura calendar (1-based) */
  dayNo: number
  dateLabel: string
  weekday: string
  sehri: string
  iftar: string
  friday: boolean
}

const th = 'whitespace-nowrap px-3 py-2.5 text-start text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'

/** Ramadan sehri/iftar table (strings are formatted on the server for the city's zone). Highlights today and lets Bangladesh-style +1 day numbering be toggled. */
export function RamadanTable({ rows, tz, cityName, startLabel }: { rows: RamadanRow[]; tz: string; cityName: string; startLabel: { saudi: string; plusOne: string } }) {
  const t = useTx()
  const lang = useLang()
  const [today, setToday] = useState<string | null>(null)
  const [shift, setShift] = useState<0 | 1>(0)
  useEffect(() => { setToday(ymdKey(zonedYmd(Date.now(), tz))) }, [tz])
  const n = (v: number) => (lang === 'bn' ? bnDigits(v) : String(v))
  const day = (r: RamadanRow) => { const d = r.dayNo - shift; return d >= 1 && d <= 30 ? n(d) : '—' }
  const cur = rows.find((r) => r.date === today)

  return (
    <div>
      {cur && (
        <div className="mb-4 grid gap-3 rounded-3xl border border-primary/30 bg-accent p-4 sm:grid-cols-3" data-testid="ramadan-today">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{t({ en: `Today in ${cityName}`, bn: `আজ ${cityName}`, ar: 'اليوم' })}</p>
            <p className="font-display text-xl font-semibold">{cur.weekday}, {cur.dateLabel}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Ramadan day', bn: 'রমজানের দিন', ar: 'يوم رمضان' })} {day(cur)}</p>
          </div>
          <div><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t({ en: 'Sehri ends', bn: 'সেহরির শেষ সময়', ar: 'نهاية السحور' })}</p><p className="font-display text-2xl font-semibold tabular-nums">{cur.sehri}</p></div>
          <div><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t({ en: 'Iftar', bn: 'ইফতার', ar: 'الإفطار' })}</p><p className="font-display text-2xl font-semibold tabular-nums">{cur.iftar}</p></div>
        </div>
      )}
      <div data-print-hide className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t({ en: 'Day numbering:', bn: 'দিন গণনা:', ar: 'ترقيم الأيام:' })}</span>
        {([0, 1] as const).map((s) => (
          <button key={s} type="button" aria-pressed={shift === s} onClick={() => setShift(s)} className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold transition', shift === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-accent')}>
            {s === 0 ? startLabel.saudi : startLabel.plusOne}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-3xl border border-border bg-card print:overflow-visible print:border-0">
        <table className="w-full min-w-[420px] border-collapse text-sm print:text-xs">
          <caption className="sr-only">{t({ en: `Ramadan sehri and iftar timetable for ${cityName}`, bn: `${cityName} রমজানের সেহরি ও ইফতারের সময়সূচি`, ar: 'جدول السحور والإفطار' })}</caption>
          <thead className="bg-surface-2/70">
            <tr>
              <th scope="col" className={th}>{t({ en: 'Ramadan', bn: 'রমজান', ar: 'رمضان' })}</th>
              <th scope="col" className={th}>{t({ en: 'Date', bn: 'তারিখ', ar: 'التاريخ' })}</th>
              <th scope="col" className={th}>{t({ en: 'Sehri ends', bn: 'সেহরির শেষ', ar: 'نهاية السحور' })}</th>
              <th scope="col" className={th}>{t({ en: 'Iftar', bn: 'ইফতার', ar: 'الإفطار' })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.date} data-date={r.date} data-today={r.date === today ? 'true' : undefined} className={cn('odd:bg-surface-2/30 data-[today=true]:bg-primary/10 data-[today=true]:font-semibold', r.friday && 'text-gold')}>
                <th scope="row" className="px-3 py-2 text-start font-semibold tabular-nums">{day(r)}</th>
                <td className="whitespace-nowrap px-3 py-2 text-start">{r.dateLabel} <span className="text-xs font-normal text-muted-foreground">{r.weekday}</span></td>
                <td className="whitespace-nowrap px-3 py-2 text-start tabular-nums">{r.sehri}</td>
                <td className="whitespace-nowrap px-3 py-2 text-start tabular-nums">{r.iftar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
