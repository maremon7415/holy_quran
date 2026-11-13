import { connectDB } from '@/lib/db'
import SyncState, { type ISyncState } from '@/models/SyncState'
import { emptyDoc, type PutResult, type SyncRepo } from './repo'
import type { DeviceInfo, StoreSnap, SyncDoc } from './types'

function toDoc(s: Pick<ISyncState, 'version' | 'stores' | 'devices'> & { updatedAt?: Date }): SyncDoc {
  const stores: Record<string, StoreSnap> = {}
  for (const [k, v] of Object.entries(s.stores ?? {})) {
    try {
      stores[k] = { updatedAt: v.updatedAt, data: JSON.parse(v.json) }
    } catch {
      /* skip corrupt entry */
    }
  }
  const devices: DeviceInfo[] = Object.entries(s.devices ?? {}).map(([id, d]) => ({ id, name: d.name, lastSyncedAt: d.lastSyncedAt }))
  devices.sort((a, b) => Date.parse(b.lastSyncedAt) - Date.parse(a.lastSyncedAt))
  return { version: s.version, updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : null, stores, devices }
}

export function mongoRepo(): SyncRepo {
  return {
    async get(userId) {
      await connectDB()
      const s = await SyncState.findOne({ userId }).lean()
      return s ? toDoc(s as unknown as ISyncState) : null
    },
    async put(userId, expected, stores, device): Promise<PutResult> {
      await connectDB()
      const now = new Date().toISOString()
      const set: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(stores)) set[`stores.${k}`] = { updatedAt: v.updatedAt, json: JSON.stringify(v.data) }
      if (device) set[`devices.${device.id}`] = { name: device.name, lastSyncedAt: now }
      try {
        let updated: unknown
        if (expected === 0) {
          // creates the doc; the unique userId index makes a concurrent creator fail with E11000
          updated = await SyncState.findOneAndUpdate(
            { userId, version: { $exists: false } },
            { $set: set, $inc: { version: 1 } },
            { upsert: true, returnDocument: "after" },
          ).lean()
        } else {
          updated = await SyncState.findOneAndUpdate({ userId, version: expected }, { $set: set, $inc: { version: 1 } }, { returnDocument: "after" }).lean()
        }
        if (updated) return { ok: true, doc: toDoc(updated as unknown as ISyncState) }
      } catch (e) {
        if ((e as { code?: number }).code !== 11000) throw e
      }
      const cur = await SyncState.findOne({ userId }).lean()
      return { ok: false, conflict: cur ? toDoc(cur as unknown as ISyncState) : emptyDoc() }
    },
    async remove(userId) {
      await connectDB()
      await SyncState.deleteOne({ userId })
    },
  }
}
