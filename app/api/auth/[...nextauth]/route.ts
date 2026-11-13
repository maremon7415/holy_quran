import { NextResponse, type NextRequest } from 'next/server'
import { handlers } from '@/auth'
import { accountsEnabled } from '@/lib/auth-env'

export const dynamic = 'force-dynamic'

// Without MONGODB_URI + AUTH_SECRET every endpoint answers gracefully instead of 500-ing.
function disabled(req: NextRequest) {
  if (req.nextUrl.pathname.endsWith('/session')) return NextResponse.json(null)
  return NextResponse.json({ error: 'accounts_disabled' }, { status: 503 })
}
export const GET = (req: NextRequest) => (accountsEnabled() ? handlers.GET(req) : disabled(req))
export const POST = (req: NextRequest) => (accountsEnabled() ? handlers.POST(req) : disabled(req))
