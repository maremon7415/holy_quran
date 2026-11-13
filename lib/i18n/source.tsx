'use client'
import { useLang } from '@/lib/lang'
import { sourceFor } from './source-names'

/** `bn` forces Bangla (used inside server-rendered /bn pages where the URL, not the store, decides the language). */
export function Source({ s, bn }: { s: string; bn?: boolean }) {
  const lang = useLang()
  return <>{sourceFor(bn ? 'bn' : lang, s)}</>
}
