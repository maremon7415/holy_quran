'use client'
import { useEffect, useState } from 'react'
import Link from '@/lib/i18n/link'
import { chapters, surahHref } from '@/lib/quran/chapters'
import { cachedPagePaths } from '@/lib/offline/cache'
import { useTx } from '@/lib/lang'

/** Lists the surahs that are stored on this device (used on the offline fallback page). */
export function SavedSurahs() {
  const t = useTx()
  const [ids, setIds] = useState<number[] | null>(null)
  useEffect(() => { void cachedPagePaths().then((p) => setIds(chapters.filter((c) => p.has(surahHref(c.id))).map((c) => c.id))) }, [])
  if (!ids) return null
  return (
    <div className="mt-8 w-full text-start">
      <p className="mb-3 text-center text-sm font-semibold">{ids.length ? t({ en: `Available offline (${ids.length})`, bn: `অফলাইনে পাওয়া যাবে (${ids.length})`, ar: `متاح دون اتصال (${ids.length})` }) : t({ en: 'No surahs are saved on this device yet.', bn: 'এই ডিভাইসে এখনো কোনো সূরা সংরক্ষিত নেই।', ar: 'لم تُحفظ أي سور على هذا الجهاز بعد.' })}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {ids.slice(0, 114).map((id) => <Link key={id} href={surahHref(id)} prefetch={false} className="rounded-full border bg-card px-3 py-1.5 text-sm transition hover:border-primary/50">{id}. {chapters[id - 1].nameSimple}</Link>)}
      </div>
    </div>
  )
}
