/**
 * Google sign-in → which local account? Pure decision function (unit-tested); auth.ts performs the DB writes.
 *
 * Threat: password registrations don't verify the email, so anyone can register `victim@gmail.com` with a password
 * before the victim ever uses the app. If Google sign-in then attached to "the account with that email", the
 * attacker (who knows the password) and the victim would share one account. Likewise, an unverified Google email
 * must never be trusted to take over an existing account.
 *
 * Rules, in order:
 *  1. A user already linked to this Google id (`googleId === sub`) signs in. (An explicit link request for a
 *     different user is refused: one Google account maps to one user.)
 *  2. An explicit link request from a signed-in user (Account → "Link Google sign-in", proven by a signed, short-lived
 *     cookie AND the current session) links this Google id to that user.
 *  3. Google says the email is not verified → refuse.
 *  4. No user with that email → create one (emailVerified = true).
 *  5. A user with that email exists and is linked to another Google id → refuse.
 *  6. It has no password (Google-only, e.g. created before googleId existed) or its email is verified → link.
 *  7. Otherwise (password account with an unverified email) → refuse: "An account with this email already exists —
 *     sign in with your password, then link Google in Account settings".
 */
export interface UserLite {
  id: string
  hasPassword: boolean
  emailVerified: boolean
  googleId?: string | null
}

export type GoogleRefusal = 'GoogleEmailExists' | 'GoogleEmailUnverified' | 'GoogleLinkedElsewhere'

export type GoogleDecision =
  | { action: 'signin'; userId: string }
  | { action: 'link'; userId: string }
  | { action: 'create' }
  | { action: 'refuse'; error: GoogleRefusal }

export function decideGoogleSignIn(input: {
  googleSub: string
  emailVerified: boolean | undefined
  byGoogleId: UserLite | null
  byEmail: UserLite | null
  /** user id of a verified explicit link request, or null */
  linkUserId: string | null
}): GoogleDecision {
  const { googleSub, emailVerified, byGoogleId, byEmail, linkUserId } = input
  if (byGoogleId) {
    if (linkUserId && linkUserId !== byGoogleId.id) return { action: 'refuse', error: 'GoogleLinkedElsewhere' }
    return { action: 'signin', userId: byGoogleId.id }
  }
  if (linkUserId) return { action: 'link', userId: linkUserId }
  if (emailVerified !== true) return { action: 'refuse', error: 'GoogleEmailUnverified' }
  if (!byEmail) return { action: 'create' }
  if (byEmail.googleId && byEmail.googleId !== googleSub) return { action: 'refuse', error: 'GoogleEmailExists' }
  if (!byEmail.hasPassword || byEmail.emailVerified) return { action: 'link', userId: byEmail.id }
  return { action: 'refuse', error: 'GoogleEmailExists' }
}
