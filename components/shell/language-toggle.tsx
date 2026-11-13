'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { useLang, type Lang } from '@/lib/lang'
import { hasBnTwin, isBnPath, localeHref, stripLocale } from '@/lib/i18n/routes'
import { applyHtmlLang } from '@/lib/i18n/script'
import { cn } from '@/lib/utils'

const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'bn', label: 'বাং', name: 'বাংলা' },
  { id: 'ar', label: 'عر', name: 'العربية' },
]

/**
 * UI language switch. Bangla has real URLs (/bn/x): switching to/from Bangla navigates to the twin page when one exists.
 * Arabic is UI-only (RTL), so it always lives on the English URLs.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const lang = useLang()
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const setLanguage = useAppStore((s) => s.setLanguage)

  const choose = (id: Lang) => {
    setLanguage(id)
    const suffix = typeof window !== 'undefined' ? window.location.search + window.location.hash : ''
    const onBn = isBnPath(pathname)
    if (id === 'bn' && !onBn && hasBnTwin(pathname)) {
      router.push(localeHref('bn', pathname) + suffix)
      return
    }
    if (id !== 'bn' && onBn) {
      applyHtmlLang(id)
      router.push(stripLocale(pathname) + suffix)
      return
    }
    applyHtmlLang(id)
  }

  return (
    <div className={cn('relative flex rounded-full bg-muted p-0.5 text-xs font-semibold', className)} role="radiogroup" aria-label="Language · ভাষা · اللغة">
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          lang={l.id}
          aria-checked={lang === l.id}
          aria-label={l.name}
          title={l.name}
          onClick={() => choose(l.id)}
          className={cn('relative z-10 rounded-full px-2.5 py-1 transition-colors', l.id === 'ar' && 'font-[family-name:var(--font-noto-naskh)]', lang === l.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
