'use client'
import { useEffect, useState } from 'react'
import { useReader } from '@/lib/stores/reader'
import { fetchChapterTranslation, fetchTranslationCatalogue, type TranslationMeta } from '@/lib/reader/quran-api'
import { cn } from '@/lib/utils'

/** The reader's extra translations for one ayah (tafsir / ayah sheets). Shares the per-chapter cache with the verse list. */
export function ExtraTranslations({ k, className }: { k: string; className?: string }) {
  const ids = useReader((s) => s.extraTr)
  const idKey = ids.join(',')
  const [rows, setRows] = useState<{ id: number; meta?: TranslationMeta; text: string }[]>([])
  useEffect(() => {
    if (!idKey) return setRows([])
    let off = false
    const s = +k.split(':')[0]
    const list = idKey.split(',').map(Number)
    Promise.all([fetchTranslationCatalogue().catch(() => [] as TranslationMeta[]), Promise.all(list.map((id) => fetchChapterTranslation(s, id).catch(() => ({} as Record<string, string>))))]).then(([cat, maps]) => {
      if (off) return
      setRows(list.map((id, i) => ({ id, meta: cat.find((m) => m.id === id), text: maps[i][k] ?? '' })).filter((r) => r.text))
    })
    return () => { off = true }
  }, [k, idKey])
  if (!rows.length) return null
  return (
    <div className={cn('space-y-3', className)}>
      {rows.map((r) => (
        <div key={r.id} className="rounded-3xl border bg-card px-4 py-3">
          <span className="xt-name">{r.meta ? `${r.meta.langName.replace(/^\w/, (c) => c.toUpperCase())} · ${r.meta.name}` : `#${r.id}`}</span>
          <p className="xt-text" lang={r.meta && r.meta.lang !== 'und' ? r.meta.lang : undefined} dir={r.meta?.rtl ? 'rtl' : 'auto'}>{r.text}</p>
        </div>
      ))}
    </div>
  )
}
