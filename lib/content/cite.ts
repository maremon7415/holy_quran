/**
 * Citation strings for Noor Quran pages (client + server safe, no React).
 * Used by the "Cite this" block, the JSON API, the MCP tools and the markdown alternates,
 * so every surface hands agents and readers the same canonical URL and wording.
 */
import { site } from '@/lib/site'

export interface CiteInput {
  /** Title of the cited item, e.g. "Quran 2:255 (Al-Baqarah), Ayat al-Kursi" */
  title: string
  /** Absolute canonical URL */
  url: string
  /** Translation / source note, e.g. "Saheeh International translation" or "Sahih Muslim 2723" */
  note?: string
  /** Access date (defaults to now) */
  accessed?: Date
}

export interface Citations { plain: string; apa: string; mla: string; markdown: string }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MLA_MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.']

export function citations({ title, url, note, accessed = new Date() }: CiteInput): Citations {
  const d = accessed
  const apaDate = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
  const mlaDate = `${d.getUTCDate()} ${MLA_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  const n = note ? ` (${note})` : ''
  return {
    plain: `${title}${n}. ${site.name}. ${url}`,
    apa: `${site.name}. (n.d.). ${title}${note ? ` [${note}]` : ''}. Retrieved ${apaDate}, from ${url}`,
    mla: `“${title}.”${note ? ` ${note}.` : ''} ${site.name}, ${url}. Accessed ${mlaDate}.`,
    markdown: `[${title}](${url})${note ? ` — ${note}` : ''}, ${site.name}`,
  }
}

/** One-line citation for an ayah or range, e.g. "Quran 2:255 (Surah Al-Baqarah), Saheeh International — Noor Quran, https://…". */
export function ayahCitation(ref: string, surahName: string, url: string, translation = 'Saheeh International') {
  return `Quran ${ref} (Surah ${surahName}), ${translation} translation — ${site.name}, ${url}`
}
