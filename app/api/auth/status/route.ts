import { NextResponse } from 'next/server'
import { accountsEnabled, googleEnabled } from '@/lib/auth-env'

export const dynamic = 'force-dynamic'

/** Tells the client whether this deployment has accounts at all (so the UI can hide sign-in). */
export function GET() {
  const enabled = accountsEnabled()
  return NextResponse.json({ enabled, google: enabled && googleEnabled() }, { headers: { 'Cache-Control': 'no-store' } })
}
