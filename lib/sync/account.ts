'use client'
import { signIn, signOut } from 'next-auth/react'
import * as engine from './engine'
import { useSyncState, type AccountUser } from './state'

let statusPromise: Promise<boolean> | null = null

/** Ask the server whether accounts are enabled (cached for the page's lifetime). */
export function loadAccountStatus(): Promise<boolean> {
  statusPromise ??= (async () => {
    try {
      const res = await fetch('/api/auth/status', { cache: 'no-store' })
      const j = (await res.json()) as { enabled?: boolean; google?: boolean }
      useSyncState.getState().patch({ enabled: Boolean(j.enabled), google: Boolean(j.google) })
      if (!j.enabled) useSyncState.getState().patch({ status: 'disabled' })
      return Boolean(j.enabled)
    } catch {
      statusPromise = null // retry next time (e.g. offline at first load)
      useSyncState.getState().patch({ enabled: false, status: 'disabled' })
      return false
    }
  })()
  return statusPromise
}

/** Read the current session; start or stop the sync engine accordingly. */
export async function refreshAccount(): Promise<AccountUser | null> {
  if (!(await loadAccountStatus())) return null
  engine.track()
  let u: AccountUser | null = null
  try {
    const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'same-origin' })
    const j = (await res.json()) as { user?: AccountUser } | null
    u = j?.user?.id ? j.user : null
  } catch {
    // offline: keep whatever we knew
    const known = useSyncState.getState().user
    if (known) return known
  }
  if (u) engine.start(u)
  else {
    engine.stop()
  }
  return u
}

/** Resolves to 'ok', 'rate_limited' (too many attempts from this network) or 'invalid'. */
export async function signInWithPassword(email: string, password: string): Promise<'ok' | 'invalid' | 'rate_limited'> {
  const res = await signIn('credentials', { email, password, redirect: false })
  if (!res || res.error) return (res as { code?: string } | undefined)?.code === 'rate_limited' ? 'rate_limited' : 'invalid'
  await refreshAccount()
  return 'ok'
}

export function signInWithGoogle(callbackUrl: string) {
  return signIn('google', { callbackUrl })
}

/** Account settings → "Link Google sign-in": registers a short-lived link request, then runs the Google flow. */
export async function linkGoogle(): Promise<boolean> {
  const res = await fetch('/api/auth/link-google', { method: 'POST', credentials: 'same-origin' })
  if (!res.ok) return false
  await signIn('google', { callbackUrl: '/account?linked=google' })
  return true
}

/** Sign out but keep every bit of local data. */
export async function signOutKeepLocal() {
  await signOut({ redirect: false })
  engine.stop()
}

export { safeCallback } from './callback'
