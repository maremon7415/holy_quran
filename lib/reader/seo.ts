import { absoluteUrl, site } from '@/lib/site'

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
})

export const quranBookLd = () => ({
  '@type': 'Book',
  name: 'The Holy Quran',
  alternateName: ['Al-Quran', 'القرآن الكريم', 'আল কুরআন'],
  inLanguage: 'ar',
  url: absoluteUrl('/quran'),
})

export const publisherLd = () => ({ '@type': 'Organization', name: site.name, url: site.url })
