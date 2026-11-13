'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useUrlLocale } from '@/lib/i18n/locale-context'
import { pick, type Lang } from '@/lib/i18n/t'

export type { Lang }

/** True after the first client render (use to avoid hydration mismatches with persisted stores). */
export function useMounted() {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}

/**
 * UI language. A URL-forced locale (LocaleProvider / `/bn/*` path) wins and is SSR-safe;
 * otherwise 'en' during SSR/first paint, then the persisted store choice.
 */
export function useLang(): Lang {
  const forced = useUrlLocale()
  const lang = useAppStore((s) => s.language) as Lang
  const mounted = useMounted()
  if (forced) return forced
  return mounted ? lang : 'en'
}

/** Pick a localized string: tx(lang, { en: 'Read', bn: 'পড়ুন', ar: 'اقرأ' }) — falls back to en. */
export function tx<T>(lang: Lang, v: { en: T; bn?: T; ar?: T }): T {
  return pick(lang, v)
}

/** Hook form: const t = useTx(); t({ en: 'Read', bn: 'পড়ুন', ar: 'اقرأ' }) */
export function useTx() {
  const lang = useLang()
  return <T,>(v: { en: T; bn?: T; ar?: T }) => tx(lang, v)
}
