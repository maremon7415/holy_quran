import 'server-only'
import fs from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import type { Chapter, JuzInfo, Verse } from './types'

const ROOT = path.join(process.cwd(), 'data', 'quran')
const readJson = async <T,>(rel: string): Promise<T> => JSON.parse(await fs.readFile(path.join(ROOT, rel), 'utf8')) as T

export const getChapters = cache(() => readJson<Chapter[]>('chapters.json'))
export const getChapter = cache(async (id: number) => (await getChapters())[id - 1] ?? null)
export const getVerses = cache((id: number) => readJson<Verse[]>(`surah/${id}.json`))
export const getVerse = cache(async (surah: number, ayah: number) => (await getVerses(surah))[ayah - 1] ?? null)
export const getChapterInfo = cache((id: number) => readJson<{ en: string | null; bn: string | null }>(`info/${id}.json`))
export const getJuzs = cache(() => readJson<JuzInfo[]>('juzs.json'))

/** Parse "2:255", "2:255-257" style refs */
export function parseRef(ref: string): { surah: number; from: number; to: number } | null {
  const m = ref.trim().match(/^(\d{1,3})\s*[:.\s]\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?$/)
  if (!m) return null
  const surah = +m[1], from = +m[2], to = m[3] ? +m[3] : from
  if (surah < 1 || surah > 114 || from < 1 || to < from) return null
  return { surah, from, to }
}

/** Fetch verses for a list of refs like ["2:255", "94:5-6"] */
export async function getVersesByRefs(refs: string[]) {
  const out: (Verse & { surah: number })[] = []
  for (const r of refs) {
    const p = parseRef(r)
    if (!p) continue
    const vs = await getVerses(p.surah)
    for (let a = p.from; a <= Math.min(p.to, vs.length); a++) out.push({ ...vs[a - 1], surah: p.surah })
  }
  return out
}

/** All verses of a juz */
export async function getJuzVerses(juz: number) {
  const j = (await getJuzs()).find((x) => x.juz === juz)
  if (!j) return []
  const refs = Object.entries(j.map).map(([s, range]) => `${s}:${range}`)
  return getVersesByRefs(refs)
}
