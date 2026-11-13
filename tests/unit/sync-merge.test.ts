import { describe, it, expect } from 'vitest'
import { computeStreaks, hashData, mergeHifz, mergeJourney, mergeQuranStore, resolveStore } from '@/lib/sync/merge'

const T1 = '2026-01-01T00:00:00.000Z'
const T2 = '2026-01-02T00:00:00.000Z'

describe('mergeQuranStore', () => {
  const a = {
    language: 'en',
    importantAyahs: [{ surahNumber: 2, ayahNumber: 255, tags: ['a'], note: 'old', createdAt: T1 }, { surahNumber: 1, ayahNumber: 1, tags: [], createdAt: T1 }],
    favoriteSurahs: [1, 36],
    bookmarkedDuas: ['d1'],
    readVerses: [{ surahNumber: 1, ayahNumber: 1, timestamp: T2 }],
    readingProgress: { 1: { lastAyahRead: 3, versesRead: 3, totalAyahs: 7, completed: false, completedAt: null, updatedAt: T1 } },
    readingStats: { totalVersesRead: 5, totalSurahsRead: 0, currentStreak: 2, longestStreak: 2, lastReadDate: '2026-01-02', readingHistory: [{ date: '2026-01-01', versesRead: 3 }, { date: '2026-01-02', versesRead: 2 }] },
  }
  const b = {
    language: 'bn',
    importantAyahs: [{ surahNumber: 2, ayahNumber: 255, tags: ['b'], note: 'new', createdAt: T2 }, { surahNumber: 3, ayahNumber: 1, tags: [], createdAt: T2 }],
    favoriteSurahs: [36, 2],
    bookmarkedDuas: ['d2'],
    readVerses: [{ surahNumber: 1, ayahNumber: 1, timestamp: T1 }, { surahNumber: 1, ayahNumber: 2, timestamp: T2 }],
    readingProgress: { 1: { lastAyahRead: 7, versesRead: 7, totalAyahs: 7, completed: true, completedAt: T2, updatedAt: T2 }, 2: { lastAyahRead: 10, versesRead: 10, totalAyahs: 286, completed: false, completedAt: null, updatedAt: T2 } },
    readingStats: { totalVersesRead: 9, totalSurahsRead: 1, currentStreak: 1, longestStreak: 1, lastReadDate: '2026-01-03', readingHistory: [{ date: '2026-01-02', versesRead: 6 }, { date: '2026-01-03', versesRead: 3 }] },
  }
  const m = mergeQuranStore(a, b, T1, T2)

  it('unions bookmarks, keeping newest note and unioning tags', () => {
    expect(m.importantAyahs).toHaveLength(3)
    const x = m.importantAyahs.find((i: any) => i.surahNumber === 2)
    expect(x.note).toBe('new')
    expect(x.tags.sort()).toEqual(['a', 'b'])
    expect(x.createdAt).toBe(T1)
  })
  it('unions favourites and duas', () => {
    expect([...m.favoriteSurahs].sort()).toEqual([1, 2, 36])
    expect([...m.bookmarkedDuas].sort()).toEqual(['d1', 'd2'])
  })
  it('history takes per-date max; streak recomputed', () => {
    expect(m.readingStats.readingHistory).toEqual([{ date: '2026-01-01', versesRead: 3 }, { date: '2026-01-02', versesRead: 6 }, { date: '2026-01-03', versesRead: 3 }])
    expect(m.readingStats.currentStreak).toBe(3)
    expect(m.readingStats.lastReadDate).toBe('2026-01-03')
  })
  it('progress takes the furthest, union of read verses', () => {
    expect(m.readingProgress[1].versesRead).toBe(7)
    expect(m.readingProgress[1].completed).toBe(true)
    expect(m.readingProgress[2].lastAyahRead).toBe(10)
    expect(m.readVerses).toHaveLength(2)
  })
  it('prefs are last-write-wins by store updatedAt', () => {
    expect(m.language).toBe('bn')
    expect(mergeQuranStore(a, b, T2, T1).language).toBe('en')
  })
  it('is commutative on collections', () => {
    const m2 = mergeQuranStore(b, a, T2, T1)
    expect(hashData(m2.readingStats)).toBe(hashData(m.readingStats))
    expect(hashData(m2.readingProgress)).toBe(hashData(m.readingProgress))
    expect(m2.importantAyahs.map((i: any) => `${i.surahNumber}:${i.ayahNumber}:${i.note}`).sort()).toEqual(m.importantAyahs.map((i: any) => `${i.surahNumber}:${i.ayahNumber}:${i.note}`).sort())
  })
})

