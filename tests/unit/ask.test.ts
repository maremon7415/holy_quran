import { describe, it, expect, afterEach } from 'vitest'
import header from '@/data/quran/embeddings.json'
import { askQuran, askApi, loadIndex } from '@/lib/ask'
import { setEmbedder } from '@/lib/ask/embed'
import { ayahKeys, cosineAll, decodeIndex, decodeQueryVector, encodeQueryVector, normalize, rowOf, topK } from '@/lib/ask/vectors'
import { contentTerms, looksLikeQuestion, matchTopics, prepareAyahText, stemBn, stemEn } from '@/lib/ask/text'
import { groupConsecutive, rank, type Scored } from '@/lib/ask/rank'
import { topics } from '@/data/content/topics'
import { useFakeEmbedder, restoreEmbedder, vectorOf } from '../helpers/fake-embedder'
import { GET as askRoute } from '@/app/api/ask/route'
import { GET as v1Ask } from '@/app/api/v1/ask/route'
import { GET as vectorsRoute } from '@/app/ask/embeddings.bin/route'

afterEach(restoreEmbedder)

describe('ask: precomputed vectors', () => {
  it('header matches the binary and the corpus', async () => {
    expect(header.count).toBe(6236)
    expect(ayahKeys()).toHaveLength(6236)
    expect(rowOf(1, 1)).toBe(0)
    expect(rowOf(114, 6)).toBe(6235)
    expect(ayahKeys()[rowOf(2, 255)]).toBe('2:255')
    const idx = await loadIndex()
    expect(idx.dims).toBe(header.dims)
    expect(idx.q8.length).toBe(header.dims * header.count)
    expect(() => decodeIndex(new Uint8Array(10), header)).toThrow(/size/)
  })

  it('every stored vector is unit length (int8 dequantisation error < 1%) and is its own nearest neighbour', async () => {
    const idx = await loadIndex()
    for (const key of ['1:1', '2:255', '94:5', '114:6']) {
      const v = await vectorOf(key)
      const n = Math.hypot(...v)
      expect(Math.abs(n - 1)).toBeLessThan(0.01)
      const s = cosineAll(idx, normalize(v))
      expect(ayahKeys()[topK(s, 1)[0]]).toBe(key)
    }
  })

  it('query vectors survive the ?qv= transport', () => {
    const v = normalize(Array.from({ length: header.dims }, (_, i) => Math.sin(i)))
    const qv = encodeQueryVector(v)
    expect(qv).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(qv.length).toBeLessThan(header.dims * 1.4 + 10)
    const back = decodeQueryVector(qv, header.dims)!
    let dot = 0
    for (let i = 0; i < v.length; i++) dot += v[i] * back[i]
    expect(dot).toBeGreaterThan(0.999)
    expect(decodeQueryVector('not valid!', header.dims)).toBeNull()
    expect(decodeQueryVector(qv.slice(0, 20), header.dims)).toBeNull()
  })

  it('topK returns the largest scores in order', () => {
    const s = Float32Array.from([0.1, 0.9, 0.3, 0.95, 0.2, 0.5])
    expect(topK(s, 3)).toEqual([3, 1, 5])
    expect(topK(s, 10)).toHaveLength(6)
  })

  it('static vector route serves the binary', async () => {
    const r = await vectorsRoute()
    expect(r.headers.get('content-type')).toBe('application/octet-stream')
    expect((await r.arrayBuffer()).byteLength).toBe(header.bytes)
  })
})

