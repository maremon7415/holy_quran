/**
 * Pure merge functions for cloud sync. No I/O, no clocks (timestamps are always passed in),
 * so they are trivially unit-testable. Nothing here touches zustand or the network.
 *
 * Strategy per store (see resolveStore for the three-way wrapper):
 *  - quran-store  : bookmarks/favourites/duas/readVerses = union; history = per-date max; progress = furthest;
 *                   stats recomputed from merged history; everything else = last-write-wins by store updatedAt
 *  - noor-hifz    : cards per ayah = latest review; log per day = max; milestones = union; prefs = LWW
 *  - noor-journey : khatam plans = union by id (per-plan furthest); activeId = LWW
 *  - others       : last-write-wins by store updatedAt (records are shallow-merged so new keys survive)
 */
import type { StoreSnap } from './types'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Obj = Record<string, any>
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)
const arr = (v: unknown): any[] => (Array.isArray(v) ? v : [])
const rec = (v: unknown): Obj => (isObj(v) ? v : {})
const ts = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Date.parse(String(v ?? ''))
  return Number.isFinite(n) ? n : 0
}
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d)

// ---------- hashing ----------
/** JSON.stringify with sorted keys so equal data always yields the same string. */
export function stableStringify(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(',')}]`
  if (isObj(v)) return `{${Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => `${JSON.stringify(k)}:${stableStringify(v[k])}`).join(',')}}`
  return JSON.stringify(v) ?? 'null'
}
/** Small non-cryptographic hash (cyrb53) of the stable JSON form. */
export function hashData(v: unknown): string {
  const s = stableStringify(v)
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 2654435761)
    h2 = Math.imul(h2 ^ c, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36) + s.length.toString(36)
}

// ---------- generic helpers ----------
/** Union by key; `pick(existing, incoming)` resolves duplicates (existing comes from the first list). */
export function unionBy<T>(a: T[], b: T[], key: (x: T) => string, pick: (x: T, y: T) => T): T[] {
  const m = new Map<string, T>()
  for (const x of a) m.set(key(x), x)
  for (const y of b) {
    const k = key(y)
    const x = m.get(k)
    m.set(k, x === undefined ? y : pick(x, y))
  }
  return [...m.values()]
}
export const unionPrimitives = <T extends string | number>(a: T[], b: T[]): T[] => [...new Set([...a, ...b])]

/** Merge two records key-by-key; `pick(a, b)` resolves keys present on both sides. */
export function mergeRecords<T>(a: Record<string, T>, b: Record<string, T>, pick: (x: T, y: T) => T): Record<string, T> {
  const out: Record<string, T> = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = k in out ? pick(out[k], v) : v
  return out
}

// ---------- quran-store ----------
export interface HistoryEntry { date: string; versesRead: number }

export function mergeHistory(a: unknown, b: unknown): HistoryEntry[] {
  const m = new Map<string, number>()
  for (const e of [...arr(a), ...arr(b)]) {
    if (!e || typeof e.date !== 'string') continue
    m.set(e.date, Math.max(m.get(e.date) ?? 0, num(e.versesRead)))
  }
  return [...m.entries()].map(([date, versesRead]) => ({ date, versesRead })).sort((x, y) => (x.date < y.date ? -1 : 1))
}

const DAY = 86_400_000
const dayNum = (d: string) => Math.round(Date.parse(`${d}T00:00:00Z`) / DAY)

/** Streaks derived from a (merged) per-day history. `currentStreak` is the run ending at the last day with reading. */
export function computeStreaks(history: HistoryEntry[]): { currentStreak: number; longestStreak: number; lastReadDate: string | null } {
  const days = [...new Set(history.filter((h) => h.versesRead > 0 && /^\d{4}-\d{2}-\d{2}$/.test(h.date)).map((h) => dayNum(h.date)))].sort((x, y) => x - y)
  if (!days.length) return { currentStreak: 0, longestStreak: 0, lastReadDate: null }
  let longest = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }
  return { currentStreak: run, longestStreak: longest, lastReadDate: new Date(days[days.length - 1] * DAY).toISOString().slice(0, 10) }
}

function mergeProgressEntry(a: Obj, b: Obj): Obj {
  const newer = ts(a.updatedAt) >= ts(b.updatedAt) ? a : b
  const older = newer === a ? b : a
  return {
    ...older,
    ...newer,
    // the resume point comes from the most recently touched entry…
    lastAyahRead: num(newer.lastAyahRead),
    // …but nothing that was read on either device is lost
    versesRead: Math.max(num(a.versesRead), num(b.versesRead)),
    totalAyahs: newer.totalAyahs ?? older.totalAyahs ?? null,
    completed: Boolean(a.completed || b.completed),
    completedAt: [a.completedAt, b.completedAt].filter(Boolean).sort()[0] ?? null,
  }
}

/** Same ayah bookmarked on both sides: newer store's note wins (falls back to the other's), tags are unioned. */
function mergeAyah(x: Obj, y: Obj, xNewer: boolean): Obj {
  const [n, o] = xNewer ? [x, y] : [y, x]
  const created = [x.createdAt, y.createdAt].filter(Boolean).sort((p, q) => ts(p) - ts(q))[0]
  return { ...o, ...n, tags: unionPrimitives<string>(arr(n.tags), arr(o.tags)), note: n.note || o.note || undefined, createdAt: created ?? n.createdAt }
}

export function mergeQuranStore(a: Obj, b: Obj, aUpdated: string, bUpdated: string): Obj {
  const aNewer = ts(aUpdated) >= ts(bUpdated)
  const [newer, older] = aNewer ? [a, b] : [b, a]

  const importantAyahs = unionBy(arr(a.importantAyahs), arr(b.importantAyahs), (x) => `${x.surahNumber}:${x.ayahNumber}`, (x, y) => mergeAyah(x, y, aNewer))
  const readVerses = unionBy(arr(a.readVerses), arr(b.readVerses), (x) => `${x.surahNumber}:${x.ayahNumber}`, (x, y) => (ts(x.timestamp) <= ts(y.timestamp) ? x : y))

  const readingProgress = mergeRecords<Obj>(rec(a.readingProgress), rec(b.readingProgress), mergeProgressEntry)
  // versesRead can never be lower than what the union of read ayahs proves
  const perSurah = new Map<number, number>()
  for (const v of readVerses) perSurah.set(v.surahNumber, (perSurah.get(v.surahNumber) ?? 0) + 1)
  for (const [s, n] of perSurah) if (readingProgress[s]) readingProgress[s] = { ...readingProgress[s], versesRead: Math.max(num(readingProgress[s].versesRead), n) }

  const sa = rec(a.readingStats)
  const sb = rec(b.readingStats)
  const readingHistory = mergeHistory(sa.readingHistory, sb.readingHistory)
  const streaks = computeStreaks(readingHistory)
  const completedCount = Object.values(readingProgress).filter((p) => p?.completed).length
  const readingStats = {
    ...rec(newer.readingStats),
    totalVersesRead: Math.max(num(sa.totalVersesRead), num(sb.totalVersesRead), readVerses.length, readingHistory.reduce((n, h) => n + h.versesRead, 0)),
    totalSurahsRead: Math.max(num(sa.totalSurahsRead), num(sb.totalSurahsRead), completedCount),
    currentStreak: streaks.currentStreak,
    longestStreak: Math.max(num(sa.longestStreak), num(sb.longestStreak), streaks.longestStreak),
    lastReadDate: streaks.lastReadDate ?? rec(newer.readingStats).lastReadDate ?? null,
    readingHistory,
  }

  const recentlyViewed = unionBy(arr(a.recentlyViewed), arr(b.recentlyViewed), (x) => String(x.surahNumber), (x, y) => (ts(x.timestamp) >= ts(y.timestamp) ? x : y))
    .sort((x, y) => ts(y.timestamp) - ts(x.timestamp))
    .slice(0, 10)
  const dhikrSessions = unionBy(arr(a.dhikrSessions), arr(b.dhikrSessions), (x) => x.date, (x, y) => (num(x.total) >= num(y.total) ? x : y)).sort((x, y) => (x.date < y.date ? -1 : 1))

  return {
    ...older,
    ...newer, // preferences (language, fonts, dailyGoal, quickAccessSurahs, prayerMethod…) = last write wins
    importantAyahs,
    favoriteSurahs: unionPrimitives<number>(arr(newer.favoriteSurahs), arr(older.favoriteSurahs)),
    bookmarkedDuas: unionPrimitives<string>(arr(newer.bookmarkedDuas), arr(older.bookmarkedDuas)),
    readVerses,
    readingProgress,
    readingStats,
    recentlyViewed,
    dhikrSessions,
  }
}

// ---------- hifz ----------
export function mergeHifz(a: Obj, b: Obj, aUpdated: string, bUpdated: string): Obj {
  const [newer, older] = ts(aUpdated) >= ts(bUpdated) ? [a, b] : [b, a]
  const cards = mergeRecords<Obj>(rec(a.cards), rec(b.cards), (x, y) => {
    const dx = num(x.last)
    const dy = num(y.last)
    if (dx !== dy) return dx > dy ? x : y
    return num(x.reps) >= num(y.reps) ? x : y
  })
  const log = mergeRecords<Obj>(rec(a.log), rec(b.log), (x, y) => ({ reviewed: Math.max(num(x.reviewed), num(y.reviewed)), learned: Math.max(num(x.learned), num(y.learned)) }))
  return { ...older, ...newer, cards, log, milestones: unionPrimitives<string>(arr(a.milestones), arr(b.milestones)) }
}

// ---------- journey (khatam) ----------
export function mergeJourney(a: Obj, b: Obj, aUpdated: string, bUpdated: string): Obj {
  const [newer, older] = ts(aUpdated) >= ts(bUpdated) ? [a, b] : [b, a]
  const khatams = unionBy(arr(a.khatams), arr(b.khatams), (k) => String(k.id), (x, y) => {
    const lead = num(x.donePage) > num(y.donePage) || (num(x.donePage) === num(y.donePage) && ts(x.createdAt) <= ts(y.createdAt)) ? x : y
    const other = lead === x ? y : x
    return {
      ...other,
      ...lead,
      log: mergeRecords<number>(rec(x.log), rec(y.log), (p, q) => Math.max(p, q)),
      days: Math.max(num(x.days), num(y.days)),
      archived: x.archived || y.archived ? true : undefined,
      finishedAt: [x.finishedAt, y.finishedAt].filter(Boolean).sort()[0] ?? null,
    }
  })
  const ids = new Set(khatams.map((k) => k.id))
  const activeId = [newer.activeId, older.activeId].find((id) => id && ids.has(id)) ?? null
  return { ...older, ...newer, khatams, activeId }
}

// ---------- generic prefs ----------
/** Last-write-wins; nested plain-object maps (e.g. dhikr progress) are merged one level so keys from the other side survive. */
export function mergePrefs(a: Obj, b: Obj, aUpdated: string, bUpdated: string): Obj {
  const [newer, older] = ts(aUpdated) >= ts(bUpdated) ? [a, b] : [b, a]
  const out: Obj = { ...older, ...newer }
  for (const k of Object.keys(out)) if (isObj(newer[k]) && isObj(older[k])) out[k] = { ...older[k], ...newer[k] }
  return out
}

export function mergeData(key: string, a: Obj, b: Obj, aUpdated: string, bUpdated: string): Obj {
  switch (key) {
    case 'quran-store': return mergeQuranStore(a, b, aUpdated, bUpdated)
    case 'noor-hifz': return mergeHifz(a, b, aUpdated, bUpdated)
    case 'noor-journey': return mergeJourney(a, b, aUpdated, bUpdated)
    default: return mergePrefs(a, b, aUpdated, bUpdated)
  }
}

// ---------- three-way resolution ----------
export interface Resolution {
  data: Obj
  updatedAt: string
  /** where the result came from */
  from: 'local' | 'remote' | 'merged'
  /** the cloud copy must be updated */
  push: boolean
  /** the local store must be updated */
  apply: boolean
}

/**
 * Decide what a store becomes, given the local copy, the remote copy and the hash of the data at the last
 * successful sync (`baseHash`). Taking the changed side wholesale (instead of always unioning) is what lets
 * deletions propagate; a real union only happens when BOTH sides changed, or on the very first sync.
 * `local.updatedAt === null` means "no edit history on this device" and is treated as oldest.
 */
export function resolveStore(
  key: string,
  local: { data: Obj; updatedAt: string | null } | undefined,
  remote: StoreSnap<Obj> | undefined,
  baseHash: string | undefined,
  nowIso: string,
): Resolution | null {
  if (!local && !remote) return null
  if (!remote) return { data: local!.data, updatedAt: local!.updatedAt ?? nowIso, from: 'local', push: true, apply: false }
  if (!local) return { data: remote.data, updatedAt: remote.updatedAt, from: 'remote', push: false, apply: true }

  const lh = hashData(local.data)
  const rh = hashData(remote.data)
  if (lh === rh) return { data: local.data, updatedAt: local.updatedAt ?? remote.updatedAt, from: 'local', push: false, apply: false }
  if (baseHash !== undefined && lh === baseHash) return { data: remote.data, updatedAt: remote.updatedAt, from: 'remote', push: false, apply: true }
  if (baseHash !== undefined && rh === baseHash) return { data: local.data, updatedAt: local.updatedAt ?? nowIso, from: 'local', push: true, apply: false }

  const lu = local.updatedAt ?? new Date(0).toISOString()
  const merged = mergeData(key, local.data, remote.data, lu, remote.updatedAt)
  const mh = hashData(merged)
  return {
    data: merged,
    updatedAt: ts(lu) > ts(remote.updatedAt) ? lu : remote.updatedAt,
    from: 'merged',
    push: mh !== rh,
    apply: mh !== lh,
  }
}
