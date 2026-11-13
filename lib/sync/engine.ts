'use client'
/**
 * Client sync engine. Singleton, browser only.
 *  - track(): watches the synced zustand stores for edits (works signed-out too, so edit times are known)
 *  - start(user): pull → merge → push, then keeps syncing (debounced on change, on focus/online, every 5 min)
 *  - stop(): detach (local data is never touched)
 *
 * Deletions: observe() diffs each store's collection ids (bookmarks, favourites, duas, hifz cards, khatams) against the
 * previous observation and records tombstones in the per-device meta; they travel with the payload as `_clock`
 * (see tombstones.ts) so a union merge can't bring deleted items back.
 *
 * Cloud deletion: the server keeps an `epoch` that "Delete my cloud data" bumps. A device that last synced under an
 * older epoch pauses with a notice instead of re-uploading its copy.
 */
import { hashData, resolveStore } from './merge'
import { readMeta, writeMeta, resetBase, deviceName, type StoreMeta, type SyncMeta } from './meta'
import { SYNCED_STORES, pickData, withoutExcluded } from './registry'
import { useSyncState, type AccountUser } from './state'
import { collectionIds, diffClock, hasCollections, pruneClock, splitClock, withClock } from './tombstones'
import type { StoreSnap, SyncDoc } from './types'

const DEBOUNCE_MS = 2500
const POLL_MS = 5 * 60_000
const STALE_MS = 30_000

let meta: SyncMeta | null = null
let tracking = false
let user: AccountUser | null = null
let applying = false
let inflight: Promise<void> | null = null
let rerun = false
let debounce: ReturnType<typeof setTimeout> | undefined
let retry: ReturnType<typeof setTimeout> | undefined
let retryDelay = 15_000
let unsubs: (() => void)[] = []
let teardown: (() => void) | null = null

const ui = () => useSyncState.getState()
const getMeta = () => (meta ??= readMeta())
const save = () => meta && writeMeta(meta)
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

/** The server kept changing under us (409 four times in a row); retried later. */
class ConflictError extends Error {}

class HttpError extends Error {
  constructor(public status: number, public body?: unknown) {
    super(`HTTP ${status}`)
  }
}

/** Older servers don't send epoch/resetAt. */
function normalize(d: SyncDoc): SyncDoc {
  return { ...d, stores: d.stores ?? {}, devices: d.devices ?? [], epoch: typeof d.epoch === 'number' ? d.epoch : 0, resetAt: d.resetAt ?? null }
}

async function api(method: 'GET' | 'PUT' | 'DELETE', body?: unknown): Promise<SyncDoc> {
  const res = await fetch('/api/sync', {
    method,
    cache: 'no-store',
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new HttpError(res.status, json)
  return normalize(json as SyncDoc)
}

/** What this device sends / compares for a store: its data plus its item clock (tombstones). */
function localPayload(entry: (typeof SYNCED_STORES)[number], st: StoreMeta | undefined): Record<string, unknown> {
  return withClock(pickData(entry), st?.clock)
}

// ---------- local edit tracking ----------
/**
 * Compare each store with the last observed hash; bump updatedAt (and record deletions) for the ones that changed.
 * `baseline`: the first observation of a page load. A store that changed while no engine was watching (e.g. a backup
 * restored through Settings, which then reloads) is recorded as edited, but its missing items are NOT tombstoned —
 * a restore keeps the old "merge, don't delete" behaviour for concurrent changes.
 */
function observe(baseline = false): boolean {
  const m = getMeta()
  let changed = false
  const now = new Date()
  const iso = now.toISOString()
  for (const s of SYNCED_STORES) {
    const data = pickData(s)
    const h = hashData(data)
    const ids = collectionIds(s.key, data)
    const e = m.stores[s.key]
    if (!e) {
      m.stores[s.key] = ids ? { hash: h, updatedAt: null, ids } : { hash: h, updatedAt: null }
      continue
    }
    if (e.hash !== h) {
      const next: StoreMeta = { ...e, hash: h, updatedAt: iso }
      if (ids) {
        next.clock = diffClock(baseline ? undefined : e.ids, ids, e.clock, iso)
        next.ids = ids
      }
      m.stores[s.key] = next
      changed = true
    } else if (ids && !e.ids) {
      e.ids = ids // first observation since tombstones exist: baseline
    }
    const cur = m.stores[s.key]
    if (cur.clock) cur.clock = pruneClock(cur.clock, now.getTime())
  }
  save()
  return changed
}

function onLocalChange() {
  if (applying) return
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    const changed = observe()
    if (changed && user && !getMeta().paused) void sync('change')
  }, DEBOUNCE_MS)
}

