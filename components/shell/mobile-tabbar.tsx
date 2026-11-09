'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { mobileTabs, moreNav } from '@/lib/nav'
import { useTx } from '@/lib/lang'
import { useUi } from '@/lib/stores/ui'
import { cn } from '@/lib/utils'
import { UiIcon } from '@/components/ui-icon'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { ThemeSwatches } from './theme-picker'
import { LanguageToggle } from './language-toggle'
import { useEffect } from 'react'

export function MobileTabBar() {
  const pathname = usePathname()
  const t = useTx()
  const moreOpen = useUi((s) => s.moreOpen)
  const setMoreOpen = useUi((s) => s.setMoreOpen)
  const immersive = useUi((s) => s.immersive)
  useEffect(() => setMoreOpen(false), [pathname, setMoreOpen])
  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href) || (href === '/quran' && (pathname.startsWith('/surah') || pathname.startsWith('/juz'))))

  return (
    <>
      <motion.nav
        initial={false}
        animate={{ y: immersive ? 120 : 0 }}
        className="fixed inset-x-3 bottom-3 z-50 lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Primary"
      >
        <div className="glass mx-auto flex max-w-md items-stretch justify-between rounded-[1.75rem] border p-1.5 shadow-[0_18px_40px_-18px_rgb(var(--shadow-color)/0.5)]">
          {mobileTabs.map((tab) => {
            const on = active(tab.href)
            return (
              <Link key={tab.href} href={tab.href} className="relative flex flex-1 flex-col items-center gap-0.5 rounded-3xl py-1.5 text-[10.5px] font-semibold">
                {on && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-3xl bg-accent" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <motion.span className="relative" animate={{ scale: on ? 1.08 : 1, y: on ? -1 : 0 }}><UiIcon name={tab.icon} size={26} /></motion.span>
                <span className={cn('relative', on ? 'text-foreground' : 'text-muted-foreground')}>{t(tab.label)}</span>
              </Link>
            )
          })}
          <button onClick={() => setMoreOpen(true)} className="relative flex flex-1 flex-col items-center gap-0.5 rounded-3xl py-1.5 text-[10.5px] font-semibold text-muted-foreground">
            <UiIcon name="sparkle" size={26} />
            <span>{t({ en: 'More', bn: 'আরও' })}</span>
          </button>
        </div>
      </motion.nav>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="max-h-[88vh] rounded-t-[2rem]">
          <DrawerTitle className="sr-only">More</DrawerTitle>
          <div className="overflow-y-auto px-4 pb-10 pt-2">
            <div className="grid grid-cols-3 gap-2">
              {[{ href: '/listen', icon: 'listen', label: { en: 'Listen', bn: 'তিলাওয়াত' } }, { href: '/topics', icon: 'topics', label: { en: 'Topics', bn: 'বিষয়' } }, ...moreNav].map((n) => (
                <Link key={n.href} href={n.href} className="flex flex-col items-center gap-2 rounded-2xl bg-surface-2 p-3 text-center text-xs font-semibold active:scale-95 transition">
                  <UiIcon name={n.icon} size={40} />
                  {t(n.label)}
                </Link>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-semibold">{t({ en: 'Language', bn: 'ভাষা' })}</span>
              <LanguageToggle />
            </div>
            <p className="mb-2 mt-6 text-sm font-semibold">{t({ en: 'Theme', bn: 'থিম' })}</p>
            <ThemeSwatches />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
