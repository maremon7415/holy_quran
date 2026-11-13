'use client'
import { createContext, useContext, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { isBnPath, localeHref, type Locale } from './routes'

const LocaleCtx = createContext<Locale | null>(null)

/** Forces the UI language for client components below it (set by app/bn/layout.tsx). */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleCtx.Provider value={locale}>{children}</LocaleCtx.Provider>
}

/**
 * The URL-forced locale, or null when the URL does not force one.
 * Reads the LocaleProvider first, then the pathname (the shell lives in the root layout,
 * outside app/bn/layout.tsx, so it relies on the path).
 */
export function useUrlLocale(): Locale | null {
  const ctx = useContext(LocaleCtx)
  const pathname = usePathname() ?? ''
  if (ctx) return ctx
  return isBnPath(pathname) ? 'bn' : null
}

/** Returns a function that keeps internal links inside /bn while the user is on a /bn page. */
export function useLocalizedHref() {
  const loc = useUrlLocale()
  return (href: string) => (loc === 'bn' ? localeHref('bn', href) : href)
}
