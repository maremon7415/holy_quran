import { CopyButton } from '@/components/content/copy-button'
import { UiIcon } from '@/components/ui-icon'
import { citations, type CiteInput } from '@/lib/content/cite'
import type { Locale } from '@/lib/i18n/routes'
import { T } from '@/lib/i18n/text'

const FORMATS = [
  { k: 'plain', en: 'Plain', bn: 'সাধারণ', ar: 'نص عادي' },
  { k: 'apa', en: 'APA', bn: 'APA', ar: 'APA' },
  { k: 'mla', en: 'MLA', bn: 'MLA', ar: 'MLA' },
  { k: 'markdown', en: 'Markdown', bn: 'Markdown', ar: 'Markdown' },
] as const

/**
 * "Cite this" block: canonical URL + copyable citations (plain, APA-like, MLA-like, Markdown link).
 * Server-rendered (strings are in the HTML for crawlers); only the copy buttons hydrate.
 */
export function CiteThis({ locale = 'en', className = '', ...input }: CiteInput & { locale?: Locale; className?: string }) {
  const c = citations(input)
  const bn = locale === 'bn'
  return (
    <section aria-labelledby="cite-h" data-cite className={`mt-12 rounded-3xl border border-border bg-card p-5 sm:p-6 ${className}`}>
      <h2 id="cite-h" className="font-display flex items-center gap-2 text-xl font-semibold">
        <UiIcon name="info" size={22} /> {bn ? 'উদ্ধৃত করুন' : <T en="Cite this" ar="الاستشهاد بهذه الصفحة" />}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {bn ? 'স্থায়ী লিংক' : <T en="Permanent link" ar="الرابط الدائم" />}:{' '}
        <a href={input.url} className="break-all font-medium text-primary hover:underline">{input.url}</a>
      </p>
      <dl className="mt-4 grid gap-3">
        {FORMATS.map((f) => (
          <div key={f.k} className="rounded-2xl bg-muted/50 p-3 sm:p-4">
            <dt className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {bn ? f.bn : <T en={f.en} ar={f.ar} />}
              <CopyButton text={c[f.k]} label={{ en: `Copy ${f.en}`, bn: `${f.bn} কপি`, ar: `نسخ ${f.ar}` }} className="py-1.5 normal-case tracking-normal" />
            </dt>
            <dd lang="en" className="mt-1.5 break-words font-mono text-[13px] leading-relaxed text-foreground/85">{c[f.k]}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