describe('computeStreaks', () => {
  it('handles gaps and empties', () => {
    expect(computeStreaks([])).toEqual({ currentStreak: 0, longestStreak: 0, lastReadDate: null })
    const r = computeStreaks([{ date: '2026-01-01', versesRead: 1 }, { date: '2026-01-02', versesRead: 1 }, { date: '2026-01-03', versesRead: 1 }, { date: '2026-01-10', versesRead: 1 }])
    expect(r).toEqual({ currentStreak: 1, longestStreak: 3, lastReadDate: '2026-01-10' })
  })
})

describe('mergeHifz / mergeJourney', () => {
  it('keeps the card with the latest review', () => {
    const m = mergeHifz({ cards: { '1:1': { key: '1:1', last: 5, reps: 1 }, '1:2': { key: '1:2', last: 1, reps: 1 } }, log: { d: { reviewed: 1, learned: 2 } }, milestones: ['a'] }, { cards: { '1:1': { key: '1:1', last: 9, reps: 2 } }, log: { d: { reviewed: 4, learned: 0 } }, milestones: ['b'] }, T1, T2)
    expect(m.cards['1:1'].last).toBe(9)
    expect(m.cards['1:2']).toBeTruthy()
    expect(m.log.d).toEqual({ reviewed: 4, learned: 2 })
    expect(m.milestones.sort()).toEqual(['a', 'b'])
  })
  it('unions khatam plans by id', () => {
    const m = mergeJourney({ khatams: [{ id: 'x', donePage: 10, log: { d1: 10 }, days: 30 }], activeId: 'x' }, { khatams: [{ id: 'x', donePage: 20, log: { d2: 20 }, days: 30 }, { id: 'y', donePage: 1, log: {} }], activeId: 'y' }, T1, T2)
    expect(m.khatams).toHaveLength(2)
    expect(m.khatams.find((k: any) => k.id === 'x').donePage).toBe(20)
    expect(m.khatams.find((k: any) => k.id === 'x').log).toEqual({ d1: 10, d2: 20 })
    expect(m.activeId).toBe('y')
  })
})

describe('resolveStore (three-way)', () => {
  const local = { data: { favoriteSurahs: [1] }, updatedAt: T1 }
  const remote = { updatedAt: T2, data: { favoriteSurahs: [1, 2] } }
  it('adopts remote when only remote changed (so deletions propagate)', () => {
    const r = resolveStore('quran-store', local, remote, hashData(local.data), T2)!
    expect(r.from).toBe('remote'); expect(r.apply).toBe(true); expect(r.push).toBe(false)
  })
  it('pushes local when only local changed', () => {
    const r = resolveStore('quran-store', local, remote, hashData(remote.data), T2)!
    expect(r.from).toBe('local'); expect(r.push).toBe(true)
  })
  it('merges on first sync without losing either side', () => {
    const r = resolveStore('quran-store', local, remote, undefined, T2)!
    expect(r.from).toBe('merged'); expect(r.data.favoriteSurahs.sort()).toEqual([1, 2])
  })
  it('pushes when remote missing and adopts when local missing', () => {
    expect(resolveStore('noor-hifz', local, undefined, undefined, T2)!.push).toBe(true)
    expect(resolveStore('noor-hifz', undefined, remote, undefined, T2)!.apply).toBe(true)
  })
})
