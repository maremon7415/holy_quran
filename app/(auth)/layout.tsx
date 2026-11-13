'use client'
import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="relative isolate flex min-h-[calc(100dvh-10rem)] items-center justify-center overflow-hidden px-4 pb-32 pt-10 lg:pb-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 size-[40rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)]" />
          <div className="bg-pattern absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        </div>
        {children}
      </div>
    </SessionProvider>
  )
}