/** Start watching local stores (idempotent). Safe to call while signed out. */
export function track() {
  if (tracking || typeof window === 'undefined') return
  tracking = true
  ui().patch({ deviceId: getMeta().deviceId })
  observe(true)
  unsubs = SYNCED_STORES.map((s) => s.store.subscribe(onLocalChange))
}

// ---------- sync ----------
function describe(e: unknown): { offline: boolean; message: string } {
  if (e instanceof HttpError) {
    const code = (e.body as { error?: string } | null)?.error
    if (e.status === 413) return { offline: false, message: 'Your data is too large to sync (limit 2 MB).' }
    if (e.status === 503) return { offline: false, message: 'Accounts are not enabled on this deployment.' }
    return { offline: false, message: code ? `Sync failed (${code}).` : `Sync failed (${e.status}).` }
  }
  if (e instanceof ConflictError) return { offline: false, message: e.message }
  return { offline: true, message: 'Could not reach the server. You may be offline.' }
}

/**
 * The cloud copy was deleted on another device since this device last synced (its epoch moved on). Forget the merge
 * base and pause instead of uploading this device's data again; the user can turn sync back on to upload it.
 */
function remoteWasReset(remote: SyncDoc): boolean {
  const m = getMeta()
  const known = typeof m.epoch === 'number' ? m.epoch : m.version > 0 ? 0 : undefined
  if (known === undefined || remote.epoch <= known) return false
  meta = resetBase(m)
  if (user) meta.userId = user.id
  meta.epoch = remote.epoch
  meta.paused = true
  meta.pauseReason = 'remote-reset'
  save()
  clearTimeout(retry)
  ui().patch({ status: 'paused', pauseReason: 'remote-reset', devices: remote.devices, lastSyncedAt: null, error: null })
  return true
}

