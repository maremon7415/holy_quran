'use client'
import { Fragment } from 'react'
import Link from '@/lib/i18n/link'
import { useLang } from '@/lib/lang'
import { sourceFor } from '@/lib/i18n/source-names'
import { parseHadithSource } from '@/lib/hadith/source'
import { hadithUrl } from '@/lib/hadith/url'

/**
 * Renders a citation like "Sahih al-Bukhari 6306; Sahih Muslim 595; Quran 2:255" in the UI language,
 * turning every servable hadith reference into a link to its page under /hadith (or /bn/hadith).
 * `bn` forces Bangla (server-rendered /bn pages where the URL, not the store, decides the language).
 */
export function HadithSourceLink({ s, bn, className }: { s: string; bn?: boolean; className?: string }) {
  const lang = useLang()
  const l = bn ? 'bn' : lang
  const parts = parseHadithSource(s)
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && '; '}
          {p.hadith ? (
            <Link href={hadithUrl(p.hadith.collection, p.hadith.number)} className={className ?? 'underline decoration-gold/50 underline-offset-4 hover:text-primary hover:decoration-primary'} title={l === 'bn' ? 'হাদিসটি পড়ুন' : l === 'ar' ? 'اقرأ الحديث' : 'Read this hadith'}>
              {sourceFor(l, p.text)}
            </Link>
          ) : (
            sourceFor(l, p.text)
          )}
        </Fragment>
      ))}
    </>
  )
}
