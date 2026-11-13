import 'server-only'
// Markdown alternate of a hadith page (`/hadith/bukhari/1.md`, `/bn/hadith/bukhari/1.md`).
import { absoluteUrl, site } from '@/lib/site'
import { bnNum } from '@/lib/i18n/t'
import type { Locale } from '@/lib/i18n/routes'
import { collectionMeta, resolveCollectionSlug } from './collections'
import { getHadith } from './hadith'
import { parseHadithNumber } from './numbering'
import { hadithUrl } from './url'
import { hadithCitation } from './api'

const quote = (s: string) => s.split('\n').map((l) => `> ${l}`).join('\n')

export async function hadithMd(collection: string, num: string, locale: Locale): Promise<{ body: string; canonical: string } | null> {
  const r = resolveCollectionSlug(collection)
  const n = parseHadithNumber(num)
  if (!r || !r.canonical || n === null) return null
  const h = await getHadith(r.slug, n).catch(() => null)
  if (!h) return null
  const m = collectionMeta(r.slug)!
  const bn = locale === 'bn'
  const canonical = absoluteUrl(hadithUrl(r.slug, n, locale))
  const lines = [`# ${bn ? `${m.name.bn} হাদিস ${bnNum(n)}` : `${m.cite} ${n}`}${h.title ? ` — ${bn ? h.titleBn || h.title : h.title}` : ''}`, '', `${m.cite} (${m.name.ar})${h.book ? ` · Book ${h.book.n}: ${h.book.name}` : ''}`, '']
  for (const e of h.entries) {
    if (h.entries.length > 1) lines.push(`### ${m.cite} ${n}${e.sub}`, '')
    if (e.ar) lines.push(bn ? '**আরবি**' : '**Arabic**', '', quote(e.ar), '')
    const tr: [string, string | undefined][] = [['English', e.en], ['বাংলা (Bangla)', e.bn]]
    if (bn) tr.reverse()
    for (const [t, v] of tr) if (v) lines.push(`**${t}:**`, '', quote(v), '')
    if (e.narrator) lines.push(`- ${bn ? 'বর্ণনাকারী' : 'Narrator'}: ${e.narrator}`)
    for (const g of e.grades) lines.push(`- ${bn ? 'মান' : 'Grade'} (${g.grader}): ${g.grade}`)
    lines.push('')
  }
  if (m.authenticity === 'consensus') lines.push(bn ? 'আহলুস সুন্নাহর আলেমদের ঐকমত্যে এই গ্রন্থের হাদিস সহীহ।' : 'Hadiths of this collection are accepted as authentic by the consensus of the scholars.', '')
  lines.push('---', '', `${bn ? '**উদ্ধৃতি / Cite:**' : '**Cite:**'} ${hadithCitation(r.slug, n)}`, '', `Canonical: ${canonical}`, '', `Source: ${site.name} (${site.url}); hadith texts via the open hadith-api (fawazahmed0). Numbering: commonly cited numbers (Muslim: Abd al-Baqi). API: ${absoluteUrl('/openapi.json')}`, '')
  return { body: lines.join('\n'), canonical }
}