async function runSync(): Promise<void> {
  const m = getMeta()
  if (!user) return
  const prevUser = m.userId ?? m.lastUserId
  if (prevUser && prevUser !== user.id) {
    // a different account signed in on this device: forget the old merge base and the old account's tombstones
    meta = resetBase(m)
    for (const st of Object.values(meta.stores)) delete st.clock
  }
  delete getMeta().lastUserId
  getMeta().userId = user.id
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    ui().patch({ status: 'offline', error: null })
    return
  }
  ui().patch({ status: 'syncing', error: null })
  observe()

  let remote = await api('GET')
  if (remoteWasReset(remote)) return
  for (let attempt = 0; attempt < 4; attempt++) {
    const mm = getMeta()
    if (mm.paused) return // e.g. "Delete my cloud data" ran while this sync was in flight
    const now = new Date().toISOString()
    const resolutions: { key: string; res: NonNullable<ReturnType<typeof resolveStore>>; entry: (typeof SYNCED_STORES)[number]; localHash: string }[] = []
    for (const entry of SYNCED_STORES) {
      const st = mm.stores[entry.key]
      const local = { data: localPayload(entry, st), updatedAt: st?.updatedAt ?? null }
      const rs = remote.stores[entry.key] as StoreSnap<Record<string, unknown>> | undefined
      const remoteSnap = rs && isObj(rs.data) ? { updatedAt: rs.updatedAt, data: withoutExcluded(entry, rs.data) } : undefined
      let res
      try {
        res = resolveStore(entry.key, local, remoteSnap, st?.syncedHash, now)
      } catch (e) {
        console.error('[sync] merge failed for', entry.key, e)
        continue // never block the other stores on one bad payload
      }
      if (res) resolutions.push({ key: entry.key, res, entry, localHash: '' })
    }

    // apply remote/merged results locally (and adopt their clock, so the apply is not mistaken for local edits)
    applying = true
    try {
      for (const r of resolutions) {
        if (r.res.apply) {
          const { state, clock } = splitClock(r.res.data)
          r.entry.store.setState(withoutExcluded(r.entry, state))
          const data = pickData(r.entry)
          const prev = mm.stores[r.key] ?? { hash: '', updatedAt: null }
          const next: StoreMeta = { ...prev, hash: hashData(data) }
          if (hasCollections(r.key)) {
            next.ids = collectionIds(r.key, data)
            next.clock = clock
          }
          mm.stores[r.key] = next
        }
        r.localHash = hashData(pickData(r.entry))
      }
    } finally {
      applying = false
    }
    save()

    const toPush = resolutions.filter((r) => r.res.push)
    let version = remote.version
    let epoch = remote.epoch
    let devices = remote.devices
    if (toPush.length) {
      if (getMeta().paused) return
      const stores: Record<string, StoreSnap> = {}
      for (const r of toPush) stores[r.key] = { updatedAt: r.res.updatedAt, data: r.res.data }
      try {
        const doc = await api('PUT', { version: remote.version, epoch: remote.epoch, stores, device: { id: mm.deviceId, name: deviceName() } })
        version = doc.version
        epoch = doc.epoch
        devices = doc.devices
      } catch (e) {
        if (e instanceof HttpError && e.status === 409 && (e.body as { current?: SyncDoc })?.current) {
          remote = normalize((e.body as { current: SyncDoc }).current) // someone synced in between: re-merge against the newer copy
          if (remoteWasReset(remote)) return
          continue
        }
        throw e
      }
    }

    // success: record the agreed state as the new merge base
    const fin = getMeta()
    for (const { key, res, entry, localHash } of resolutions) {
      const prev = fin.stores[key] ?? { hash: localHash, updatedAt: null }
      const syncedHash = hashData(res.data)
      if (hashData(pickData(entry)) === localHash) {
        const next: StoreMeta = { ...prev, hash: localHash, updatedAt: res.updatedAt, syncedHash }
        if (hasCollections(key)) next.clock = splitClock(res.data).clock
        fin.stores[key] = next
      } else {
        // edited while the PUT was in flight: keep the previous observation so observe() records that edit
        // (including any deletion) and the next sync pushes it
        fin.stores[key] = { ...prev, syncedHash }
        rerun = true
      }
    }
    fin.version = version
    fin.epoch = epoch
    fin.lastSyncedAt = new Date().toISOString()
    save()
    retryDelay = 15_000
    ui().patch({ status: 'synced', lastSyncedAt: fin.lastSyncedAt, devices, error: null, pauseReason: null })
    return
  }
  throw new ConflictError('Too many concurrent changes; will retry.')
}

/** Pull → merge → push. Concurrent calls are coalesced. */
export function sync(_reason = 'manual'): Promise<void> {
  void _reason
  if (!user || getMeta().paused) return Promise.resolve()
  if (inflight) {
    rerun = true
    return inflight
  }
  clearTimeout(retry)
  inflight = (async () => {
    try {
      await runSync()
    } catch (e) {
      const d = describe(e)
      if (e instanceof HttpError && e.status === 401) {
        ui().patch({ status: 'signed-out', user: null, error: null })
        user = null
      } else {
        ui().patch({ status: d.offline ? 'offline' : 'error', error: d.message })
        retry = setTimeout(() => void sync('retry'), retryDelay)
        retryDelay = Math.min(retryDelay * 2, POLL_MS)
      }
    } finally {
      inflight = null
      if (rerun) {
        rerun = false
        void sync('rerun')
      }
    }
  })()
  return inflight
}

