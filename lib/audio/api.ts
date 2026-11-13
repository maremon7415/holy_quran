/** Client-side data access for the audio feature (small in-memory caches, no server-only imports). */

export type WordSeg = [pos: number, from: number, to: number]
export interface AyahTiming {
  key: string
  n: number
  /** ms */ from: number
  /** ms */ to: number
  words: WordSeg[]
}
export interface ChapterAudio {
  url: string
  /** ms */ duration: number
  timings: AyahTiming[]
}

const chapterCache = new Map<string, Promise<ChapterAudio>>()

export function fetchChapterAudio(reciterId: number, surah: number): Promise<ChapterAudio> {
  const ck = `${reciterId}:${surah}`
  const hit = chapterCache.get(ck)
  if (hit) return hit
  const p = (async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let json: { audio_files?: { audio_url?: string; verse_timings?: any[]; duration?: number }[] } | null = null
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('offline')
      const res = await fetch(`https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${surah}&segments=true`)
      if (!res.ok) throw new Error(`audio ${res.status}`)
      json = await res.json()
    } catch (err) {
      // network unavailable: use the timings saved with the offline download
      json = (await (await import('@/lib/offline/audio-cache')).getOfflineChapterJson(reciterId, surah)) as typeof json
      if (!json) throw err
    }
    const f = json?.audio_files?.[0]
    if (!f?.audio_url || !Array.isArray(f.verse_timings) || !f.verse_timings.length) throw new Error('no audio')
    const timings: AyahTiming[] = f.verse_timings.map((v: { verse_key: string; timestamp_from: number; timestamp_to: number; segments?: unknown[] }) => {
      const words = ((v.segments ?? []) as unknown[])
        .filter((s): s is number[] => Array.isArray(s) && s.length >= 3 && s.every((x) => typeof x === 'number'))
        .map((s) => [s[0], s[1], s[2]] as WordSeg)
        .sort((a, b) => a[1] - b[1])
      return { key: v.verse_key, n: Number(v.verse_key.split(':')[1]), from: v.timestamp_from, to: v.timestamp_to, words }
    })
    return { url: String(f.audio_url), duration: Number(f.duration) || timings[timings.length - 1].to, timings }
  })()
  chapterCache.set(ck, p)
  p.catch(() => chapterCache.delete(ck))
  return p
}

/** Fire-and-forget warm-up of the next chapter's metadata. */
export const prefetchChapterAudio = (reciterId: number, surah: number) => {
  if (surah >= 1 && surah <= 114) fetchChapterAudio(reciterId, surah).catch(() => {})
}

export interface VerseText {
  key: string
  ar: string
  words: { pos: number; text: string; en?: string }[]
  en?: string
  bn?: string
}

const verseCache = new Map<string, Promise<VerseText>>()
const strip = (s?: string) => (s ?? '').replace(/<sup[^>]*>.*?<\/sup>/g, '').replace(/<[^>]+>/g, '').trim()

export function fetchVerseText(key: string): Promise<VerseText> {
  const hit = verseCache.get(key)
  if (hit) return hit
  const p = (async () => {
    const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${key}?words=true&word_fields=text_uthmani&translations=20,161&fields=text_uthmani`)
    if (!res.ok) throw new Error(`verse ${res.status}`)
    const { verse } = await res.json()
    const words = (verse.words ?? [])
      .filter((w: { char_type_name: string }) => w.char_type_name === 'word')
      .map((w: { position: number; text_uthmani: string; translation?: { text?: string } }) => ({ pos: w.position, text: w.text_uthmani, en: w.translation?.text }))
    const tr = (id: number) => strip(verse.translations?.find((t: { resource_id: number }) => t.resource_id === id)?.text)
    return { key, ar: verse.text_uthmani as string, words, en: tr(20), bn: tr(161) }
  })()
  verseCache.set(key, p)
  p.catch(() => verseCache.delete(key))
  if (verseCache.size > 200) verseCache.delete(verseCache.keys().next().value as string)
  return p
}
