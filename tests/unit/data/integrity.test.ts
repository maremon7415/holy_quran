import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { chapters } from '@/lib/quran/chapters'
import { topics, topicCategories } from '@/data/content/topics'
import { duas } from '@/data/content/duas'
import { asmaUlHusna } from '@/data/content/asma-ul-husna'
import { parseRef } from '@/lib/quran/data'

const ROOT = path.resolve(__dirname, '../../../data/quran')
const json = <T,>(rel: string) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')) as T
interface V { n: number; k: string; ar: string; sim: string; en: string; enH: string; bn: string; tl: string; j: number; p: number; h: number; r: number; s: number }

const surahs: V[][] = Array.from({ length: 114 }, (_, i) => json<V[]>(`surah/${i + 1}.json`))
const juzs = json<{ juz: number; map: Record<string, string>; count: number }[]>('juzs.json')
const chaptersFull = json<{ id: number; versesCount: number; slug: string; nameSimple: string }[]>('chapters.json')

/** ayah range check against the real corpus */
function refOk(ref: string): string | null {
  const m = String(ref).trim().match(/^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/)
  if (!m) return `malformed ref "${ref}"`
  const s = +m[1], a = +m[2], b = m[3] ? +m[3] : a
  if (s < 1 || s > 114) return `surah out of range "${ref}"`
  if (a < 1 || b < a || b > surahs[s - 1].length) return `ayah out of range "${ref}" (surah ${s} has ${surahs[s - 1].length})`
  return null
}

describe('Quran corpus', () => {
  it('114 chapters / 6,236 verses', () => {
    expect(chaptersFull).toHaveLength(114)
    expect(surahs.reduce((a, s) => a + s.length, 0)).toBe(6236)
  })
  it('each surah file length == versesCount (chapters.json and chapters-lite.json agree)', () => {
    for (let i = 0; i < 114; i++) {
      expect(surahs[i].length, `surah ${i + 1}`).toBe(chaptersFull[i].versesCount)
      expect(chapters[i].versesCount).toBe(chaptersFull[i].versesCount)
      expect(chapters[i].slug).toBe(chaptersFull[i].slug)
    }
  })
  it('verses are sequential, keyed correctly, and have all text fields', () => {
    const bad: string[] = []
    surahs.forEach((vs, i) =>
      vs.forEach((v, j) => {
        if (v.n !== j + 1 || v.k !== `${i + 1}:${j + 1}`) bad.push(`${i + 1}:${j + 1} key/num`)
        if (!v.ar?.trim() || !v.sim?.trim() || !v.en?.trim() || !v.bn?.trim() || !v.tl?.trim()) bad.push(`${v.k} missing text`)
        if (!(v.j >= 1 && v.j <= 30) || !(v.p >= 1 && v.p <= 604)) bad.push(`${v.k} juz/page`)
      })
    )
    expect(bad.slice(0, 10)).toEqual([])
  })
  it('juz and page numbers never decrease through the book', () => {
    let j = 0, p = 0
    for (const vs of surahs) for (const v of vs) { expect(v.j).toBeGreaterThanOrEqual(j); expect(v.p).toBeGreaterThanOrEqual(p); j = v.j; p = v.p }
    expect(j).toBe(30); expect(p).toBe(604)
  })
  it('first/last landmark ayahs', () => {
    expect(surahs[0][0].ar).toContain('بِسْمِ')
    expect(surahs[113].at(-1)?.k).toBe('114:6')
  })
})

