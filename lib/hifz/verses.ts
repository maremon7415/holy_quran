'use client'
import { tokenize } from './words'

export interface HifzVerse {
  n: number
  ar: string
  en: string
  bn: string
  words: string[]
}

const cache = new Map<number, Promise<HifzVerse[]>>()

/** Verses of a surah (Uthmani words + translations), cached in memory for the session. */
export function loadSurah(surah: number): Promise<HifzVerse[]> {
  let p = cache.get(surah)
  if (!p) {
    p = fetch(`/api/hifz/verses/${surah}`)
      .then((r) => {
        if (!r.ok) throw new Error('failed')
        return r.json() as Promise<{ n: number; ar: string; en: string; bn: string }[]>
      })
      .then((vs) => vs.map((v) => ({ ...v, words: tokenize(v.ar) })))
    p.catch(() => cache.delete(surah))
    cache.set(surah, p)
  }
  return p
}
