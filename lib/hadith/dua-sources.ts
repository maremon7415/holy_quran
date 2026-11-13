// Which duas cite a given hadith (data/content/duas.ts `source`), for "Related duas" on hadith pages.
import { duas } from '@/data/content/duas'
import { parseHadithSource } from './source'

let map: Map<string, string[]> | null = null
function build() {
  const m = new Map<string, string[]>()
  for (const d of duas) {
    for (const p of parseHadithSource(d.source)) {
      if (!p.hadith) continue
      const k = `${p.hadith.collection}:${p.hadith.number}`
      const a = m.get(k) ?? []
      if (!a.includes(d.slug)) a.push(d.slug)
      m.set(k, a)
    }
  }
  return m
}

/** Slugs of the duas whose source cites this hadith. */
export function duaSlugsForHadith(collection: string, number: number): string[] {
  return (map ??= build()).get(`${collection}:${number}`) ?? []
}
export const hadithsCitedByDuas = (): { collection: string; number: number }[] => [...(map ??= build()).keys()].map((k) => { const [c, n] = k.split(':'); return { collection: c, number: Number(n) } })
