/** Shared wire types (client + server). Pure — no imports with side effects. */
export const SYNC_KEYS = [
  'quran-store',
  'noor-reader',
  'noor-hifz',
  'noor-journey',
  'noor-dhikr',
  'noor-player',
  'noor-prayer',
  'noor-prayer-prefs',
] as const
export type SyncKey = (typeof SYNC_KEYS)[number]

export const MAX_SYNC_BYTES = 2 * 1024 * 1024

export interface StoreSnap<T = unknown> {
  /** ISO timestamp of the last local edit of this store */
  updatedAt: string
  data: T
}

export interface DeviceInfo {
  id: string
  name: string
  lastSyncedAt: string
}

export interface SyncDoc {
  /** 0 = nothing stored yet */
  version: number
  updatedAt: string | null
  stores: Record<string, StoreSnap>
  devices: DeviceInfo[]
}

export interface SyncPutBody {
  /** The version the client last saw (optimistic concurrency). */
  version: number
  stores: Record<string, StoreSnap>
  device?: { id: string; name: string }
}

export const isSyncKey = (k: string): k is SyncKey => (SYNC_KEYS as readonly string[]).includes(k)
