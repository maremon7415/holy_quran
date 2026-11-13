import type { DeviceInfo, StoreSnap, SyncDoc } from './types'

export type PutResult = { ok: true; doc: SyncDoc } | { ok: false; conflict: SyncDoc }

/** Storage abstraction for the sync route. Mongo + in-memory implementations. */
export interface SyncRepo {
  get(userId: string): Promise<SyncDoc | null>
  /** Replace the given store keys. Succeeds only if the stored version === expectedVersion (0 = no doc yet). */
  put(userId: string, expectedVersion: number, stores: Record<string, StoreSnap>, device?: { id: string; name: string }): Promise<PutResult>
  remove(userId: string): Promise<void>
}

export const emptyDoc = (): SyncDoc => ({ version: 0, updatedAt: null, stores: {}, devices: [] })

export function memoryRepo(): SyncRepo & { dump(): Map<string, SyncDoc> } {
  const db = new Map<string, SyncDoc>()
  const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))
  return {
    dump: () => db,
    async get(userId) {
      const d = db.get(userId)
      return d ? clone(d) : null
    },
    async put(userId, expected, stores, device) {
      const cur = db.get(userId)
      const curVersion = cur?.version ?? 0
      if (curVersion !== expected) return { ok: false, conflict: clone(cur ?? emptyDoc()) }
      const now = new Date().toISOString()
      const devices: DeviceInfo[] = (cur?.devices ?? []).filter((d) => d.id !== device?.id)
      if (device) devices.push({ ...device, lastSyncedAt: now })
      const doc: SyncDoc = { version: curVersion + 1, updatedAt: now, stores: { ...(cur?.stores ?? {}), ...clone(stores) }, devices }
      db.set(userId, doc)
      return { ok: true, doc: clone(doc) }
    },
    async remove(userId) {
      db.delete(userId)
    },
  }
}
