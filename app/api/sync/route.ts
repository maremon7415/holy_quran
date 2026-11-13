import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { accountsEnabled } from '@/lib/auth-env'
import { readBodyCapped } from '@/lib/sync/body'
import { handleDelete, handleGet, handlePut, type HandlerResult } from '@/lib/sync/handlers'
import { mongoRepo } from '@/lib/sync/repo-mongo'
import { MAX_SYNC_BYTES } from '@/lib/sync/types'

export const dynamic = 'force-dynamic'
const noStore = { 'Cache-Control': 'no-store' }
const json = (r: HandlerResult) => NextResponse.json(r.body, { status: r.status, headers: noStore })

async function run(fn: (userId: string) => Promise<HandlerResult>) {
  if (!accountsEnabled()) return NextResponse.json({ error: 'accounts_disabled' }, { status: 503, headers: noStore })
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: noStore })
    return json(await fn(userId))
  } catch (e) {
    console.error('[sync]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500, headers: noStore })
  }
}

export const GET = () => run((id) => handleGet(mongoRepo(), id))
export const DELETE = () => run((id) => handleDelete(mongoRepo(), id))
export async function PUT(req: Request) {
  // streamed with a byte cap: a chunked body (no Content-Length) is never buffered beyond MAX_SYNC_BYTES + 1 chunk
  let raw: string | null
  try {
    raw = await readBodyCapped(req, MAX_SYNC_BYTES)
  } catch {
    return NextResponse.json({ error: 'bad_body' }, { status: 400, headers: noStore })
  }
  if (raw === null) return NextResponse.json({ error: 'payload_too_large', max: MAX_SYNC_BYTES }, { status: 413, headers: noStore })
  return run((id) => handlePut(mongoRepo(), id, raw))
}