describe('ask: lexical signals', () => {
  it('extracts content words and stems (en / bn / ar)', () => {
    expect(contentTerms('What does Allah say about people who are patient in hardship?').map((t) => t.raw)).toEqual(['patient', 'hardship'])
    expect(stemEn('patience')).toBe(stemEn('patient'))
    expect(stemEn('parents')).toBe('parent')
    expect(contentTerms('বাবা-মায়ের সাথে আচরণ নিয়ে কুরআনে কী আছে').map((t) => t.raw)).toEqual(['বাবা', 'মায়ের', 'আচরণ'])
    expect(stemBn('ধৈর্যশীলদের')).toBe('ধৈর্যশীল')
    expect(contentTerms('ما جزاء الصابرين').map((t) => t.stem)).toEqual(['جزاء', 'صابرين'])
  })

  it('matches curated topics from a natural question', () => {
    expect(matchTopics('what does the Quran say about patience?', topics)[0]?.slug).toBe('patience')
    expect(matchTopics('how should I treat my parents', topics).map((t) => t.slug)).toContain('parents')
    expect(matchTopics('দান-সদকা করার পুরস্কার কী', topics).map((t) => t.slug)).toContain('charity')
    expect(matchTopics('the', topics)).toEqual([])
  })

  it('looksLikeQuestion: ≥ 4 words or a question mark, not references', () => {
    expect(looksLikeQuestion('what does Allah say about patience')).toBe(true)
    expect(looksLikeQuestion('patience?')).toBe(true)
    expect(looksLikeQuestion('ধৈর্য কী?')).toBe(true)
    expect(looksLikeQuestion('patience')).toBe(false)
    expect(looksLikeQuestion('mercy of Allah')).toBe(false)
    expect(looksLikeQuestion('2:255 ayatul kursi verse')).toBe(false)
  })

  it('groups consecutive ayahs into ranges, best first', () => {
    const h = (key: string, score: number): Scored => { const [s, a] = key.split(':').map(Number); return { row: rowOf(s, a), key, surah: s, ayah: a, score, semantic: score, words: [], topics: [] } }
    const g = groupConsecutive([h('2:156', 0.9), h('39:10', 0.85), h('2:155', 0.8), h('2:157', 0.7), h('3:1', 0.6)])
    expect(g.map((x) => x.ref)).toEqual(['2:155-157', '39:10', '3:1'])
    expect(g[0].score).toBe(0.9)
    // surah boundaries never merge (2:286 + 3:1 are adjacent rows)
    expect(groupConsecutive([h('2:286', 0.9), h('3:1', 0.8)]).map((x) => x.ref)).toEqual(['2:286', '3:1'])
  })

  it('rank boosts topic and word matches on top of the cosine', () => {
    const semantic = new Float32Array(6236).fill(0.5)
    const prepared = prepareAyahText({ en: 'The patient will be rewarded', bn: '' })
    const text = () => prepared
    const terms = contentTerms('patient people')
    const out = rank({ semantic, terms, script: 'en', text, topics: [{ slug: 'patience', title: { en: 'patience', bn: 'ধৈর্য' }, strength: 1, refs: ['39:10'] }] }, 3)
    expect(out[0].key).toBe('39:10')
    expect(out[0].topics).toEqual(['patience'])
    expect(out[0].words).toEqual(['patient'])
  })
})

