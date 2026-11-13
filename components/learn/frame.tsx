import Link from 'next/link'
import type { ReactNode } from 'react'
import { Breadcrumbs, type Crumb } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { CiteThis } from '@/components/seo/cite-this'
import { Faq } from '@/components/content/faq'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { ScholarNote } from './ui'
import { articleLd } from '@/lib/content/seo'
import { absoluteUrl } from '@/lib/site'
import { lt } from '@/lib/i18n/lt'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { Labelled } from '@/lib/i18n/labelled'
import type { L } from '@/data/learn/types'

export interface GuideFrameProps {
  locale: Locale
  /** English path, e.g. /learn/salah */
  path: string
  crumbs: Crumb[]
  headline: string
  description: string
  keywords?: string[]
  hero: { eyebrow: ReactNode; icon: string; title: ReactNode; subtitle?: ReactNode; arabic?: string }
  /** extra JSON-LD nodes (HowTo, CollectionPage, …) */
  ld?: Record<string, unknown>[]
  faqs: { q: string; a: string }[]
  /** jump links */
  toc?: { id: string; label: L }[]
  scholar?: boolean
  citeNote?: string
  children: ReactNode
}

/** Shared frame for every /learn page: JSON-LD, breadcrumbs, hero, jump links, FAQ, scholar note and cite block. */
export function GuideFrame({ locale, path, crumbs, headline, description, keywords, hero, ld = [], faqs, toc, scholar = true, citeNote, children }: GuideFrameProps) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const image = bn ? '/bn/opengraph-image' : '/opengraph-image'
  return (
    <div className={pageShell}>
      <JsonLd data={[articleLd({ headline, description, path: h(path), image, keywords, inLanguage: bn ? 'bn' : undefined, about: 'Islamic education' }), ...ld]} />
      <Breadcrumbs locale={locale} items={crumbs} className="mb-4" />
      <PageHero eyebrow={hero.eyebrow} icon={hero.icon} title={hero.title} subtitle={hero.subtitle} arabic={hero.arabic} />
      {toc && toc.length > 0 && (
        <Labelled as="nav" label={{ en: 'On this page', bn: 'এই পাতায়', ar: 'في هذه الصفحة' }} className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {toc.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="shrink-0 rounded-full border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
              {lt(locale, t.label)}
            </a>
          ))}
        </Labelled>
      )}
      {children}
      {scholar && <ScholarNote locale={locale} />}
      <Faq faqs={faqs} locale={locale} />
      <CiteThis locale={locale} title={headline} note={citeNote} url={absoluteUrl(h(path))} />
      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-muted-foreground">
        <Link href={h('/learn')} className="font-semibold text-primary hover:underline"><span className="inline-block rtl:rotate-180">←</span> {lt(locale, { en: 'All learning guides', bn: 'সব শিক্ষা-গাইড', ar: 'كل الأدلة التعليمية' })}</Link>
        <a href={`${h(path)}.md`} className="hover:text-foreground" rel="alternate" type="text/markdown">{lt(locale, { en: 'Markdown version', bn: 'মার্কডাউন সংস্করণ', ar: 'نسخة Markdown' })}</a>
      </p>
    </div>
  )
}
