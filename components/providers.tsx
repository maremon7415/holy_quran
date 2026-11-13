'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode, useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { Toaster } from 'sonner'
import { useReader, applyReaderPrefsToDocument } from '@/lib/stores/reader'
import { SyncRoot } from '@/components/sync/sync-root'
import { THEME_IDS } from '@/components/shell/theme-picker'

function ReaderPrefsSync() {
  const p = useReader()
  useEffect(() => {
    applyReaderPrefsToDocument(p)
  }, [p])
  return null
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={THEME_IDS} disableTransitionOnChange={false}>
      <MotionConfig reducedMotion="user">
        <ReaderPrefsSync />
        <SyncRoot />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </MotionConfig>
    </ThemeProvider>
  )
}
