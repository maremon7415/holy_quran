import { describe, it, expect } from 'vitest'
import { GET as ayah } from '@/app/api/v1/ayah/[ref]/route'
import { GET as surah } from '@/app/api/v1/surah/[id]/route'
import { GET as surahs } from '@/app/api/v1/surahs/route'
import { GET as searchRoute } from '@/app/api/v1/search/route'
import { GET as duasRoute } from '@/app/api/v1/duas/route'
import { GET as dua } from '@/app/api/v1/duas/[slug]/route'
import { GET as topicsRoute } from '@/app/api/v1/topics/route'
import { GET as topic } from '@/app/api/v1/topics/[slug]/route'
import { GET as namesRoute } from '@/app/api/v1/names/route'
import { GET as name } from '@/app/api/v1/names/[id]/route'
import { GET as openapi } from '@/app/openapi.json/route'
import { OPTIONS } from '@/lib/api/http'

const req = (p: string) => new Request(`http://localhost${p}`)
const ctx = <K extends string>(k: K, v: string) => ({ params: Promise.resolve({ [k]: v } as Record<K, string>) })
async function body(res: Response) {
  expect(res.headers.get('access-control-allow-origin')).toBe('*')
  expect(res.headers.get('content-type')).toContain('application/json')
  return res.json() as Promise<any>
}
const CANON = /^https?:\/\/[^/]+\//

