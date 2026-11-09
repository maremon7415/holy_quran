import 'server-only'
import { getVersesByRefs, getChapters } from '@/lib/quran/data'
import { chapters } from '@/lib/quran/chapters'
import type { Verse } from '@/lib/quran/types'
import type { Dua, Topic } from '@/data/content/types'
import { duas } from '@/data/content/duas'

export type RVerse = Verse & { surah: number }

export const topicVerses = (t: Topic) => getVersesByRefs(t.refs)

export interface ResolvedDua extends Omit<Dua, 'ar' | 'tl' | 'meaning'> {
  ar: string
  tl: string
  meaning: { en: string; bn: string }
  /** For Quranic duas: the verses used (so pages can link to the reader) */
  verses?: RVerse[]
}

/** Quranic duas get Arabic / transliteration / translations from the corpus. */
export async function resolveDua(d: Dua): Promise<ResolvedDua> {
  if (d.refs?.length) {
    const vs = await getVersesByRefs(d.refs)
    return {
      ...d,
      ar: vs.map((v) => v.ar).join(' '),
      tl: vs.map((v) => v.tl).join(' '),
      meaning: { en: vs.map((v) => v.en).join(' '), bn: vs.map((v) => v.bn).join(' ') },
      verses: vs,
    }
  }
  return { ...d, ar: d.ar!, tl: d.tl!, meaning: d.meaning! }
}

export const resolveAllDuas = () => Promise.all(duas.map(resolveDua))

/** Human label for a Quran ref, e.g. "Al-Baqarah 2:255" */
export function refLabel(ref: string) {
  const m = ref.match(/^(\d+):(\d+)(?:-(\d+))?$/)
  if (!m) return ref
  const c = chapters[+m[1] - 1]
  return `${c.nameSimple} ${m[1]}:${m[2]}${m[3] ? `–${m[3]}` : ''}`
}
export { getChapters }
