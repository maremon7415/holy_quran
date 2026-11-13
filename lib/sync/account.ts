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

export async function signInWithPassword(email: string, password: string): Promise<boolean> {
  const res = await signIn('credentials', { email, password, redirect: false })
  if (!res || res.error) return false
  await refreshAccount()
  return true
}

export function signInWithGoogle(callbackUrl: string) {
  return signIn('google', { callbackUrl })
}

/** Sign out but keep every bit of local data. */
export async function signOutKeepLocal() {
  await signOut({ redirect: false })
  engine.stop()
}

/** Only same-site relative paths are allowed as post-login redirects. */
export function safeCallback(raw: string | null | undefined, fallback = '/account'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback
  if (raw.startsWith('/login') || raw.startsWith('/register')) return fallback
  return raw
}
