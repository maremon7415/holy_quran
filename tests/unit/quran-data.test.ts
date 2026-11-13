import { describe, it, expect } from 'vitest'
import { parseRef, getVersesByRefs, getVerse, getVerses, getJuzVerses, getChapter } from '@/lib/quran/data'

describe('parseRef', () => {
  it.each([
    ['2:255', { surah: 2, from: 255, to: 255 }],
    [' 2:255 ', { surah: 2, from: 255, to: 255 }],
    ['2:255-257', { surah: 2, from: 255, to: 257 }],
    ['2 : 255 - 257', { surah: 2, from: 255, to: 257 }],
    ['2.255', { surah: 2, from: 255, to: 255 }],
    ['114:6', { surah: 114, from: 6, to: 6 }],
  ])('%j', (input, out) => expect(parseRef(input)).toEqual(out))
  it.each(['', 'abc', '0:1', '115:1', '2:0', '2:5-3', '2:', ':5', '2:5-', '1000:1', '2:255:1', '-1:2', '2:-3'])('rejects %j', (s) => {
    expect(parseRef(s)).toBeNull()
  })
})

describe('getVersesByRefs', () => {
  it('returns verses with surah attached, in ref order', async () => {
    const vs = await getVersesByRefs(['2:255', '94:5-6'])
    expect(vs.map((v) => v.k)).toEqual(['2:255', '94:5', '94:6'])
    expect(vs[0].surah).toBe(2)
  })
  it('skips malformed refs and clamps a range past the end of the surah', async () => {
    const vs = await getVersesByRefs(['nope', '112:3-99', '999:1'])
    expect(vs.map((v) => v.k)).toEqual(['112:3', '112:4'])
  })
  it('empty list → empty', async () => expect(await getVersesByRefs([])).toEqual([]))
  it('ayah past the end → empty', async () => expect(await getVersesByRefs(['112:5'])).toEqual([]))
})

describe('data accessors', () => {
  it('getVerse', async () => {
    const v = await getVerse(2, 255)
    expect(v?.k).toBe('2:255')
    expect(v?.en.toLowerCase()).toContain('no deity')
  })
  it('getVerse out of range → null', async () => expect(await getVerse(2, 287)).toBeNull())
  it('getVerses length matches chapter', async () => {
    expect(await getVerses(1)).toHaveLength(7)
  })
  it('getChapter', async () => expect((await getChapter(67))?.nameSimple).toBe('Al-Mulk'))
  it('getJuzVerses(30) starts at 78:1 and ends at 114:6', async () => {
    const vs = await getJuzVerses(30)
    expect(vs[0].k).toBe('78:1')
    expect(vs.at(-1)?.k).toBe('114:6')
  })
  it('getJuzVerses(0 / 31) → []', async () => {
    expect(await getJuzVerses(0)).toEqual([])
    expect(await getJuzVerses(31)).toEqual([])
  })
})
