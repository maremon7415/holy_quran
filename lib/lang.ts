'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'

export type Lang = 'en' | 'bn' | 'ar'

/** True after the first client render (use to avoid hydration mismatches with persisted stores). */
export function useMounted() {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}

/** UI language. Returns 'en' during SSR/first paint, then the persisted choice. */
export function useLang(): Lang {
  const lang = useAppStore((s) => s.language) as Lang
  const mounted = useMounted()
  return mounted ? lang : 'en'
}

/** Pick a localized string: tx(lang, { en: 'Read', bn: 'পড়ুন' }) — falls back to en. */
export function tx<T>(lang: Lang, v: { en: T; bn?: T; ar?: T }): T {
  return (v[lang] ?? v.en) as T
}

/** Hook form: const t = useTx(); t({ en: 'Read', bn: 'পড়ুন' }) */
export function useTx() {
  const lang = useLang()
  return <T,>(v: { en: T; bn?: T; ar?: T }) => tx(lang, v)
}
