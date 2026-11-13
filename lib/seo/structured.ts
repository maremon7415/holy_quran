/**
 * schema.org builders for the AI/SEO upgrade (server + client safe, pure).
 * Kept separate from lib/content/seo.ts / lib/reader/seo.ts so existing builders stay untouched.
 */
import { absoluteUrl, site } from '@/lib/site'
import { chapters, surahHref, surahNamesBn } from '@/lib/quran/chapters'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { QURAN_WIKIDATA, QURAN_WIKIPEDIA, surahSameAs } from './wikidata'

type Json = Record<string, unknown>

export const ORG_ID = `${site.url}/#organization`
export const WEBSITE_ID = `${site.url}/#website`
export const DATASET_ID = `${site.url}/developers#dataset`

export function organizationLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.name,
    alternateName: ['নূর কুরআন', 'نور القرآن'],
    url: site.url,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/logo_tab.png') },
    description: site.description,
    sameAs: [site.github],
  }
}

/** Publisher reference used inside other nodes (by @id so the graph links to the Organization). */
export const publisherRef = () => ({ '@type': 'Organization', '@id': ORG_ID, name: site.name, url: site.url })

export function quranBookRef(locale: Locale = 'en'): Json {
  return {
    '@type': 'Book',
    '@id': `${site.url}/quran#book`,
    name: locale === 'bn' ? 'আল কুরআন' : 'The Holy Quran',
    alternateName: ['Al-Quran', 'القرآن الكريم', 'আল কুরআন'],
    inLanguage: 'ar',
    url: absoluteUrl(localeHref(locale, '/quran')),
    sameAs: [QURAN_WIKIDATA, QURAN_WIKIPEDIA[locale]],
  }
}

/** Chapter node for a surah (with Wikidata / Wikipedia sameAs). */
export function surahChapterRef(id: number, locale: Locale = 'en'): Json {
  const c = chapters[id - 1]
  const sameAs = surahSameAs(id, locale)
  return {
    '@type': 'Chapter',
    '@id': `${absoluteUrl(localeHref(locale, surahHref(id)))}#chapter`,
    name: locale === 'bn' ? `সূরা ${surahNamesBn[id - 1]}` : `Surah ${c.nameSimple}`,
    position: id,
    url: absoluteUrl(localeHref(locale, surahHref(id))),
    isPartOf: quranBookRef(locale),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

/** Ayah as a Quotation: Arabic text, translations, isPartOf the surah, citation, speakable. */
export function ayahQuotationLd(a: {
  surah: number; ayah: number; ar: string; en: string; enH: string; bn: string; locale: Locale; title: string; famous?: string; summary?: string
}): Json {
  const key = `${a.surah}:${a.ayah}`
  const url = absoluteUrl(localeHref(a.locale, surahHref(a.surah, a.ayah)))
  const c = chapters[a.surah - 1]
  return {
    '@context': 'https://schema.org',
    '@type': 'Quotation',
    '@id': `${url}#ayah`,
    name: `Quran ${key}${a.famous ? ` — ${a.famous}` : ''}`,
    headline: a.title,
    text: a.ar,
    inLanguage: 'ar',
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url, url, inLanguage: a.locale, speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.ayah-ar .quran-text', a.locale === 'bn' ? 'figure[data-tr="bn"] blockquote' : 'figure[data-ed="sahih"] blockquote', '#ayah-summary'] } },
    isPartOf: surahChapterRef(a.surah, a.locale),
    position: a.ayah,
    citation: `Quran ${key} (Surah ${c.nameSimple})`,
    ...(a.summary ? { abstract: a.summary } : {}),
    publisher: publisherRef(),
    workTranslation: [
      { '@type': 'CreativeWork', name: 'Saheeh International', inLanguage: 'en', text: a.en },
      { '@type': 'CreativeWork', name: 'M.A.S. Abdel Haleem', inLanguage: 'en', text: a.enH },
      { '@type': 'CreativeWork', name: 'Taisirul Quran', inLanguage: 'bn', text: a.bn },
    ],
  }
}

/** DefinedTermSet for the 99 Names (index page) */
export function namesTermSetLd(locale: Locale, names: { n: number; slug: string; ar: string; tl: string; tlBn: string; en: string; bn: string }[]): Json {
  const url = absoluteUrl(localeHref(locale, '/names-of-allah'))
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${url}#set`,
    name: locale === 'bn' ? 'আল্লাহর ৯৯ নাম (আসমাউল হুসনা)' : 'The 99 Names of Allah (al-Asma al-Husna)',
    url,
    inLanguage: locale,
    publisher: publisherRef(),
    hasDefinedTerm: names.map((n) => ({
      '@type': 'DefinedTerm',
      name: locale === 'bn' ? n.tlBn : n.tl,
      alternateName: n.ar,
      termCode: String(n.n),
      description: locale === 'bn' ? n.bn : n.en,
      url: absoluteUrl(localeHref(locale, `/names-of-allah/${n.slug}`)),
    })),
  }
}

/** DefinedTerm for a single Name page */
export function nameTermLd(locale: Locale, n: { n: number; slug: string; ar: string; tl: string; tlBn: string; en: string; bn: string; expEn: string; expBn: string; ref: string }): Json {
  const url = absoluteUrl(localeHref(locale, `/names-of-allah/${n.slug}`))
  const [s, a] = n.ref.split(':')
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${url}#term`,
    name: locale === 'bn' ? n.tlBn : n.tl,
    alternateName: [n.ar, n.tl, n.tlBn],
    termCode: String(n.n),
    description: locale === 'bn' ? `${n.bn}। ${n.expBn}` : `${n.en}. ${n.expEn}`,
    url,
    inDefinedTermSet: { '@type': 'DefinedTermSet', '@id': `${absoluteUrl(localeHref(locale, '/names-of-allah'))}#set`, name: locale === 'bn' ? 'আল্লাহর ৯৯ নাম' : 'The 99 Names of Allah', url: absoluteUrl(localeHref(locale, '/names-of-allah')) },
    subjectOf: { '@type': 'Quotation', name: `Quran ${n.ref}`, url: absoluteUrl(surahHref(+s, +a.split('-')[0])) },
  }
}

