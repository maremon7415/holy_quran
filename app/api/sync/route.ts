import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { accountsEnabled } from '@/lib/auth-env'
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
  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > MAX_SYNC_BYTES) return NextResponse.json({ error: 'payload_too_large', max: MAX_SYNC_BYTES }, { status: 413, headers: noStore })
  const raw = await req.text()
  return run((id) => handlePut(mongoRepo(), id, raw))
}
