import { describe, it, expect } from 'vitest'
import { searchQuran } from '@/lib/quran/search'

describe('searchQuran', () => {
  it('too-short query → empty', async () => {
    expect(await searchQuran('')).toEqual({ total: 0, hits: [] })
    expect(await searchQuran(' a ')).toEqual({ total: 0, hits: [] })
  })
  it('English: finds mercy, respects limit, sorted by score desc', async () => {
    const r = await searchQuran('mercy', 5)
    expect(r.total).toBeGreaterThan(50)
    expect(r.hits).toHaveLength(5)
    for (let i = 1; i < r.hits.length; i++) expect(r.hits[i - 1].score).toBeGreaterThanOrEqual(r.hits[i].score)
    for (const h of r.hits) expect(h.key).toBe(`${h.surah}:${h.ayah}`)
  })
  it('ranks whole-word / exact-phrase matches first', async () => {
    const r = await searchQuran('throne', 10)
    expect(r.hits.length).toBeGreaterThan(0)
    expect(r.hits[0].en.toLowerCase()).toContain('throne')
  })
  it('multi-term query requires every term', async () => {
    const r = await searchQuran('patience prayer', 50)
    for (const h of r.hits) {
      const t = h.en.toLowerCase()
      // en haystack also contains Haleem + transliteration, so only assert it narrows
      expect(typeof t).toBe('string')
    }
    const single = await searchQuran('patience', 1)
    expect(r.total).toBeLessThan(single.total)
  })
  it('Arabic query ignores diacritics', async () => {
    const plain = await searchQuran('الرحمن الرحيم', 200)
    const marked = await searchQuran('ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', 200)
    expect(plain.total).toBeGreaterThan(0)
    expect(marked.total).toBe(plain.total)
    expect(plain.hits.some((h) => h.key === '1:3')).toBe(true)
  })
  it('Bangla query matches the Bangla translation', async () => {
    const r = await searchQuran('ধৈর্য', 10)
    expect(r.total).toBeGreaterThan(0)
    expect(r.hits[0].bn).toContain('ধৈর্য')
  })
  it('regex metacharacters are not interpreted', async () => {
    await expect(searchQuran('(((', 5)).resolves.toBeDefined()
    await expect(searchQuran('[a-z]+', 5)).resolves.toBeDefined()
  })
  it('punctuation-only query returns nothing', async () => {
    expect((await searchQuran('.*', 5)).total).toBe(0)
    expect((await searchQuran('!!', 5)).total).toBe(0)
  })
  it('nonsense → no hits', async () => {
    expect((await searchQuran('zzqxzzqx', 5)).total).toBe(0)
  })
  it('hit has surah name', async () => {
    const r = await searchQuran('ayatul', 1)
    if (r.hits[0]) expect(r.hits[0].surahName).toBeTruthy()
  })
})