/** Dataset node describing the corpus + API (on /developers). */
export function corpusDatasetLd(locale: Locale): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': DATASET_ID,
    name: locale === 'bn' ? 'নূর কুরআন ডেটাসেট: কুরআন, দোয়া, বিষয় ও আল্লাহর ৯৯ নাম' : 'Noor Quran corpus: Quran, duas, topics and the 99 Names of Allah',
    description: 'All 114 surahs and 6,236 ayahs of the Quran in Uthmani Arabic with Saheeh International and Abdel Haleem English, Taisirul Quran Bangla, English transliteration and Bangla uccharon; 80 authentic duas with sources; 40 Quran topics; the 99 Names of Allah with Quran references. Available as a JSON API, an MCP server for AI agents and markdown pages.',
    url: absoluteUrl(localeHref(locale, '/developers')),
    inLanguage: ['ar', 'en', 'bn'],
    isAccessibleForFree: true,
    keywords: ['Quran', 'Quran API', 'Quran dataset', 'Bangla Quran', 'dua', '99 names of Allah', 'MCP'],
    creator: publisherRef(),
    publisher: publisherRef(),
    isBasedOn: 'https://api-docs.quran.com',
    license: site.github,
    sameAs: [site.github],
    distribution: [
      { '@type': 'DataDownload', name: 'JSON API (OpenAPI 3.1)', encodingFormat: 'application/json', contentUrl: absoluteUrl('/openapi.json') },
      { '@type': 'DataDownload', name: 'Model Context Protocol server', encodingFormat: 'application/json', contentUrl: absoluteUrl('/api/mcp') },
      { '@type': 'DataDownload', name: 'Full plain-text index for LLMs', encodingFormat: 'text/plain', contentUrl: absoluteUrl('/llms-full.txt') },
    ],
  }
}
