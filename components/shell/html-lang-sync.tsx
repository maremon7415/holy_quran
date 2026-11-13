'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useUrlLocale } from '@/lib/i18n/locale-context'
import { applyHtmlLang } from '@/lib/i18n/script'

/** Keeps <html lang/dir> in sync on client navigations (/x ↔ /bn/x) and language changes. */
export function HtmlLangSync() {
  const forced = useUrlLocale()
  const stored = useAppStore((s) => s.language)
  const lang = forced ?? (stored === 'bn' || stored === 'ar' ? stored : 'en')
  useEffect(() => applyHtmlLang(lang), [lang])
  return null
}
