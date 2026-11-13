import { describe, it, expect } from 'vitest'
import { CalculationMethod } from 'adhan'
import { bdCities, bnGenitive, cities, cityBySlug, countries, distanceKm, divisionalCities, nearbyCities, qiblaFor, resolveCity, worldCities, METHOD_NAMES } from '@/lib/places/cities'

const BANGLA = /^[\u0980-\u09FF\u200c\u200d\s.,-]+$/

describe('data/places/cities.json', () => {
  it('has the 64 districts of Bangladesh, 8 divisional cities and 80+ world cities', () => {
    expect(bdCities).toHaveLength(64)
    expect(divisionalCities.map((c) => c.slug).sort()).toEqual(['barishal', 'chattogram', 'dhaka', 'khulna', 'mymensingh', 'rajshahi', 'rangpur', 'sylhet'])
    expect(worldCities.length).toBeGreaterThanOrEqual(80)
  })

  it('has unique slugs, valid shapes and Bangla names (Bangladesh)', () => {
    expect(new Set(cities.map((c) => c.slug)).size).toBe(cities.length)
    for (const c of cities) {
      expect(c.slug, c.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(c.name.en.length, c.slug).toBeGreaterThan(1)
      expect(c.name.bn.length, c.slug).toBeGreaterThan(1)
      expect(countries[c.country], `${c.slug} country ${c.country}`).toBeTruthy()
      expect(Math.abs(c.lat)).toBeLessThanOrEqual(90)
      expect(Math.abs(c.lng)).toBeLessThanOrEqual(180)
      expect(() => new Intl.DateTimeFormat('en', { timeZone: c.tz }), `${c.slug} ${c.tz}`).not.toThrow()
      expect((CalculationMethod as Record<string, unknown>)[c.method], `${c.slug} method ${c.method}`).toBeTypeOf('function')
      expect(METHOD_NAMES[c.method], c.slug).toBeTruthy()
      expect(['shafi', 'hanafi']).toContain(c.madhab)
    }
    for (const c of bdCities) expect(c.name.bn, c.slug).toMatch(BANGLA)
  })

  it('Bangladesh / India / Pakistan default to Karachi + Hanafi; Saudi to Umm al-Qura; North America to ISNA', () => {
    for (const c of cities.filter((c) => ['BD', 'IN', 'PK'].includes(c.country))) expect([c.method, c.madhab], c.slug).toEqual(['Karachi', 'hanafi'])
    for (const c of cities.filter((c) => c.country === 'SA')) expect(c.method).toBe('UmmAlQura')
    for (const c of cities.filter((c) => ['US', 'CA'].includes(c.country))) expect(c.method).toBe('NorthAmerica')
    expect(cityBySlug('istanbul')?.method).toBe('Turkey')
    expect(cityBySlug('cairo')?.method).toBe('Egyptian')
    expect(cityBySlug('kuala-lumpur')?.method).toBe('Singapore')
    expect(cityBySlug('london')?.method).toBe('MuslimWorldLeague')
  })

  it('coordinates and zones match known values', () => {
    const near = (slug: string, lat: number, lng: number, tz: string, tol = 0.35) => {
      const c = cityBySlug(slug)!
      expect(c, slug).toBeTruthy()
      expect(Math.abs(c.lat - lat), `${slug} lat`).toBeLessThan(tol)
      expect(Math.abs(c.lng - lng), `${slug} lng`).toBeLessThan(tol)
      expect(c.tz).toBe(tz)
    }
    near('dhaka', 23.81, 90.41, 'Asia/Dhaka', 0.2)
    near('chattogram', 22.36, 91.78, 'Asia/Dhaka')
    near('coxs-bazar', 21.43, 92.0, 'Asia/Dhaka')
    near('sylhet', 24.9, 91.87, 'Asia/Dhaka')
    near('rajshahi', 24.37, 88.6, 'Asia/Dhaka')
    near('khulna', 22.82, 89.55, 'Asia/Dhaka')
    near('makkah', 21.42, 39.83, 'Asia/Riyadh')
    near('madinah', 24.47, 39.61, 'Asia/Riyadh')
    near('london', 51.51, -0.13, 'Europe/London')
    near('new-york', 40.71, -74.0, 'America/New_York')
    near('istanbul', 41.01, 28.97, 'Europe/Istanbul')
    near('jakarta', -6.2, 106.85, 'Asia/Jakarta')
    near('sydney', -33.87, 151.21, 'Australia/Sydney')
    near('karachi', 24.86, 67.01, 'Asia/Karachi')
    near('delhi', 28.65, 77.23, 'Asia/Kolkata')
    near('cairo', 30.06, 31.25, 'Africa/Cairo')
  })

  it('includes the key Bangla names from the brief', () => {
    expect(cityBySlug('dhaka')!.name.bn).toBe('ঢাকা')
    expect(cityBySlug('chattogram')!.name.bn).toBe('চট্টগ্রাম')
    expect(cityBySlug('coxs-bazar')!.name.bn).toBe('কক্সবাজার')
    for (const s of ['makkah', 'madinah', 'riyadh', 'jeddah', 'dubai', 'abu-dhabi', 'doha', 'kuwait-city', 'muscat', 'manama', 'cairo', 'istanbul', 'karachi', 'lahore', 'islamabad', 'delhi', 'mumbai', 'kolkata', 'hyderabad', 'kuala-lumpur', 'jakarta', 'singapore', 'london', 'birmingham', 'manchester', 'new-york', 'toronto', 'sydney', 'melbourne', 'paris', 'berlin', 'rome', 'johannesburg', 'lagos', 'nairobi', 'tokyo', 'seoul', 'beijing']) {
      expect(cityBySlug(s), s).toBeTruthy()
    }
  })

  it('resolves old spellings through aliases', () => {
    expect(resolveCity('chittagong')?.slug).toBe('chattogram')
    expect(resolveCity('comilla')?.slug).toBe('cumilla')
    expect(resolveCity('mecca')?.slug).toBe('makkah')
    expect(resolveCity('nowhere')).toBeNull()
  })

  it('Bangla possessives', () => {
    expect(bnGenitive('ঢাকা')).toBe('ঢাকার')
    expect(bnGenitive('সিলেট')).toBe('সিলেটের')
    expect(bnGenitive('নওগাঁ')).toBe('নওগাঁর')
    expect(bnGenitive('কায়রো')).toBe('কায়রোর')
    expect(bnGenitive('ফেনী')).toBe('ফেনীর')
  })

  it('nearby cities stay in the country and are sorted by distance; Qibla is sane', () => {
    const d = cityBySlug('dhaka')!
    const n = nearbyCities(d, 6)
    expect(n).toHaveLength(6)
    expect(n.every((c) => c.country === 'BD')).toBe(true)
    expect(n.map((c) => distanceKm(d, c))).toEqual([...n.map((c) => distanceKm(d, c))].sort((a, b) => a - b))
    const q = qiblaFor(d)
    expect(q.bearing).toBeGreaterThan(275)
    expect(q.bearing).toBeLessThan(280)
    expect(q.distanceKm).toBeGreaterThan(4800)
    expect(q.distanceKm).toBeLessThan(5250)
    expect(qiblaFor(cityBySlug('london')!).bearing).toBeGreaterThan(115)
  })
})
