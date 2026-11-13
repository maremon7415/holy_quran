'use client'
/**
 * Client sync engine. Singleton, browser only.
 *  - track(): watches the synced zustand stores for edits (works signed-out too, so edit times are known)
 *  - start(user): pull → merge → push, then keeps syncing (debounced on change, on focus/online, every 5 min)
 *  - stop(): detach (local data is never touched)
 */
import { hashData, resolveStore } from './merge'
import { readMeta, writeMeta, resetBase, deviceName, type SyncMeta } from './meta'
import { SYNCED_STORES, pickData } from './registry'
import { useSyncState, type AccountUser } from './state'
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

class HttpError extends Error {
  constructor(public status: number, public body?: unknown) {
    super(`HTTP ${status}`)
  }
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
  return json as SyncDoc
}

// ---------- local edit tracking ----------
/** Compare each store with the last observed hash; bump updatedAt for the ones that changed. Returns true if anything changed. */
function observe(): boolean {
  const m = getMeta()
  let changed = false
  const now = new Date().toISOString()
  for (const s of SYNCED_STORES) {
    const h = hashData(pickData(s))
    const e = m.stores[s.key]
    if (!e) m.stores[s.key] = { hash: h, updatedAt: null }
    else if (e.hash !== h) {
      m.stores[s.key] = { ...e, hash: h, updatedAt: now }
      changed = true
    }
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
  observe()
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
  return { offline: true, message: 'Could not reach the server. You may be offline.' }
}

async function runSync(): Promise<void> {
  const m = getMeta()
  if (!user) return
  if (m.userId && m.userId !== user.id) {
    // a different account signed in on this device: forget the old merge base
    meta = resetBase(m)
    meta.userId = user.id
  }
  getMeta().userId = user.id
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    ui().patch({ status: 'offline', error: null })
    return
  }
  ui().patch({ status: 'syncing', error: null })
  observe()

  let remote = await api('GET')
  for (let attempt = 0; attempt < 4; attempt++) {
    const mm = getMeta()
    const now = new Date().toISOString()
    const resolutions: { key: string; res: NonNullable<ReturnType<typeof resolveStore>>; entry: (typeof SYNCED_STORES)[number] }[] = []
    for (const entry of SYNCED_STORES) {
      const local = { data: pickData(entry), updatedAt: mm.stores[entry.key]?.updatedAt ?? null }
      const rs = remote.stores[entry.key] as StoreSnap<Record<string, unknown>> | undefined
      let res
      try {
        res = resolveStore(entry.key, local, rs && typeof rs.data === 'object' && rs.data ? rs : undefined, mm.stores[entry.key]?.syncedHash, now)
      } catch (e) {
        console.error('[sync] merge failed for', entry.key, e)
        continue // never block the other stores on one bad payload
      }
      if (res) resolutions.push({ key: entry.key, res, entry })
    }

    // apply remote/merged results locally
    applying = true
    try {
      for (const { res, entry } of resolutions) if (res.apply) entry.store.setState(res.data)
    } finally {
      applying = false
    }

    const toPush = resolutions.filter((r) => r.res.push)
    let version = remote.version
    let devices = remote.devices
    if (toPush.length) {
      const stores: Record<string, StoreSnap> = {}
      for (const r of toPush) stores[r.key] = { updatedAt: r.res.updatedAt, data: r.res.data }
      try {
        const doc = await api('PUT', { version: remote.version, stores, device: { id: mm.deviceId, name: deviceName() } })
        version = doc.version
        devices = doc.devices
      } catch (e) {
        if (e instanceof HttpError && e.status === 409 && (e.body as { current?: SyncDoc })?.current) {
          remote = (e.body as { current: SyncDoc }).current // someone synced in between: re-merge against the newer copy
          continue
        }
        throw e
      }
    }

    // success: record the agreed state as the new merge base
    const fin = getMeta()
    for (const { key, res, entry } of resolutions) {
      const localHash = hashData(pickData(entry))
      fin.stores[key] = { hash: localHash, updatedAt: res.updatedAt, syncedHash: hashData(res.data) }
    }
    fin.version = version
    fin.lastSyncedAt = new Date().toISOString()
    save()
    retryDelay = 15_000
    ui().patch({ status: 'synced', lastSyncedAt: fin.lastSyncedAt, devices, error: null })
    return
  }
  throw new Error('Too many concurrent changes; will retry.')
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
    ui().patch({ status: 'paused' })
    return
  }
  ui().patch({ status: 'syncing' })
  void sync('start')
  if (teardown) return
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

/** Stop syncing. Local data stays; the merge base is forgotten so the next sign-in re-merges. */
export function stop() {
  user = null
  teardown?.()
  clearTimeout(retry)
  clearTimeout(debounce)
  if (meta) {
    meta = resetBase(meta)
    delete meta.userId
    save()
  }
  ui().patch({ user: null, status: 'signed-out', error: null, devices: [], lastSyncedAt: null })
}

/** Remove the cloud copy and pause syncing until the user turns it back on. */
export async function deleteCloud() {
  await api('DELETE')
  meta = resetBase(getMeta())
  meta.paused = true
  save()
  clearTimeout(retry)
  ui().patch({ status: 'paused', devices: [], lastSyncedAt: null, error: null })
}

export function resume() {
  const m = getMeta()
  m.paused = false
  save()
  if (user) start(user)
}

/** Cleanup used in tests / HMR. */
export function _dispose() {
  unsubs.forEach((u) => u())
  unsubs = []
  tracking = false
  teardown?.()
}
