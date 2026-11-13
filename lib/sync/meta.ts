/**
 * Per-device sync bookkeeping, kept in localStorage under `nq-sync-meta`.
 * (Deliberately NOT prefixed `noor-` so backup export/import never carries it to another device.)
 */
import type { ItemClock } from './tombstones'

export type PauseReason = 'user' | 'remote-reset'

export interface StoreMeta {
  /** hash of the last observed local data (to detect edits) */
  hash: string
  /** when this device last edited the store; null = never edited (treated as oldest) */
  updatedAt: string | null
  /** hash of the data both sides agreed on at the last successful sync (merge base) */
  syncedHash?: string
  /** collection item ids seen at the last observation (to detect deletions); see tombstones.ts */
  ids?: string[]
  /** per-item add/delete clock of this device (tombstones) */
  clock?: ItemClock
}
export interface SyncMeta {
  deviceId: string
  userId?: string
  /** account that was signed in before the last sign-out (tombstones are dropped if another account signs in) */
  lastUserId?: string
  version: number
  lastSyncedAt?: string
  /** user turned sync off (e.g. after deleting cloud data) */
  paused?: boolean
  /** why sync is paused: the user turned it off here, or the cloud copy was deleted on another device */
  pauseReason?: PauseReason
  /** server reset counter seen at the last successful sync (bumped by "Delete my cloud data") */
  epoch?: number
  stores: Record<string, StoreMeta>
}

const KEY = 'nq-sync-meta'
const rid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`).replace(/[^\w-]/g, '')

export function readMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const m = JSON.parse(raw) as SyncMeta
      if (m && typeof m.deviceId === 'string' && m.stores) return { ...m, version: typeof m.version === "number" ? m.version : 0 }
    }
  } catch {
    /* ignore */
  }
  return { deviceId: rid(), version: 0, stores: {} }
}
export function writeMeta(m: SyncMeta) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m))
  } catch {
    /* storage unavailable */
  }
}
/** Forget everything about the cloud (keeps edit tracking, tombstones + deviceId). */
export function resetBase(m: SyncMeta): SyncMeta {
  const stores: SyncMeta['stores'] = {}
  for (const [k, v] of Object.entries(m.stores)) {
    stores[k] = { hash: v.hash, updatedAt: v.updatedAt }
    if (v.ids) stores[k].ids = v.ids
    if (v.clock) stores[k].clock = v.clock
  }
  const out: SyncMeta = { deviceId: m.deviceId, version: 0, stores }
  if (m.paused) out.paused = true
  if (m.pauseReason) out.pauseReason = m.pauseReason
  if (m.lastUserId) out.lastUserId = m.lastUserId
  return out
}

export function deviceName(): string {
  if (typeof navigator === 'undefined') return 'Device'
  const ua = navigator.userAgent
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'Device'
  const br = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser'
  return `${br} on ${os}`
}
