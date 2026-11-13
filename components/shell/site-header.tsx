'use client'
import Link from '@/lib/i18n/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/brand/logo'
import { primaryNav, moreNav } from '@/lib/nav'
import { useTx } from '@/lib/lang'
import { useUi } from '@/lib/stores/ui'
import { cn } from '@/lib/utils'
import { stripLocale } from '@/lib/i18n/routes'
import { UiIcon } from '@/components/ui-icon'
import { HeaderAccount } from '@/components/sync/header-account'
import { ThemePicker } from './theme-picker'
import { LanguageToggle } from './language-toggle'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function SiteHeader() {
  const pathname = stripLocale(usePathname() ?? '/')
  const t = useTx()
  const openPalette = useUi((s) => s.setPaletteOpen)
  const immersive = useUi((s) => s.immersive)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)
      if (Math.abs(y - last) > 6) setHidden(y > last && y > 140)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => setMoreOpen(false), [pathname])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/') || (href === '/quran' && (pathname.startsWith('/surah') || pathname.startsWith('/juz'))))

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden || immersive ? -90 : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className={cn('sticky top-0 z-50 w-full transition-[background,box-shadow,border-color] duration-500', scrolled ? 'glass border-b shadow-[0_8px_30px_-20px_rgb(var(--shadow-color)/0.4)]' : 'border-b border-transparent')}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo />
        <nav className="ms-6 hidden items-center gap-1 lg:flex" aria-label={t({ en: 'Main', bn: 'প্রধান', ar: 'الرئيسية' })}>
          {primaryNav.map((n) => (
            <Link key={n.href} href={n.href} className={cn('relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors', isActive(n.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {isActive(n.href) && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="relative">{t(n.label)}</span>
            </Link>
          ))}
          <Popover open={moreOpen} onOpenChange={setMoreOpen}>
            <PopoverTrigger className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=open]:text-foreground">
              {t({ en: 'More', bn: 'আরও', ar: 'المزيد' })} <span className="inline-block transition-transform data-[state=open]:rotate-180">▾</span>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={10} className="w-[560px] rounded-3xl p-3">
              <div className="grid grid-cols-2 gap-1">
                {moreNav.map((n) => (
                  <Link key={n.href} href={n.href} className="group flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-accent">
                    <span className="grid size-11 place-items-center rounded-xl bg-surface-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 rtl:group-hover:rotate-6"><UiIcon name={n.icon} size={30} /></span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{t(n.label)}</span>
                      {n.desc && <span className="block truncate text-xs text-muted-foreground">{t(n.desc)}</span>}
                    </span>
                  </Link>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <button onClick={() => openPalette(true)} className="group hidden h-10 items-center gap-2 rounded-full border bg-card/60 ps-3 pe-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground md:flex md:w-56 xl:w-72">
            <UiIcon name="search" size={18} />
            <span className="flex-1 text-start">{t({ en: 'Search the Quran…', bn: 'কুরআনে খুঁজুন…', ar: 'ابحث في القرآن…' })}</span>
            <kbd className="rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-semibold">⌘K</kbd>
          </button>
          <button onClick={() => openPalette(true)} className="grid size-10 place-items-center rounded-full transition hover:bg-muted md:hidden" aria-label={t({ en: 'Search', bn: 'খুঁজুন', ar: 'بحث' })}><UiIcon name="search" size={22} /></button>
          <LanguageToggle className="hidden sm:flex" />
          <ThemePicker />
          <HeaderAccount />
        </div>
      </div>
      <AnimatePresence />
    </motion.header>
  )
}
