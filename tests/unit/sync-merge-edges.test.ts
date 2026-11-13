import { describe, it, expect } from 'vitest'
import { computeStreaks, hashData, mergeHistory, mergeQuranStore, stableStringify, unionBy, unionPrimitives } from '@/lib/sync/merge'

describe('mergeHistory', () => {
  it('ignores malformed entries, takes the per-day maximum and sorts ascending', () => {
    const out = mergeHistory(
      [{ date: '2026-01-03', versesRead: 4 }, null, { versesRead: 9 }, { date: 5, versesRead: 1 }],
      [{ date: '2026-01-01', versesRead: 2 }, { date: '2026-01-03', versesRead: 7 }, { date: '2026-01-03', versesRead: 'x' }],
    )
    expect(out).toEqual([{ date: '2026-01-01', versesRead: 2 }, { date: '2026-01-03', versesRead: 7 }])
  })
  it('copes with non-array input', () => {
    expect(mergeHistory(undefined, null)).toEqual([])
    expect(mergeHistory('x', 5)).toEqual([])
  })
})

describe('computeStreaks edge cases', () => {
  const h = (...d: string[]) => d.map((date) => ({ date, versesRead: 1 }))
  it('counts consecutive days across month, year and leap-day boundaries', () => {
    expect(computeStreaks(h('2024-02-28', '2024-02-29', '2024-03-01'))).toEqual({ currentStreak: 3, longestStreak: 3, lastReadDate: '2024-03-01' })
    expect(computeStreaks(h('2025-12-31', '2026-01-01'))).toMatchObject({ currentStreak: 2, longestStreak: 2 })
    expect(computeStreaks(h('2025-02-28', '2025-03-01'))).toMatchObject({ currentStreak: 2 }) // non-leap year
  })
  it('skips days with no reading and invalid date strings', () => {
    const r = computeStreaks([{ date: '2026-01-01', versesRead: 3 }, { date: '2026-01-02', versesRead: 0 }, { date: '2026-01-03', versesRead: 2 }, { date: 'yesterday', versesRead: 9 }])
    expect(r).toEqual({ currentStreak: 1, longestStreak: 1, lastReadDate: '2026-01-03' })
  })
  it('keeps the longest run even when the current one is shorter and ignores duplicates / unsorted input', () => {
    const r = computeStreaks(h('2026-01-10', '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-02', '2026-01-04'))
    expect(r).toEqual({ currentStreak: 1, longestStreak: 4, lastReadDate: '2026-01-10' })
  })
})

describe('stableStringify / hashData', () => {
  it('is independent of key order and drops undefined values', () => {
    expect(stableStringify({ b: 1, a: [{ z: 1, y: undefined, x: 2 }] })).toBe('{"a":[{"x":2,"z":1}],"b":1}')
    expect(hashData({ a: 1, b: 2 })).toBe(hashData({ b: 2, a: 1 }))
  })
  it('changes with the data and treats arrays as ordered', () => {
    expect(hashData({ a: 1 })).not.toBe(hashData({ a: 2 }))
    expect(hashData([1, 2])).not.toBe(hashData([2, 1]))
    expect(hashData(undefined)).toBe(hashData(undefined))
  })
})

describe('union helpers', () => {
  it('unionBy keeps first-seen order and lets pick() choose on conflicts', () => {
    const out = unionBy([{ id: 'a', v: 1 }, { id: 'b', v: 1 }], [{ id: 'b', v: 2 }, { id: 'c', v: 3 }], (x) => x.id, (x, y) => (y.v > x.v ? y : x))
    expect(out).toEqual([{ id: 'a', v: 1 }, { id: 'b', v: 2 }, { id: 'c', v: 3 }])
  })
  it('unionPrimitives de-duplicates', () => {
    expect(unionPrimitives([1, 2, 2], [2, 3])).toEqual([1, 2, 3])
  })
})

describe('mergeQuranStore edge cases', () => {
  const T1 = '2026-01-01T00:00:00.000Z'
  const T2 = '2026-01-02T00:00:00.000Z'
  it('merges into an empty / partial other side without losing anything', () => {
    const a = { importantAyahs: [{ surahNumber: 1, ayahNumber: 1, tags: ['x'], createdAt: T1 }], favoriteSurahs: [18], bookmarkedDuas: ['d1'] }
    const m = mergeQuranStore(a, {}, T1, T2)
    expect(m.importantAyahs).toHaveLength(1)
    expect(m.favoriteSurahs).toEqual([18])
    expect(m.bookmarkedDuas).toEqual(['d1'])
    const m2 = mergeQuranStore({}, a, T2, T1)
    expect(m2.importantAyahs).toHaveLength(1)
  })
  it('keeps the older note when the newer bookmark has none (in either merge order)', () => {
    const old = { importantAyahs: [{ surahNumber: 2, ayahNumber: 255, tags: [], note: 'keep me', createdAt: T1 }] }
    const neu = { importantAyahs: [{ surahNumber: 2, ayahNumber: 255, tags: [], createdAt: T2 }] }
    expect(mergeQuranStore(old, neu, T1, T2).importantAyahs[0].note).toBe('keep me')
    expect(mergeQuranStore(neu, old, T2, T1).importantAyahs[0].note).toBe('keep me')
  })
  it('is idempotent: merging a store with itself changes nothing', () => {
    const s = { importantAyahs: [{ surahNumber: 1, ayahNumber: 1, tags: ['a'], createdAt: T1 }], favoriteSurahs: [1], readingStats: { readingHistory: [{ date: '2026-01-01', versesRead: 2 }] } }
    const m = mergeQuranStore(s, s, T1, T1)
    expect(hashData(m.importantAyahs)).toBe(hashData(s.importantAyahs))
    expect(m.favoriteSurahs).toEqual([1])
    expect(m.readingStats.readingHistory).toEqual(s.readingStats.readingHistory)
  })
})
