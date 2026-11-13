import { describe, it, expect } from 'vitest'
import { hashData, mergeData, resolveStore } from '@/lib/sync/merge'
import { applyTombstones, collectionIds, diffClock, pruneClock, splitClock, withClock, TOMBSTONE_TTL_MS, type ItemClock } from '@/lib/sync/tombstones'

const T0 = '2026-01-01T00:00:00.000Z'
const T1 = '2026-01-02T00:00:00.000Z'
const T2 = '2026-01-03T00:00:00.000Z'
const T3 = '2026-01-04T00:00:00.000Z'
const clk = (del: Record<string, string> = {}, add: Record<string, string> = {}): ItemClock => ({ add, del })

describe('diffClock / pruneClock', () => {
  it('records removals and (re)additions; first observation is only a baseline', () => {
    expect(diffClock(undefined, ['favoriteSurahs/1'], undefined, T1)).toEqual({ add: {}, del: {} })
    const c = diffClock(['favoriteSurahs/1', 'favoriteSurahs/2'], ['favoriteSurahs/2', 'favoriteSurahs/3'], undefined, T1)
    expect(c).toEqual({ add: { 'favoriteSurahs/3': T1 }, del: { 'favoriteSurahs/1': T1 } })
    const back = diffClock(['favoriteSurahs/2', 'favoriteSurahs/3'], ['favoriteSurahs/1', 'favoriteSurahs/2', 'favoriteSurahs/3'], c, T2)
    expect(back.del).toEqual({})
    expect(back.add['favoriteSurahs/1']).toBe(T2)
  })
  it('prunes tombstones older than 90 days', () => {
    const now = Date.parse(T3)
    const old = new Date(now - TOMBSTONE_TTL_MS - 1).toISOString()
    expect(pruneClock(clk({ a: old, b: T2 }), now).del).toEqual({ b: T2 })
  })
  it('withClock omits an empty clock (payload hash unchanged for stores without deletions)', () => {
    expect(withClock({ x: 1 }, clk())).toEqual({ x: 1 })
    expect(splitClock(withClock({ x: 1 }, clk({ a: T1 })))).toEqual({ state: { x: 1 }, clock: clk({ a: T1 }) })
  })
})

/** Both devices changed since the last sync → resolveStore takes the union path. */
function bothChanged(key: string, local: object, remote: object, localAt = T2, remoteAt = T2) {
  const r = resolveStore(key, { data: local as any, updatedAt: localAt }, { updatedAt: remoteAt, data: remote as any }, 'some-older-base', T3)!
  expect(r.from).toBe('merged')
  return splitClock(r.data)
}

