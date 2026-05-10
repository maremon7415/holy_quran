'use client'

import { usePathname } from 'next/navigation'
import GlobalFooter from '@/components/global-footer'

const NO_FOOTER_ROUTES = ['/quran']

export default function FooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const shouldShowFooter = !NO_FOOTER_ROUTES.some(route => pathname.startsWith(route))

  return (
    <>
      {children}
      {shouldShowFooter && <GlobalFooter />}
    </>
  )
}