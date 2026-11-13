import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/search/route'

const call = async (qs: string) => {
  const res = await GET(new Request(`http://localhost/api/search${qs}`))
  return { res, body: (await res.json()) as { total: number; hits: any[] } }
}

describe('GET /api/search', () => {
  it('returns hits + total + cache header', async () => {
    const { res, body } = await call('?q=mercy')
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toMatch(/s-maxage/)
    expect(body.total).toBeGreaterThan(0)
    expect(body.hits.length).toBe(30) // default limit
    expect(body.hits[0]).toMatchObject({ key: expect.stringMatching(/^\d+:\d+$/), surahName: expect.any(String), ar: expect.any(String) })
  })
  it.each([
    ['limit=5', 5],
    ['limit=1', 1],
    ['limit=100', 100],
    ['limit=1000000', 100],
    ['limit=0', 30],       // 0 is falsy → default
    ['limit=-5', 1],       // negative clamps to the minimum
    ['limit=NaN', 30],
    ['limit=abc', 30],
    ['limit=', 30],
    ['limit=2.9', 2],
    ['limit=Infinity', 100],
  ])('clamps %s → %i hits', async (qs, n) => {
    const { body } = await call(`?q=mercy&${qs}`)
    expect(body.hits).toHaveLength(n)
  })
  it('missing / empty / 1-char q → empty result, 200', async () => {
    for (const qs of ['', '?q=', '?q=a', '?q=%20%20']) {
      const { res, body } = await call(qs)
      expect(res.status).toBe(200)
      expect(body).toEqual({ total: 0, hits: [] })
    }
  })
  it('Arabic query', async () => {
    const { body } = await call(`?q=${encodeURIComponent('الصبر')}&limit=5`)
    expect(body.total).toBeGreaterThan(0)
    expect(body.hits[0].ar).toMatch(/[؀-ۿ]/)
  })
  it('Bangla query', async () => {
    const { body } = await call(`?q=${encodeURIComponent('ধৈর্য')}&limit=5`)
    expect(body.total).toBeGreaterThan(0)
    expect(body.hits[0].bn).toContain('ধৈর্য')
  })
  it('hostile input does not 500', async () => {
    for (const q of ['(((', '[', '\\', '<script>alert(1)</script>', "'; DROP TABLE x;--", 'a'.repeat(5000), '%00']) {
      const { res } = await call(`?q=${encodeURIComponent(q)}`)
      expect(res.status).toBe(200)
    }
  })
})
