import type { ReactNode } from 'react'
import { FaqList } from '@/components/content/faq-list'
import { JsonLd } from '@/components/seo/json-ld'
import { faqLd } from '@/lib/content/seo'
import type { Locale } from '@/lib/i18n/routes'
import { T } from '@/lib/i18n/text'

const TITLE = { en: 'Frequently asked questions', bn: 'সচরাচর জিজ্ঞাসা', ar: 'أسئلة شائعة' } as const

/** Visible FAQ accordion (native <details>, works without JS) + FAQPage JSON-LD. */
export function Faq({ faqs, title, locale, items }: { faqs: { q: string; a: string }[]; title?: string; locale?: Locale; /** replaces the visible list (the JSON-LD still comes from `faqs`) */ items?: ReactNode }) {
  return (
    <section aria-labelledby="faq-h" className="mt-12">
      <JsonLd data={faqLd(faqs, locale)} />
      <h2 id="faq-h" className="font-display mb-4 text-2xl font-semibold">{title ?? (locale === 'bn' ? TITLE.bn : <T {...TITLE} />)}</h2>
      {items ?? <FaqList faqs={faqs} />}
    </section>
  )
}
