import { highlight } from '@/lib/content/highlight'

export function Marked({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlight(text, query).map((s, i) =>
        s.hit ? <mark key={i} className="rounded bg-gold/25 px-0.5 text-foreground">{s.text}</mark> : <span key={i}>{s.text}</span>,
      )}
    </>
  )
}
