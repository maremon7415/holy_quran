import type { ReactNode } from 'react'
import type { Locale } from './routes'
import { T } from './text'

/**
 * Localised UI text for server components shared by /x and /bn/x:
 * Bangla pages render Bangla on the server; English pages SSR English and switch to the
 * UI language (Arabic / Bangla) on the client via <T>.
 */
export function lt(locale: Locale | undefined, v: { en: string; bn: string; ar?: string }): ReactNode {
  if (locale === 'bn') return v.bn
  return <T en={v.en} bn={v.bn} ar={v.ar} />
}
