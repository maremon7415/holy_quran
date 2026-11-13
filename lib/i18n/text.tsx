'use client'
import { useTx } from '@/lib/lang'

/** Localised text for server components: SSR renders the URL locale (en or bn), the client switches to the UI language. */
export function T(props: { en: string; bn?: string; ar?: string }) {
  const t = useTx()
  return <>{t(props)}</>
}
