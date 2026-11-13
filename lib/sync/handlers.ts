import { z } from 'zod'
import { emptyDoc, type SyncRepo } from './repo'
import { MAX_SYNC_BYTES, isSyncKey, type SyncDoc } from './types'

/** Framework-agnostic route logic so it can be unit-tested with an in-memory repo. */
export interface HandlerResult {
  status: number
  body: unknown
}

const putSchema = z.object({
  version: z.number().int().min(0),
  stores: z.record(z.object({ updatedAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'bad date'), data: z.record(z.unknown()) })),
  device: z.object({ id: z.string().min(4).max(64).regex(/^[\w-]+$/), name: z.string().max(80) }).optional(),
})

export async function handleGet(repo: SyncRepo, userId: string): Promise<HandlerResult> {
  const doc = (await repo.get(userId)) ?? emptyDoc()
  return { status: 200, body: doc }
}

export async function handlePut(repo: SyncRepo, userId: string, rawBody: string): Promise<HandlerResult> {
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_SYNC_BYTES) return { status: 413, body: { error: 'payload_too_large', max: MAX_SYNC_BYTES } }
  let json: unknown
  try {
    json = JSON.parse(rawBody)
  } catch {
    return { status: 400, body: { error: 'invalid_json' } }
  }
  const parsed = putSchema.safeParse(json)
  if (!parsed.success) return { status: 400, body: { error: 'invalid_payload', details: parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`) } }
  const { version, stores, device } = parsed.data
  const bad = Object.keys(stores).filter((k) => !isSyncKey(k))
  if (bad.length) return { status: 400, body: { error: 'unknown_store', keys: bad } }
  const res = await repo.put(userId, version, stores, device)
  if (!res.ok) return { status: 409, body: { error: 'version_conflict', current: res.conflict satisfies SyncDoc } }
  return { status: 200, body: res.doc }
}

export async function handleDelete(repo: SyncRepo, userId: string): Promise<HandlerResult> {
  await repo.remove(userId)
  return { status: 200, body: emptyDoc() }
}
