/** Split text into plain / matched segments for <mark> rendering. Safe for Arabic diacritics. */
export interface Seg { text: string; hit: boolean }

const ARABIC = /[؀-ۿ]/
const MARKS = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*'
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function arabicLetter(c: string) {
  if ('إأآٱا'.includes(c)) return '[إأآٱا]'
  if (c === 'ى' || c === 'ي') return '[ىي]'
  if (c === 'ة' || c === 'ه') return '[ةه]'
  return esc(c)
}

export function highlight(text: string, query: string): Seg[] {
  const q = query.trim()
  if (!q) return [{ text, hit: false }]
  let re: RegExp
  if (ARABIC.test(q)) {
    const words = q.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '').split(/\s+/).filter(Boolean)
    const parts = words.map((w) => [...w].map(arabicLetter).join(MARKS) + MARKS)
    re = new RegExp(`(${parts.join('|')})`, 'g')
  } else {
    const words = q.split(/\s+/).filter((w) => w.length > 1)
    if (!words.length) return [{ text, hit: false }]
    re = new RegExp(`(${words.map(esc).join('|')})`, 'gi')
  }
  const out: Seg[] = []
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index === undefined || m[0] === '') continue
    if (m.index > last) out.push({ text: text.slice(last, m.index), hit: false })
    out.push({ text: m[0], hit: true })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), hit: false })
  return out.length ? out : [{ text, hit: false }]
}
