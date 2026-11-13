import { describe, it, expect } from 'vitest'
import { GET as list } from '@/app/api/v1/events/route'
import { GET as one } from '@/app/api/v1/events/[slug]/route'
import { eventJson, eventsListJson, resolveEventName, today } from '@/lib/events/service'
import { markdownFor } from '@/lib/api/markdown'
import { openApiSpec } from '@/lib/api/openapi'

const req = (q = '') => new Request(`http://localhost/api/v1/events${q}`)
const ctx = (slug: string) => ({ params: Promise.resolve({ slug }) })
const Y = today().y
const body = async (r: Response) => (await r.json()) as any

describe('resolveEventName', () => {
  it('matches slugs, English / Bangla / Arabic names and spellings', () => {
    const cases: [string, string][] = [
      ['eid-al-adha', 'eid-al-adha'], ['Eid ul Adha', 'eid-al-adha'], ['Eid al-Adha', 'eid-al-adha'], ['Bakrid', 'eid-al-adha'], ['ঈদুল আজহা', 'eid-al-adha'], ['عيد الأضحى', 'eid-al-adha'],
      ['Eid ul Fitr', 'eid-al-fitr'], ['ঈদুল ফিতর', 'eid-al-fitr'], ['Laylatul Qadr', 'laylatul-qadr'], ['শবে কদর', 'laylatul-qadr'], ['Night of Power', 'laylatul-qadr'],
      ['Ramadan', 'ramadan-start'], ['রমজান', 'ramadan-start'], ['Arafah', 'day-of-arafah'], ['Day of Arafah', 'day-of-arafah'], ['Ashura', 'ashura'], ['আশুরা', 'ashura'],
      ['Islamic New Year', 'islamic-new-year'], ['1 Muharram', 'islamic-new-year'], ['white days', 'white-days'], ['Ayyam al-Bid', 'white-days'],
    ]
    for (const [q, slug] of cases) expect(resolveEventName(q), q).toBe(slug)
    expect(resolveEventName('banana')).toBeNull()
    expect(resolveEventName('')).toBeNull()
  })
})

describe('/api/v1/events', () => {
  it('lists the next 12 months with both Saudi and expected Bangladesh dates and the moon-sighting note', async () => {
    const d = await body(await list(req()))
    expect(d.events.length).toBeGreaterThan(6)
    expect(d.note).toMatch(/moon sighting/)
    for (const e of d.events) {
      expect(e.saudi.start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(e.bangladeshExpected.start > e.saudi.start).toBe(true)
      expect(e.url).toMatch(/\/events\/[a-z-]+\/\d{4}$/)
    }
  })
  it('one event by name and year; Bangladesh = Saudi + 1', async () => {
    const d = await body(await one(req(`/eid-al-adha?year=${Y + 1}`), ctx('eid-al-adha')))
    expect(d.event).toBe('eid-al-adha')
    expect(d.year).toBe(Y + 1)
    const o = d.occurrences[0]
    expect(new Date(o.bangladeshExpected.headline).getTime() - new Date(o.saudi.headline).getTime()).toBe(864e5)
    expect(d.url).toContain(`/events/eid-al-adha/${Y + 1}`)
    expect(d.urlBn).toContain(`/bn/events/eid-al-adha/${Y + 1}`)
    expect(d.citation).toContain(d.url)
    expect(d.hadith.length).toBeGreaterThan(0)
    const viaName = await body(await one(req('/x'), ctx(encodeURIComponent('Eid ul Adha'))))
    expect(viaName.event).toBe('eid-al-adha')
    expect(viaName.year).toBeNull()
    const q = await body(await list(req('?event=ashura')))
    expect(q.event).toBe('ashura')
  })
  it('errors: unknown event 404, bad year 400, out-of-range year 404', async () => {
    expect((await one(req('/nope'), ctx('nope'))).status).toBe(404)
    expect((await one(req('/ashura?year=abc'), ctx('ashura'))).status).toBe(400)
    expect((await one(req(`/ashura?year=${Y + 5}`), ctx('ashura'))).status).toBe(404)
    expect((await one(req(`/ashura?year=${Y - 2}`), ctx('ashura'))).status).toBe(404)
    expect((await list(req(`?year=${Y + 5}`))).status).toBe(404)
    expect((await list(req('?event=zzz'))).status).toBe(404)
    expect(eventJson('ashura', Y + 4)).not.toBeNull()
    expect(eventJson('ashura', Y + 5)).toBeNull()
    expect(eventsListJson(Y - 1)).not.toBeNull()
  })
  it('is documented in openapi', () => {
    const spec = openApiSpec() as any
    expect(spec.paths['/api/v1/events']).toBeDefined()
    expect(spec.paths['/api/v1/events/{slug}']).toBeDefined()
    expect(spec.components.schemas.IslamicEvent).toBeDefined()
  })
})

describe('markdown alternates', () => {
  it('hub, event and year pages, en + bn; out-of-range → null', async () => {
    const hub = await markdownFor('/events')
    expect(hub?.body).toMatch(/Bangladesh \(expected/)
    const ev = await markdownFor('/events/eid-al-adha')
    expect(ev?.body).toMatch(/^# Eid ul Adha/)
    const yr = await markdownFor(`/events/laylatul-qadr/${Y + 1}`)
    expect(yr?.canonical).toContain(`/events/laylatul-qadr/${Y + 1}`)
    expect(yr?.body).toContain('Quran 97:1-5')
    const bn = await markdownFor(`/bn/events/eid-al-adha/${Y + 1}`)
    expect(bn?.body).toMatch(/ঈদুল আজহা/)
    expect(bn?.canonical).toContain('/bn/events/')
    expect(await markdownFor(`/events/ashura/${Y + 9}`)).toBeNull()
    expect(await markdownFor('/events/nope')).toBeNull()
  })
})
