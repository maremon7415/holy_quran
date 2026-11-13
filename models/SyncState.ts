import mongoose, { Schema } from 'mongoose'

export interface ISyncState {
  userId: string
  version: number
  /** key → { updatedAt, json } — `json` is the store payload serialised as a string (immune to `$`/`.` key rules) */
  stores: Record<string, { updatedAt: string; json: string }>
  devices: Record<string, { name: string; lastSyncedAt: string }>
  /** bumped by "Delete my cloud data" (the doc is cleared, never deleted) */
  epoch?: number
  resetAt?: string | null
  updatedAt: Date
}

const SyncStateSchema = new Schema<ISyncState>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    version: { type: Number, required: true, default: 1 },
    stores: { type: Schema.Types.Mixed, default: {} },
    devices: { type: Schema.Types.Mixed, default: {} },
    epoch: { type: Number, default: 0 },
    resetAt: { type: String, default: null },
  },
  { timestamps: { createdAt: false, updatedAt: true }, minimize: false },
)

export default (mongoose.models.SyncState as mongoose.Model<ISyncState>) || mongoose.model<ISyncState>('SyncState', SyncStateSchema)
