import raw from '@/data/places/cities.json'
import { Coordinates, Qibla } from 'adhan'

export type MethodId =
  | 'Karachi' | 'MuslimWorldLeague' | 'Egyptian' | 'UmmAlQura' | 'NorthAmerica' | 'MoonsightingCommittee'
  | 'Dubai' | 'Kuwait' | 'Qatar' | 'Singapore' | 'Turkey' | 'Tehran'

export interface City {
  slug: string
  name: { en: string; bn: string }
  /** ISO 3166-1 alpha-2 */
  country: string
  admin: string | null
  lat: number
  lng: number
  /** IANA time zone */
  tz: string
  /** default calculation method (an adhan CalculationMethod key, same ids as the /prayer-times page) */
  method: MethodId
  /** default Asr convention for the region */
  madhab: 'shafi' | 'hanafi'
  division?: boolean
  aliases?: string[]
  geonamesId: number
}

export const cities = raw.cities as unknown as City[]
export const countries = raw.countries as Record<string, { en: string; bn: string }>

const bySlug = new Map(cities.map((c) => [c.slug, c]))
const byAlias = new Map(cities.flatMap((c) => (c.aliases ?? []).map((a) => [a, c] as const)))

export const cityBySlug = (slug: string) => bySlug.get(slug) ?? null
/** Canonical city for a slug or a known alias (`chittagong` → Chattogram). */
export const resolveCity = (slug: string) => bySlug.get(slug) ?? byAlias.get(slug) ?? null
export const countryName = (cc: string, locale: 'en' | 'bn') => countries[cc]?.[locale] ?? cc
export const bdCities = cities.filter((c) => c.country === 'BD')
export const worldCities = cities.filter((c) => c.country !== 'BD')
export const divisionalCities = bdCities.filter((c) => c.division)

/** Old / alternative English spelling shown next to the name ("Chattogram (Chittagong)"). */
export const altName = (c: City) => {
  const a = c.aliases?.find((x) => /^[a-z]+$/.test(x) && x !== c.slug)
  return a ? a[0].toUpperCase() + a.slice(1) : null
}
export const cityTitle = (c: City, locale: 'en' | 'bn') => {
  if (locale === 'bn') return c.name.bn
  const alt = altName(c)
  return alt ? `${c.name.en} (${alt})` : c.name.en
}

/** Bangla possessive: ঢাকা → ঢাকার, সিলেট → সিলেটের, নওগাঁ → নওগাঁর. */
export function bnGenitive(name: string) {
  if (/[.]$/.test(name)) return `${name}-র`
  if (/[ািীুূেোৌৈঁৃ]$/.test(name) || /[আইঈউঊএঐওঔ]$/.test(name)) return `${name}র`
  return `${name}ের`
}

const R = 6371
const rad = (d: number) => (d * Math.PI) / 180
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const KAABA = { lat: 21.4225, lng: 39.8262 }
/** Qibla bearing (degrees clockwise from true north) and great-circle distance to the Kaaba. */
export function qiblaFor(c: { lat: number; lng: number }) {
  return { bearing: Qibla(new Coordinates(c.lat, c.lng)), distanceKm: distanceKm(c, KAABA) }
}
const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
const POINTS_BN = ['উত্তর', 'উত্তর-উত্তর-পূর্ব', 'উত্তর-পূর্ব', 'পূর্ব-উত্তর-পূর্ব', 'পূর্ব', 'পূর্ব-দক্ষিণ-পূর্ব', 'দক্ষিণ-পূর্ব', 'দক্ষিণ-দক্ষিণ-পূর্ব', 'দক্ষিণ', 'দক্ষিণ-দক্ষিণ-পশ্চিম', 'দক্ষিণ-পশ্চিম', 'পশ্চিম-দক্ষিণ-পশ্চিম', 'পশ্চিম', 'পশ্চিম-উত্তর-পশ্চিম', 'উত্তর-পশ্চিম', 'উত্তর-উত্তর-পশ্চিম']
export const compassPoint = (deg: number, locale: 'en' | 'bn' = 'en') => (locale === 'bn' ? POINTS_BN : POINTS)[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16]

/** Closest other cities: the same country first (nearest first), padded with the nearest elsewhere. */
export function nearbyCities(c: City, n = 8): City[] {
  const others = cities.filter((x) => x.slug !== c.slug)
  const sorted = (l: City[]) => [...l].sort((a, b) => distanceKm(c, a) - distanceKm(c, b))
  const same = sorted(others.filter((x) => x.country === c.country))
  if (same.length >= n) return same.slice(0, n)
  return [...same, ...sorted(others.filter((x) => x.country !== c.country))].slice(0, n)
}

/** Footer / quick-link cities. */
export const POPULAR_SLUGS = ['dhaka', 'chattogram', 'sylhet', 'rajshahi', 'khulna', 'london', 'new-york', 'makkah'] as const

export const METHOD_NAMES: Record<MethodId, { en: string; bn: string; ar: string }> = {
  Karachi: { en: 'University of Islamic Sciences, Karachi', bn: 'করাচি বিশ্ববিদ্যালয়', ar: 'جامعة العلوم الإسلامية، كراتشي' },
  MuslimWorldLeague: { en: 'Muslim World League', bn: 'মুসলিম ওয়ার্ল্ড লিগ', ar: 'رابطة العالم الإسلامي' },
  Egyptian: { en: 'Egyptian General Authority', bn: 'মিসরীয় সাধারণ কর্তৃপক্ষ', ar: 'الهيئة المصرية العامة للمساحة' },
  UmmAlQura: { en: 'Umm al-Qura, Makkah', bn: 'উম্মুল কুরা, মক্কা', ar: 'أم القرى، مكة المكرمة' },
  NorthAmerica: { en: 'ISNA (North America)', bn: 'ISNA (উত্তর আমেরিকা)', ar: 'الجمعية الإسلامية لأمريكا الشمالية' },
  MoonsightingCommittee: { en: 'Moonsighting Committee', bn: 'মুনসাইটিং কমিটি', ar: 'لجنة رؤية الهلال' },
  Dubai: { en: 'Dubai', bn: 'দুবাই', ar: 'دبي' },
  Kuwait: { en: 'Kuwait', bn: 'কুয়েত', ar: 'الكويت' },
  Qatar: { en: 'Qatar', bn: 'কাতার', ar: 'قطر' },
  Singapore: { en: 'Singapore / Malaysia / Indonesia', bn: 'সিঙ্গাপুর / মালয়েশিয়া / ইন্দোনেশিয়া', ar: 'سنغافورة / ماليزيا / إندونيسيا' },
  Turkey: { en: 'Turkey (Diyanet)', bn: 'তুরস্ক (দিয়ানেত)', ar: 'تركيا (الشؤون الدينية)' },
  Tehran: { en: 'Tehran', bn: 'তেহরান', ar: 'طهران' },
}
