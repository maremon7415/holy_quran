import 'server-only'
import { getChapters, getVerses } from './data'
import { isArabic, isBangla, normalizeArabic, normalizeLatin } from './normalize'

interface Row { s: number; n: number; ar: string; en: string; bn: string; text: { ar: string; en: string; bn: string } }
let index: Promise<Row[]> | null = null

function build(): Promise<Row[]> {
  return (async () => {
    const rows: Row[] = []
    for (let s = 1; s <= 114; s++) {
      for (const v of await getVerses(s)) {
        rows.push({
          s, n: v.n,
          ar: normalizeArabic(v.sim), en: normalizeLatin(`${v.en} ${v.enH} ${v.tl}`), bn: v.bn,
          text: { ar: v.ar, en: v.en, bn: v.bn },
        })
      }
    }
    return rows
  })()
}

export interface SearchHit { key: string; surah: number; ayah: number; surahName: string; ar: string; en: string; bn: string; score: number }

export async function searchQuran(q: string, limit = 30): Promise<{ total: number; hits: SearchHit[] }> {
  const query = q.trim()
  if (query.length < 2) return { total: 0, hits: [] }
  index ??= build()
  const rows = await index
  const chapters = await getChapters()
  const field: 'ar' | 'bn' | 'en' = isArabic(query) ? 'ar' : isBangla(query) ? 'bn' : 'en'
  const nq = field === 'ar' ? normalizeArabic(query) : field === 'en' ? normalizeLatin(query) : query.trim()
  const terms = nq.split(' ').filter(Boolean)
  const scored: SearchHit[] = []
  let total = 0
  for (const r of rows) {
    const hay = r[field]
    if (!terms.every((t) => hay.includes(t))) continue
    total++
    let score = 1
    if (hay.includes(nq)) score += 5
    if (field === 'en' && new RegExp(`\\b${nq.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(hay)) score += 3
    score -= hay.length / 2000
    scored.push({ key: `${r.s}:${r.n}`, surah: r.s, ayah: r.n, surahName: chapters[r.s - 1].nameSimple, ...r.text, score })
  }
  scored.sort((a, b) => b.score - a.score || a.surah - b.surah || a.ayah - b.ayah)
  return { total, hits: scored.slice(0, limit) }
}
