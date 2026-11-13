import { describe, it, expect } from 'vitest'
import { safeCallback } from '@/lib/sync/callback'

const ORIGIN = 'https://noor.example'

describe('safeCallback (post-login redirect)', () => {
  const evil = [
    '//evil.com',
    '/\\evil.com',
    '/\\/evil.com',
    '/\t/evil.com',
    '/%09/evil.com',
    '/\n/evil.com',
    '/\r\n/evil.com',
    '/%0a/evil.com',
    '/%2F/evil.com',
    '/%5Cevil.com',
    'https://evil.com',
    'http:evil.com',
    'javascript:alert(1)',
    ' /account',
    'account',
    '',
    null,
    undefined,
  ]
  for (const p of evil) {
    it(`rejects ${JSON.stringify(p)}`, () => {
      expect(safeCallback(p, '/account', ORIGIN)).toBe('/account')
      // and whatever comes back always stays on our origin
      expect(new URL(safeCallback(p, '/account', ORIGIN), ORIGIN).origin).toBe(ORIGIN)
    })
  }

  it('keeps same-origin paths with query and hash', () => {
    expect(safeCallback('/account?x=1#y', '/account', ORIGIN)).toBe('/account?x=1#y')
    expect(safeCallback('/settings', '/account', ORIGIN)).toBe('/settings')
    expect(safeCallback('/bn/surah/al-fatiha?ayah=2', '/account', ORIGIN)).toBe('/bn/surah/al-fatiha?ayah=2')
  })

  it('normalises dot segments but never leaves the origin', () => {
    expect(safeCallback('/a/../settings', '/account', ORIGIN)).toBe('/settings')
  })

  it('does not bounce back to the auth pages', () => {
    expect(safeCallback('/login?callbackUrl=/x', '/account', ORIGIN)).toBe('/account')
    expect(safeCallback('/register', '/account', ORIGIN)).toBe('/account')
    expect(safeCallback('/bn/login', '/account', ORIGIN)).toBe('/account')
    expect(safeCallback('/loginhelp', '/account', ORIGIN)).toBe('/loginhelp')
  })

  it('works without an explicit origin (server / tests)', () => {
    expect(safeCallback('/\t/evil.com')).toBe('/account')
    expect(safeCallback('/account?x=1#y')).toBe('/account?x=1#y')
  })
})