describe('askQuran (fake embedder)', () => {
  const Q = 'what does Allah say about people who are patient in hardship?'

  it('semantic mode: the closest ayah ranks first, with Arabic, translation, why and canonical links', async () => {
    useFakeEmbedder({ [Q]: '2:153' })
    const r = await askQuran(Q, { limit: 10 })
    expect(r.mode).toBe('semantic')
    expect(r.note).toBeUndefined()
    expect(r.results.length).toBeGreaterThan(3)
    expect(r.results.length).toBeLessThanOrEqual(10)
    const first = r.results[0]
    expect(first.surah).toBe(2)
    expect(first.from).toBeLessThanOrEqual(153)
    expect(first.to).toBeGreaterThanOrEqual(153)
    expect(first.ayahs.find((a) => a.key === '2:153')!.arabic).toMatch(/[؀-ۿ]{3,}/)
    expect(first.href).toBe('/surah/al-baqarah#ayah-' + first.from)
    expect(first.url).toMatch(/\/surah\/al-baqarah\/\d+$/)
    expect(first.citation).toContain(first.url)
    expect(first.why.words).toContain('patient')
    for (const g of r.results) expect(g.score).toBeGreaterThanOrEqual(r.results.at(-1)!.score)
  })

  it('Bangla questions return Bangla + uccharon', async () => {
    useFakeEmbedder({}, '17:23')
    const r = await askQuran('বাবা-মায়ের সাথে আচরণ নিয়ে কুরআনে কী আছে', { limit: 5 })
    expect(r.lang).toBe('bn')
    const g = r.results.find((x) => x.surah === 17 && x.from <= 23 && x.to >= 23)!
    expect(g).toBeTruthy()
    expect(g.ayahs[0].bn).toMatch(/[ঀ-৿]/)
    expect(g.ayahs[0].uccharon).toMatch(/[ঀ-৿]/)
    expect(r.results.some((x) => x.why.topics.some((t) => t.slug === 'parents'))).toBe(true)
  })

  it('degrades to lexical ranking (no throw) when the model cannot load', async () => {
    setEmbedder(async () => { throw new Error('offline') })
    const r = await askQuran(Q)
    expect(r.mode).toBe('lexical')
    expect(r.note).toMatch(/unavailable/i)
    expect(r.results.length).toBeGreaterThan(0)
    expect(r.results[0].similarity).toBe(0)
  })

  it('uses a client-computed ?qv= vector instead of the server model', async () => {
    setEmbedder(async () => { throw new Error('no server model') })
    const qv = encodeQueryVector(await vectorOf('94:5'))
    const r = await askQuran('will things get easier', { queryVector: qv })
    expect(r.mode).toBe('semantic')
    expect(r.results.slice(0, 3).some((g) => g.surah === 94)).toBe(true)
  })

  it('askApi carries urls, citations and the language filter', async () => {
    useFakeEmbedder({}, '39:53')
    const r = await askApi('can Allah forgive all my sins', { lang: 'en', limit: 5 })
    expect(r.results[0].reference).toBe('39:53')
    expect(r.results[0].ayahs[0].saheeh).toMatch(/despair/)
    expect(r.results[0].ayahs[0]).not.toHaveProperty('bangla')
    expect(r.results[0].url).toMatch(/^https?:\/\/[^/]+\/surah\/az-zumar\/53$/)
    expect(r.results[0].urlBn).toMatch(/\/bn\/surah\/az-zumar\/53$/)
    expect(r.askPage).toMatch(/\/ask\?q=/)
  })
})

describe('/api/ask + /api/v1/ask', () => {
  const req = (p: string) => new Request(`http://localhost${p}`)
  it('/api/ask validates input and returns results with cache headers', async () => {
    useFakeEmbedder({}, '13:28')
    expect((await askRoute(req('/api/ask?q=a'))).status).toBe(400)
    expect((await askRoute(req(`/api/ask?q=${'x'.repeat(301)}`))).status).toBe(400)
    const r = await askRoute(req('/api/ask?q=how%20can%20my%20heart%20find%20peace&lang=en'))
    expect(r.status).toBe(200)
    expect(r.headers.get('cache-control')).toMatch(/s-maxage=86400/)
    const b = await r.json()
    expect(b.mode).toBe('semantic')
    expect(b.results[0].ref).toBe('13:28')
  })

  it('/api/ask falls back with a short cache when the model fails', async () => {
    setEmbedder(async () => { throw new Error('down') })
    const r = await askRoute(req('/api/ask?q=patience%20in%20hardship'))
    expect(r.status).toBe(200)
    expect(r.headers.get('cache-control')).toBe('public, s-maxage=60')
    expect((await r.json()).mode).toBe('lexical')
  })

  it('/api/v1/ask: CORS, validation, canonical urls', async () => {
    useFakeEmbedder({}, '65:3')
    const bad = await v1Ask(req('/api/v1/ask?q=trust&lang=fr'))
    expect(bad.status).toBe(400)
    expect((await v1Ask(req('/api/v1/ask'))).status).toBe(400)
    const r = await v1Ask(req('/api/v1/ask?q=what%20happens%20if%20I%20trust%20Allah&limit=3'))
    expect(r.status).toBe(200)
    expect(r.headers.get('access-control-allow-origin')).toBe('*')
    const b = await r.json()
    expect(b.results.length).toBeLessThanOrEqual(3)
    expect(b.results[0].reference).toMatch(/^65:/)
    expect(b.results[0].citation).toContain(b.results[0].url)
    expect(b.method).toMatch(/Cosine/)
  })
})