describe('/api/v1 — public JSON API', () => {
  it('ayah: single, range, named ref, translation filter, cache header', async () => {
    const r = await ayah(req('/api/v1/ayah/2:255'), ctx('ref', '2:255'))
    expect(r.status).toBe(200)
    expect(r.headers.get('cache-control')).toMatch(/s-maxage=86400/)
    const b = await body(r)
    expect(b.reference).toBe('2:255')
    expect(b.url).toMatch(/\/surah\/al-baqarah\/255$/)
    expect(b.markdown).toMatch(/\/surah\/al-baqarah\/255\.md$/)
    expect(b.citation).toContain(b.url)
    expect(b.ayahs[0]).toMatchObject({ key: '2:255', juz: 3 })

    const range = await body(await ayah(req('/x'), ctx('ref', '2:255-257')))
    expect(range.ayahs.map((a: any) => a.key)).toEqual(['2:255', '2:256', '2:257'])
    for (const ref of ['al-baqarah:255', '2.255', 'Surah Yasin 1', encodeURIComponent('2:255')]) {
      expect((await ayah(req('/x'), ctx('ref', ref))).status, ref).toBe(200)
    }
    const only = await body(await ayah(req('/x?translations=bangla'), ctx('ref', '1:1')))
    expect(Object.keys(only.ayahs[0].translations)).toEqual(['bangla'])
    expect(only.ayahs[0].uccharon).toBeUndefined()
  })

  it('ayah: real 404 / 400', async () => {
    for (const ref of ['2:287', '115:1', '0:1', '2:0', 'abc', '2:10-5']) expect((await ayah(req('/x'), ctx('ref', ref))).status, ref).toBe(404)
    expect((await ayah(req('/x'), ctx('ref', '2:1-100'))).status).toBe(400)
    const bad = await ayah(req('/x?translations=klingon'), ctx('ref', '1:1'))
    expect(bad.status).toBe(400)
    expect((await bad.json()).error.code).toBe('bad_request')
  })

  it('surah by number and by name; 404 for unknown', async () => {
    const b = await body(await surah(req('/x'), ctx('id', '67')))
    expect(b).toMatchObject({ id: 67, slug: 'al-mulk', versesCount: 30, revelationPlace: 'makkah', juz: { from: 29, to: 29 } })
    expect(b.url).toMatch(CANON)
    expect((await body(await surah(req('/x'), ctx('id', 'baqarah')))).id).toBe(2)
    for (const id of ['0', '115', 'not-a-surah']) expect((await surah(req('/x'), ctx('id', id))).status).toBe(404)
    expect((await body(surahs())).surahs).toHaveLength(114)
  })

  it('search: validates q, lang and clamps limit', async () => {
    const b = await body(await searchRoute(req('/api/v1/search?q=mercy&limit=3')))
    expect(b.results).toHaveLength(3)
    expect(b.results[0].url).toMatch(/\/surah\/[a-z-]+\/\d+$/)
    expect((await body(await searchRoute(req('/api/v1/search?q=mercy&limit=999')))).results.length).toBeLessThanOrEqual(50)
    expect((await searchRoute(req('/api/v1/search?q=a'))).status).toBe(400)
    expect((await searchRoute(req('/api/v1/search'))).status).toBe(400)
    expect((await searchRoute(req('/api/v1/search?q=mercy&lang=fr'))).status).toBe(400)
    const bn = await body(await searchRoute(req(`/api/v1/search?q=${encodeURIComponent('ধৈর্য')}&lang=bn`)))
    expect(bn.total).toBeGreaterThan(0)
    expect(bn.results[0].saheeh).toBeUndefined()
  })

  it('duas: list, search, category filter, single, 404', async () => {
    const all = await body(await duasRoute(req('/api/v1/duas')))
    expect(all.total).toBeGreaterThanOrEqual(80)
    expect(all.categories.length).toBeGreaterThan(5)
    const q = await body(await duasRoute(req('/api/v1/duas?q=anxiety')))
    expect(q.results[0].slug).toMatch(/anxiety|distress|worry|hamm/)
    const sleep = await body(await duasRoute(req('/api/v1/duas?category=sleep')))
    expect(sleep.results.every((d: any) => d.category.id === 'sleep')).toBe(true)
    expect((await duasRoute(req('/api/v1/duas?category=nope'))).status).toBe(400)
    const one = await body(await dua(req('/x'), ctx('slug', 'dua-for-anxiety')))
    expect(one).toMatchObject({ slug: 'dua-for-anxiety', source: expect.any(String) })
    expect(one.arabic).toMatch(/[؀-ۿ]{3,}/)
    expect(one.url).toMatch(/\/dua\/dua-for-anxiety$/)
    expect((await dua(req('/x'), ctx('slug', 'nope'))).status).toBe(404)
  })

  it('topics + names', async () => {
    expect((await body(topicsRoute())).total).toBeGreaterThanOrEqual(40)
    const t = await body(await topic(req('/x'), ctx('slug', 'patience')))
    expect(t.quickAnswer).toMatch(/^The Quran speaks about patience/)
    expect(t.verses.length).toBeGreaterThan(2)
    const tbn = await body(await topic(req('/x?lang=bn'), ctx('slug', 'patience')))
    expect(tbn.quickAnswer).toMatch(/[ঀ-৿]/)
    expect((await topic(req('/x'), ctx('slug', 'Patience Please'))).status).toBe(404)
    expect((await topic(req('/x'), ctx('slug', 'pat'))).status).toBe(404) // exact slugs only on the REST API
    expect((await body(namesRoute())).names).toHaveLength(99)
    expect((await body(await name(req('/x'), ctx('id', '99')))).number).toBe(99)
    expect((await body(await name(req('/x'), ctx('id', 'al-ghafur')))).number).toBeGreaterThan(1)
    for (const id of ['0', '100', 'zzz']) expect((await name(req('/x'), ctx('id', id))).status, id).toBe(404)
  })

  it('OPTIONS preflight + openapi.json is valid OpenAPI 3.1 covering every route', async () => {
    const o = OPTIONS()
    expect(o.status).toBe(204)
    expect(o.headers.get('access-control-allow-origin')).toBe('*')
    const spec = await (openapi()).json()
    expect(spec.openapi).toBe('3.1.0')
    for (const p of ['/api/v1/ayah/{ref}', '/api/v1/surah/{id}', '/api/v1/search', '/api/v1/duas', '/api/v1/duas/{slug}', '/api/v1/topics/{slug}', '/api/v1/names']) expect(spec.paths[p], p).toBeDefined()
    // every $ref resolves
    const refs = [...JSON.stringify(spec).matchAll(/"\$ref":"#\/components\/schemas\/(\w+)"/g)].map((m) => m[1])
    for (const r of refs) expect(spec.components.schemas[r], r).toBeDefined()
  })
})
