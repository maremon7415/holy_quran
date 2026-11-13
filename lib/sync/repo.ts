import type { DeviceInfo, StoreSnap, SyncDoc } from './types'

export type PutResult = { ok: true; doc: SyncDoc } | { ok: false; conflict: SyncDoc; reason: 'version' | 'epoch' }

/** Storage abstraction for the sync route. Mongo + in-memory implementations. */
export interface SyncRepo {
  get(userId: string): Promise<SyncDoc | null>
  /**
   * Replace the given store keys. Succeeds only if the stored version === expectedVersion (0 = no doc yet)
   * AND the stored epoch === expectedEpoch.
   */
  put(userId: string, expectedVersion: number, stores: Record<string, StoreSnap>, device?: { id: string; name: string }, expectedEpoch?: number): Promise<PutResult>
  /**
   * "Delete my cloud data": clears stores + devices but keeps the document, bumping `version` and `epoch` and
   * setting `resetAt`, so other devices learn about the deletion instead of re-uploading. Returns the new doc.
   */
  reset(userId: string): Promise<SyncDoc>
}

export const emptyDoc = (): SyncDoc => ({ version: 0, updatedAt: null, stores: {}, devices: [], epoch: 0, resetAt: null })

export function memoryRepo(): SyncRepo & { dump(): Map<string, SyncDoc> } {
  const db = new Map<string, SyncDoc>()
  const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))
  return {
    dump: () => db,
    async get(userId) {
      const d = db.get(userId)
      return d ? clone(d) : null
    },
    async put(userId, expected, stores, device, expectedEpoch = 0) {
      const cur = db.get(userId)
      const curVersion = cur?.version ?? 0
      if ((cur?.epoch ?? 0) !== expectedEpoch) return { ok: false, conflict: clone(cur ?? emptyDoc()), reason: 'epoch' }
      if (curVersion !== expected) return { ok: false, conflict: clone(cur ?? emptyDoc()), reason: 'version' }
      const now = new Date().toISOString()
      const devices: DeviceInfo[] = (cur?.devices ?? []).filter((d) => d.id !== device?.id)
      if (device) devices.push({ ...device, lastSyncedAt: now })
      const doc: SyncDoc = { version: curVersion + 1, updatedAt: now, stores: { ...(cur?.stores ?? {}), ...clone(stores) }, devices, epoch: cur?.epoch ?? 0, resetAt: cur?.resetAt ?? null }
      db.set(userId, doc)
      return { ok: true, doc: clone(doc) }
    },
    async reset(userId) {
      const cur = db.get(userId)
      if (!cur) return emptyDoc()
      const now = new Date().toISOString()
      const doc: SyncDoc = { version: cur.version + 1, updatedAt: now, stores: {}, devices: [], epoch: (cur.epoch ?? 0) + 1, resetAt: now }
      db.set(userId, doc)
      return clone(doc)
    },
  }
}
