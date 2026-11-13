import { ChevronDown } from 'lucide-react'

/** The accordion body of <Faq> (native <details>). Client-safe, so islands can re-render it with fresh answers. */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
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
  )
}
