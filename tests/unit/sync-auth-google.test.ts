import { describe, it, expect } from 'vitest'
import { decideGoogleSignIn, type UserLite } from '@/lib/auth-google'
import { signLinkIntent, verifyLinkIntent, LINK_TTL_MS } from '@/lib/auth-link'

const SUB = 'google-sub-1'
const pwUnverified: UserLite = { id: 'u-pw', hasPassword: true, emailVerified: false }
const pwVerified: UserLite = { id: 'u-pwv', hasPassword: true, emailVerified: true }
const googleOnly: UserLite = { id: 'u-g', hasPassword: false, emailVerified: true }
const base = { googleSub: SUB, emailVerified: true as boolean | undefined, byGoogleId: null as UserLite | null, byEmail: null as UserLite | null, linkUserId: null as string | null }

describe('decideGoogleSignIn (account-takeover rules)', () => {
  it('REFUSES to attach to a password account whose email was never verified (pre-registration takeover)', () => {
    expect(decideGoogleSignIn({ ...base, byEmail: pwUnverified })).toEqual({ action: 'refuse', error: 'GoogleEmailExists' })
  })
  it('refuses when Google does not vouch for the email', () => {
    expect(decideGoogleSignIn({ ...base, emailVerified: false })).toEqual({ action: 'refuse', error: 'GoogleEmailUnverified' })
    expect(decideGoogleSignIn({ ...base, emailVerified: undefined, byEmail: googleOnly })).toEqual({ action: 'refuse', error: 'GoogleEmailUnverified' })
  })
  it('creates a new (verified) account when the email is unknown', () => {
    expect(decideGoogleSignIn(base)).toEqual({ action: 'create' })
  })
  it('links to an existing account only if it has no password or a verified email', () => {
    expect(decideGoogleSignIn({ ...base, byEmail: googleOnly })).toEqual({ action: 'link', userId: 'u-g' })
    expect(decideGoogleSignIn({ ...base, byEmail: pwVerified })).toEqual({ action: 'link', userId: 'u-pwv' })
  })
  it('refuses when the email account is already linked to another Google id', () => {
    expect(decideGoogleSignIn({ ...base, byEmail: { ...googleOnly, googleId: 'other' } })).toEqual({ action: 'refuse', error: 'GoogleEmailExists' })
  })
  it('signs in the user already linked to this Google id', () => {
    expect(decideGoogleSignIn({ ...base, emailVerified: false, byGoogleId: { ...pwUnverified, googleId: SUB } })).toEqual({ action: 'signin', userId: 'u-pw' })
  })
  it('explicit link from a signed-in user (Account settings) links even a password account', () => {
    expect(decideGoogleSignIn({ ...base, byEmail: pwUnverified, linkUserId: 'u-pw' })).toEqual({ action: 'link', userId: 'u-pw' })
    expect(decideGoogleSignIn({ ...base, byGoogleId: googleOnly, linkUserId: 'u-pw' })).toEqual({ action: 'refuse', error: 'GoogleLinkedElsewhere' })
  })
})

describe('link intent cookie', () => {
  const secret = 's3cret'
  it('round-trips, expires and rejects tampering', () => {
    const now = 1_700_000_000_000
    const v = signLinkIntent('user-1', secret, now)
    expect(verifyLinkIntent(v, secret, now + 1000)).toBe('user-1')
    expect(verifyLinkIntent(v, secret, now + LINK_TTL_MS + 1)).toBeNull()
    expect(verifyLinkIntent(v, 'other-secret', now)).toBeNull()
    expect(verifyLinkIntent(v.replace('user-1', 'user-2'), secret, now)).toBeNull()
    expect(verifyLinkIntent('garbage', secret, now)).toBeNull()
    expect(verifyLinkIntent(undefined, secret, now)).toBeNull()
  })
})
