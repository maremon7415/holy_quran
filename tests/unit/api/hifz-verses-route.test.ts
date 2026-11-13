import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/hifz/verses/[surah]/route'

const call = (surah: string) => GET(new Request(`http://localhost/api/hifz/verses/${surah}`), { params: Promise.resolve({ surah }) })

describe('GET /api/hifz/verses/[surah]', () => {
  it('returns compact verses for a valid surah', async () => {
    const res = await call('112')
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toContain('immutable')
    const body = await res.json()
    expect(body).toHaveLength(4)
    expect(Object.keys(body[0]).sort()).toEqual(['ar', 'bn', 'en', 'n'])
    expect(body.map((v: any) => v.n)).toEqual([1, 2, 3, 4])
  })
  it('first and last surah', async () => {
    expect(await (await call('1')).json()).toHaveLength(7)
    expect(await (await call('114')).json()).toHaveLength(6)
    expect(await (await call('2')).json()).toHaveLength(286)
  })
  it.each(['0', '115', '-1', '1.5', 'abc', '', ' ', 'Infinity', 'NaN', '../1', '2%20'])('rejects %j with 404', async (s) => {
    const res = await call(s)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'not found' })
  })
})