/** Begin syncing for a signed-in user. */
export function start(u: AccountUser) {
  track()
  user = u
  const m = getMeta()
  ui().patch({ user: u, deviceId: m.deviceId, lastSyncedAt: m.lastSyncedAt ?? null })
  if (m.paused) {
    ui().patch({ status: 'paused', pauseReason: m.pauseReason ?? 'user' })
    return
  }
  ui().patch({ status: 'syncing', pauseReason: null })
  void sync('start')
  if (teardown || typeof window === 'undefined') return
  const onFocus = () => {
    if (document.visibilityState !== 'visible') return
    const last = getMeta().lastSyncedAt
    if (!last || Date.now() - Date.parse(last) > STALE_MS) void sync('focus')
  }
  const onOnline = () => void sync('online')
  const onOffline = () => ui().status !== 'signed-out' && ui().patch({ status: 'offline' })
  const onHide = () => {
    if (document.visibilityState === 'hidden') {
      clearTimeout(debounce)
      if (observe() && user) void sync('hide')
    }
  }
  const poll = setInterval(() => document.visibilityState === 'visible' && void sync('poll'), POLL_MS)
  window.addEventListener('focus', onFocus)
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  document.addEventListener('visibilitychange', onFocus)
  document.addEventListener('visibilitychange', onHide)
  teardown = () => {
    clearInterval(poll)
    window.removeEventListener('focus', onFocus)
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
    document.removeEventListener('visibilitychange', onFocus)
    document.removeEventListener('visibilitychange', onHide)
    teardown = null
  }
}

/** Stop syncing. Local data (and its tombstones) stays; the merge base is forgotten so the next sign-in re-merges. */
export function stop() {
  user = null
  teardown?.()
  clearTimeout(retry)
  clearTimeout(debounce)
  if (meta) {
    const last = meta.userId ?? meta.lastUserId
    meta = resetBase(meta)
    if (last) meta.lastUserId = last // tombstones stay valid if the same account signs in again
    save()
  }
  ui().patch({ user: null, status: 'signed-out', error: null, devices: [], lastSyncedAt: null })
}

/** Remove the cloud copy and pause syncing until the user turns it back on. */
export async function deleteCloud() {
  // pause first, so a sync that is already in flight can't push this device's data back after the DELETE
  const m0 = getMeta()
  const was = { paused: m0.paused, pauseReason: m0.pauseReason }
  m0.paused = true
  m0.pauseReason = 'user'
  save()
  clearTimeout(retry)
  clearTimeout(debounce)
  let doc: SyncDoc
  try {
    doc = await api('DELETE')
  } catch (e) {
    const m = getMeta()
    m.paused = was.paused
    m.pauseReason = was.pauseReason
    if (!was.paused) delete m.paused
    if (!was.pauseReason) delete m.pauseReason
    save()
    throw e
  }
  meta = resetBase(getMeta())
  meta.paused = true
  meta.pauseReason = 'user'
  meta.epoch = doc.epoch
  if (user) meta.userId = user.id
  save()
  ui().patch({ status: 'paused', pauseReason: 'user', devices: [], lastSyncedAt: null, error: null })
}

export function resume() {
  const m = getMeta()
  delete m.paused
  delete m.pauseReason
  save()
  ui().patch({ pauseReason: null })
  if (user) start(user)
}

/** Cleanup used in tests / HMR. */
export function _dispose() {
  unsubs.forEach((u) => u())
  unsubs = []
  tracking = false
  teardown?.()
}

/** Test helper: resolves once no sync is running (including coalesced re-runs). */
export async function _idle() {
  while (inflight) await inflight
}