describe('deleted items do not resurrect when both sides changed', () => {
  it('bookmark (importantAyahs): A deletes 2:255 + pushes, B reads a verse → stays deleted', () => {
    const bm = { surahNumber: 2, ayahNumber: 255, tags: [], createdAt: T0 }
    const keep = { surahNumber: 1, ayahNumber: 1, tags: [], createdAt: T0 }
    const remoteA = withClock({ importantAyahs: [keep], readVerses: [] }, clk({ 'importantAyahs/2:255': T1 }))
    const localB = { importantAyahs: [keep, bm], readVerses: [{ surahNumber: 1, ayahNumber: 2, timestamp: T2 }] }
    const { state, clock } = bothChanged('quran-store', localB, remoteA)
    expect(state.importantAyahs.map((a: any) => `${a.surahNumber}:${a.ayahNumber}`)).toEqual(['1:1'])
    expect(state.readVerses).toHaveLength(1)
    expect(clock.del['importantAyahs/2:255']).toBe(T1) // tombstone travels on
  })
  it('favourite surah and bookmarked dua', () => {
    const remoteA = withClock({ favoriteSurahs: [1], bookmarkedDuas: [] }, clk({ 'favoriteSurahs/36': T1, 'bookmarkedDuas/d1': T1 }))
    const localB = { favoriteSurahs: [1, 36], bookmarkedDuas: ['d1'], dailyGoal: 5 }
    const { state } = bothChanged('quran-store', localB, remoteA)
    expect(state.favoriteSurahs).toEqual([1])
    expect(state.bookmarkedDuas).toEqual([])
  })
  it('hifz card (removeCard) — merge order does not matter', () => {
    const card = { key: '1:1', last: Date.parse(T0), reps: 1 }
    const remoteA = withClock({ cards: { '1:2': { key: '1:2', last: Date.parse(T0) } }, log: {} }, clk({ 'cards/1:1': T1 }))
    const localB = { cards: { '1:1': card, '1:2': { key: '1:2', last: Date.parse(T2) } }, log: { [T2.slice(0, 10)]: { reviewed: 1, learned: 0 } } }
    expect(Object.keys(bothChanged('noor-hifz', localB, remoteA).state.cards)).toEqual(['1:2'])
    expect(Object.keys(splitClock(mergeData('noor-hifz', remoteA, localB, T2, T2)).state.cards)).toEqual(['1:2'])
  })
  it('khatam plan (remove) — the active id is cleared when the active plan was deleted', () => {
    const k = { id: 'k1', donePage: 10, log: {}, createdAt: T0, days: 30 }
    const remoteA = withClock({ khatams: [], activeId: null }, clk({ 'khatams/k1': T1 }))
    const localB = { khatams: [{ ...k, donePage: 12 }], activeId: 'k1' }
    const { state } = bothChanged('noor-journey', localB, remoteA, T2, T1)
    expect(state.khatams).toEqual([])
    expect(state.activeId).toBeNull()
  })
  it('re-adding after the delete wins (add time newer than the tombstone)', () => {
    const remoteA = withClock({ favoriteSurahs: [] }, clk({ 'favoriteSurahs/36': T1 }))
    const localB = withClock({ favoriteSurahs: [36] }, clk({}, { 'favoriteSurahs/36': T2 }))
    const { state, clock } = bothChanged('quran-store', localB, remoteA)
    expect(state.favoriteSurahs).toEqual([36])
    expect(clock.del['favoriteSurahs/36']).toBeUndefined()
    // bookmark re-created later (newer createdAt) also wins
    const bm = { surahNumber: 2, ayahNumber: 255, tags: [], createdAt: T2 }
    const r = bothChanged('quran-store', { importantAyahs: [bm] }, withClock({ importantAyahs: [] }, clk({ 'importantAyahs/2:255': T1 })))
    expect(r.state.importantAyahs).toHaveLength(1)
  })
  it('a hifz card reviewed after it was deleted elsewhere survives (last-modified newer)', () => {
    const r = applyTombstones('noor-hifz', { cards: { '1:1': { last: Date.parse(T2) } } }, { cards: { '1:1': { last: Date.parse(T2) } } }, {}, clk(), clk({ 'cards/1:1': T1 }))
    expect(Object.keys(r.state.cards)).toEqual(['1:1'])
  })
  it('sign-out → sign-in (no merge base) still honours the tombstone', () => {
    const remoteA = withClock({ importantAyahs: [] }, clk({ 'importantAyahs/2:255': T1 }))
    const localB = { importantAyahs: [{ surahNumber: 2, ayahNumber: 255, tags: [], createdAt: T0 }] }
    const r = resolveStore('quran-store', { data: localB, updatedAt: T0 }, { updatedAt: T1, data: remoteA }, undefined, T3)!
    expect(splitClock(r.data).state.importantAyahs).toEqual([])
    expect(r.apply).toBe(true)
  })
  it('collectionIds covers only the tombstoned collections', () => {
    expect(collectionIds('noor-reader', { a: 1 })).toBeUndefined()
    expect(collectionIds('quran-store', { favoriteSurahs: [2, 1], importantAyahs: [{ surahNumber: 1, ayahNumber: 1 }], bookmarkedDuas: ['d'], readVerses: [{ surahNumber: 9, ayahNumber: 9 }] })).toEqual(
      ['bookmarkedDuas/d', 'favoriteSurahs/1', 'favoriteSurahs/2', 'importantAyahs/1:1'],
    )
  })
  it('merging without any clocks behaves exactly as before (plain union)', () => {
    const m = mergeData('quran-store', { favoriteSurahs: [1] }, { favoriteSurahs: [2] }, T1, T2)
    expect(m._clock).toBeUndefined()
    expect([...m.favoriteSurahs].sort()).toEqual([1, 2])
    expect(hashData(mergeData('noor-reader', { a: 1 }, { b: 2 }, T1, T2))).toBe(hashData({ a: 1, b: 2 }))
  })
})
