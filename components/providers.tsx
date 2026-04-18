'use client'

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import DocumentDirection from '@/components/document-direction'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <DocumentDirection />
        {children}
      </SessionProvider>
    </ThemeProvider>
  )
}
