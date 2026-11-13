/**
 * Per-item add/delete clocks ("tombstones") for the synced collections. Pure — no I/O, clocks passed in.
 *
 * Why: when BOTH devices changed a store since the last sync, the merge unions the two copies. Without a record of
 * deletions, a bookmark removed on device A would come back from device B's copy. Each device therefore keeps, per
 * store, a clock: `del[id]` = when the item was removed, `add[id]` = when it (re)appeared. The clock travels inside the
 * synced payload under `_clock` and is merged with max(); an item survives the merge only if its last-modified time
 * (max of `add[id]` and the item's own timestamp, e.g. `createdAt` / a hifz card's last review) is newer than its
 * tombstone, so re-adding after a delete wins. Tombstones older than TOMBSTONE_TTL_MS are pruned.
 *
 * The engine produces the clock by diffing the collection ids it observed last time against the current ones, so every
 * way of removing an item (UI action, `reset()`, a restored backup…) is covered without touching the zustand stores.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Obj = Record<string, any>

export const CLOCK_KEY = '_clock'
export const TOMBSTONE_TTL_MS = 90 * 86_400_000

export interface ItemClock {
  /** id → ISO time the item (re)appeared on some device */
  add: Record<string, string>
  /** id → ISO time the item was removed on some device */
  del: Record<string, string>
}

interface Collection {
  /** field of the store state */
  field: string
  /** ids (prefixed with the field) of the live items + their intrinsic last-modified time (ms, 0 = unknown) */
  items(v: unknown): Map<string, number>
  /** drop the items whose id is in `drop` */
  remove(v: unknown, drop: Set<string>): unknown
}

const t = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Date.parse(String(v ?? ''))
  return Number.isFinite(n) ? n : 0
}
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)
const arr = (v: unknown): any[] => (Array.isArray(v) ? v : [])

function arrayCollection(field: string, id: (x: any) => string | null, time: (x: any) => number = () => 0): Collection {
  const full = (x: any) => {
    const i = id(x)
    return i === null ? null : `${field}/${i}`
  }
  return {
    field,
    items(v) {
      const m = new Map<string, number>()
      for (const x of arr(v)) {
        const k = full(x)
        if (k !== null) m.set(k, Math.max(m.get(k) ?? 0, time(x)))
      }
      return m
    },
    remove(v, drop) {
      return arr(v).filter((x) => {
        const k = full(x)
        return k === null || !drop.has(k)
      })
    },
  }
}

function recordCollection(field: string, time: (x: any) => number = () => 0): Collection {
  return {
    field,
    items(v) {
      const m = new Map<string, number>()
      if (isObj(v)) for (const [k, x] of Object.entries(v)) m.set(`${field}/${k}`, time(x))
      return m
    },
    remove(v, drop) {
      if (!isObj(v)) return v
      const out: Obj = {}
      for (const [k, x] of Object.entries(v)) if (!drop.has(`${field}/${k}`)) out[k] = x
      return out
    },
  }
}

const prim = (x: unknown) => (typeof x === 'string' || typeof x === 'number' ? String(x) : null)

/** The collections whose deletions must survive a merge. High-churn data (read verses, history…) only ever grows. */
export const COLLECTIONS: Record<string, Collection[]> = {
  'quran-store': [
    arrayCollection('importantAyahs', (x) => (x && x.surahNumber != null && x.ayahNumber != null ? `${x.surahNumber}:${x.ayahNumber}` : null), (x) => t(x?.createdAt)),
    arrayCollection('favoriteSurahs', prim),
    arrayCollection('bookmarkedDuas', prim),
  ],
  'noor-hifz': [recordCollection('cards', (c) => (isObj(c) ? t(c.last) : 0))],
  'noor-journey': [arrayCollection('khatams', (k) => (k && k.id != null ? String(k.id) : null), (k) => t(k?.createdAt))],
}

export const hasCollections = (key: string) => key in COLLECTIONS

/** All live item ids of a store's data, with their intrinsic times. */
export function collectionItems(key: string, data: Obj): Map<string, number> {
  const out = new Map<string, number>()
  for (const c of COLLECTIONS[key] ?? []) for (const [k, v] of c.items(data[c.field])) out.set(k, v)
  return out
}
export const collectionIds = (key: string, data: Obj): string[] | undefined => (hasCollections(key) ? [...collectionItems(key, data).keys()].sort() : undefined)

