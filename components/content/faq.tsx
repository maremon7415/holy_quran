import { ChevronDown } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'
import { faqLd } from '@/lib/content/seo'
import type { Locale } from '@/lib/i18n/routes'

const TITLE = { en: 'Frequently asked questions', bn: 'সচরাচর জিজ্ঞাসা', ar: 'أسئلة شائعة' } as const

/** Visible FAQ accordion (native <details>, works without JS) + FAQPage JSON-LD. */
export function Faq({ faqs, title, locale }: { faqs: { q: string; a: string }[]; title?: string; locale?: Locale }) {
  return (
    <section aria-labelledby="faq-h" className="mt-12">
      <JsonLd data={faqLd(faqs, locale)} />
      <h2 id="faq-h" className="font-display mb-4 text-2xl font-semibold">{title ?? TITLE[locale ?? 'en']}</h2>
      <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
        {faqs.map((f) => (
          <details key={f.q} className="group px-5 py-4 open:bg-accent/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold">
              <span>{f.q}</span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
