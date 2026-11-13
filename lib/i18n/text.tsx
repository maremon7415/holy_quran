'use client'
import { useLang, useTx } from '@/lib/lang'

/** Localised text for server components: SSR renders the URL locale (en or bn), the client switches to the UI language. */
export function T(props: { en: string; bn?: string; ar?: string }) {
  const t = useTx()
  return <>{t(props)}</>
}

/** Renders its children everywhere except in the Arabic UI (e.g. secondary Bangla glosses next to a name). */
export function NotAr({ children }: { children: React.ReactNode }) {
  const lang = useLang()
  return lang === 'ar' ? null : <>{children}</>
}