export const emptyClock = (): ItemClock => ({ add: {}, del: {} })
const isEmpty = (c: ItemClock | undefined) => !c || (!Object.keys(c.add).length && !Object.keys(c.del).length)

export function readClock(v: unknown): ItemClock {
  const c = isObj(v) ? v : {}
  const map = (x: unknown) => {
    const out: Record<string, string> = {}
    if (isObj(x)) for (const [k, s] of Object.entries(x)) if (typeof s === 'string' && t(s) > 0) out[k] = s
    return out
  }
  return { add: map(c.add), del: map(c.del) }
}

/**
 * Update a device's clock from what it observed: ids that disappeared since `prevIds` get a tombstone at `nowIso`,
 * ids that appeared get an add time. With no previous observation (`prevIds` undefined) nothing is recorded — the
 * current contents become the baseline (items that predate tracking keep their intrinsic time only).
 */
export function diffClock(prevIds: string[] | undefined, ids: string[] | undefined, clock: ItemClock | undefined, nowIso: string): ItemClock {
  const out: ItemClock = { add: { ...(clock?.add ?? {}) }, del: { ...(clock?.del ?? {}) } }
  if (!prevIds || !ids) return out
  const prev = new Set(prevIds)
  const cur = new Set(ids)
  for (const id of prev)
    if (!cur.has(id)) {
      out.del[id] = nowIso
      delete out.add[id]
    }
  for (const id of cur)
    if (!prev.has(id)) {
      out.add[id] = nowIso
      delete out.del[id]
    }
  return out
}

/** Drop tombstones older than the TTL (relative to `nowMs`). */
export function pruneClock(clock: ItemClock, nowMs: number, ttl = TOMBSTONE_TTL_MS): ItemClock {
  const del: Record<string, string> = {}
  for (const [k, v] of Object.entries(clock.del)) if (nowMs - t(v) <= ttl) del[k] = v
  return { add: clock.add, del }
}

/** Attach a clock to store data for the wire (omitted when empty, so stores without deletions hash as before). */
export function withClock(data: Obj, clock: ItemClock | undefined): Obj {
  const { [CLOCK_KEY]: _drop, ...rest } = data
  void _drop
  return isEmpty(clock) ? rest : { ...rest, [CLOCK_KEY]: { add: clock!.add, del: clock!.del } }
}
/** Split wire data into the store state and its clock. */
export function splitClock(data: Obj): { state: Obj; clock: ItemClock } {
  const { [CLOCK_KEY]: c, ...state } = data ?? {}
  return { state, clock: readClock(c) }
}

const newer = (a: string | undefined, b: string | undefined) => (t(a) >= t(b) ? a : b)
function maxMerge(a: Record<string, string>, b: Record<string, string>): Record<string, string> {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = newer(out[k], v)!
  return out
}

/**
 * Apply tombstones to a merged state. `a`/`b` are the two input states (their items' intrinsic times count as
 * last-modified). Returns the filtered state and the merged clock (tombstones of resurrected items and add-times of
 * deleted items are dropped).
 */
export function applyTombstones(key: string, merged: Obj, a: Obj, b: Obj, ca: ItemClock, cb: ItemClock): { state: Obj; clock: ItemClock } {
  const clock: ItemClock = { add: maxMerge(ca.add, cb.add), del: maxMerge(ca.del, cb.del) }
  if (!hasCollections(key)) return { state: merged, clock }
  const ia = collectionItems(key, a)
  const ib = collectionItems(key, b)
  const live = collectionItems(key, merged)
  const drop = new Set<string>()
  for (const id of live.keys()) {
    const del = t(clock.del[id])
    if (!del) continue
    const modified = Math.max(t(clock.add[id]), ia.get(id) ?? 0, ib.get(id) ?? 0, live.get(id) ?? 0)
    if (del > modified) drop.add(id)
    else delete clock.del[id] // re-added / modified after the delete: the item wins
  }
  for (const id of drop) delete clock.add[id]
  // add-times are only needed for live items
  for (const id of Object.keys(clock.add)) if (!live.has(id)) delete clock.add[id]
  if (!drop.size) return { state: merged, clock }
  const state: Obj = { ...merged }
  for (const c of COLLECTIONS[key]) if (c.field in state) state[c.field] = c.remove(state[c.field], drop)
  return { state, clock }
}