describe('Juz map', () => {
  it('30 juz and every verse covered exactly once', () => {
    expect(juzs).toHaveLength(30)
    const seen = new Map<string, number>()
    for (const j of juzs) {
      let n = 0
      for (const [s, range] of Object.entries(j.map)) {
        const [a, b] = range.split('-').map(Number)
        for (let x = a; x <= b; x++) { seen.set(`${s}:${x}`, (seen.get(`${s}:${x}`) ?? 0) + 1); n++ }
      }
      expect(n, `juz ${j.juz} count`).toBe(j.count)
    }
    expect(seen.size).toBe(6236)
    const dup = [...seen.entries()].filter(([, c]) => c !== 1)
    expect(dup).toEqual([])
    for (const vs of surahs) for (const v of vs) expect(seen.has(v.k), v.k).toBe(true)
  })
  it('juz in the map agrees with the verse `j` field', () => {
    for (const jz of juzs) for (const [s, range] of Object.entries(jz.map)) {
      const [a, b] = range.split('-').map(Number)
      for (let x = a; x <= b; x++) expect(surahs[+s - 1][x - 1].j, `${s}:${x}`).toBe(jz.juz)
    }
  })
})

describe('Topics', () => {
  it('slugs unique, valid category, 5-10 valid refs', () => {
    expect(new Set(topics.map((t) => t.slug)).size).toBe(topics.length)
    for (const t of topics) {
      expect(topicCategories.some((c) => c.id === t.cat), `${t.slug} cat`).toBe(true)
      expect(t.refs.length, `${t.slug} refs`).toBeGreaterThanOrEqual(5)
      expect(t.refs.length, `${t.slug} refs`).toBeLessThanOrEqual(10)
      for (const r of t.refs) expect(refOk(r), `${t.slug}: ${r}`).toBeNull()
      expect(t.en && t.bn && t.introEn && t.introBn).toBeTruthy()
    }
  })
  it('related topics and duas resolve', () => {
    const ts = new Set(topics.map((t) => t.slug)), ds = new Set(duas.map((d) => d.slug))
    for (const t of topics) {
      for (const r of t.related) expect(ts.has(r), `${t.slug} → related ${r}`).toBe(true)
      for (const d of t.duas) expect(ds.has(d), `${t.slug} → dua ${d}`).toBe(true)
      expect(t.related).not.toContain(t.slug)
    }
  })
  it('slugs are url-safe', () => { for (const t of topics) expect(t.slug).toMatch(/^[a-z0-9-]+$/) })
})

describe('Duas', () => {
  it('slugs unique + url-safe', () => {
    expect(new Set(duas.map((d) => d.slug)).size).toBe(duas.length)
    for (const d of duas) expect(d.slug).toMatch(/^[a-z0-9-]+$/)
  })
  it('refs valid; hadith duas have ar+tl+meaning; source present; no Latin inside Arabic', () => {
    for (const d of duas) {
      if (d.refs) for (const r of d.refs) expect(refOk(r), `${d.slug}: ${r}`).toBeNull()
      else { expect(d.ar, d.slug).toBeTruthy(); expect(d.tl, d.slug).toBeTruthy(); expect(d.meaning, d.slug).toBeTruthy() }
      expect(d.source, d.slug).toBeTruthy()
      if (d.ar) expect(/[a-zA-Z]/.test(d.ar), `${d.slug} latin in arabic`).toBe(false)
      expect(d.title.en && d.title.bn).toBeTruthy()
    }
  })
  it('related duas resolve', () => {
    const ds = new Set(duas.map((d) => d.slug))
    for (const d of duas) for (const r of d.related ?? []) expect(ds.has(r), `${d.slug} → ${r}`).toBe(true)
  })
})

describe('99 Names of Allah', () => {
  it('exactly 99, numbered 1..99, unique slugs', () => {
    expect(asmaUlHusna).toHaveLength(99)
    expect(asmaUlHusna.map((n) => n.n)).toEqual(Array.from({ length: 99 }, (_, i) => i + 1))
    expect(new Set(asmaUlHusna.map((n) => n.slug)).size).toBe(99)
  })
  it('refs valid and parseable', () => {
    for (const n of asmaUlHusna) {
      expect(refOk(n.ref), `${n.slug} ${n.ref}`).toBeNull()
      expect(parseRef(n.ref), n.slug).not.toBeNull()
      expect(n.ar).toMatch(/[؀-ۿ]/)
      expect(n.tl && n.tlBn && n.en && n.bn && n.expEn && n.expBn, n.slug).toBeTruthy()
    }
  })
})
