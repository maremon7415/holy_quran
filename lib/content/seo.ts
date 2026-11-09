import type { Metadata } from 'next'
import { absoluteUrl, site } from '@/lib/site'

type Json = Record<string, unknown>

export const publisherLd = {
  '@type': 'Organization',
  name: site.name,
  url: site.url,
  logo: { '@type': 'ImageObject', url: absoluteUrl('/logo_tab.png') },
}

export function breadcrumbLd(items: { name: string; href: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.href) })),
  }
}

export function faqLd(faqs: { q: string; a: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

export function articleLd(a: { headline: string; description: string; path: string; inLanguage?: string[]; about?: string; datePublished?: string; keywords?: string[] }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(a.path) },
    url: absoluteUrl(a.path),
    inLanguage: a.inLanguage ?? ['en', 'bn', 'ar'],
    ...(a.about ? { about: { '@type': 'Thing', name: a.about } } : {}),
    ...(a.keywords ? { keywords: a.keywords.join(', ') } : {}),
    image: absoluteUrl(`${a.path}/opengraph-image`),
    author: publisherLd,
    publisher: publisherLd,
    datePublished: a.datePublished ?? '2025-01-01',
    dateModified: new Date().toISOString().slice(0, 10),
  }
}

export function howToLd(h: { name: string; description: string; path: string; steps: { name: string; text: string }[] }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: h.name,
    description: h.description,
    url: absoluteUrl(h.path),
    step: h.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
  }
}

export function collectionLd(c: { name: string; description: string; path: string; items: { name: string; href: string }[] }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: c.name,
    description: c.description,
    url: absoluteUrl(c.path),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: c.items.length,
      itemListElement: c.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absoluteUrl(it.href) })),
    },
  }
}

/** Trim to a search-snippet friendly length without cutting words. */
export function clip(s: string, max = 158) {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

/** Metadata helper: canonical, OG and Twitter all consistent. */
export function buildMeta(m: { title: string; description: string; path: string; keywords?: string[]; noindex?: boolean; type?: 'website' | 'article' }): Metadata {
  return {
    title: { absolute: m.title },
    description: m.description,
    keywords: m.keywords,
    alternates: { canonical: m.path },
    openGraph: { type: m.type ?? 'website', siteName: site.name, title: m.title, description: m.description, url: absoluteUrl(m.path), locale: site.locale, alternateLocale: [...site.alternateLocales] },
    twitter: { card: 'summary_large_image', title: m.title, description: m.description },
    ...(m.noindex ? { robots: { index: false, follow: true } } : {}),
  }
}

/** "Ayatul Kursi (Quran 2:255)" stays whole; "Title: subtitle" and "Title — subtitle" are cut at the separator. */
export const shortTitle = (t: string) => t.split(/:\s| — /)[0].trim()
