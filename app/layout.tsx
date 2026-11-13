import type { Metadata, Viewport } from 'next'
import {
  Manrope, Fraunces, Amiri_Quran, Amiri, Scheherazade_New, Noto_Naskh_Arabic, Lateef, Reem_Kufi,
  Hind_Siliguri, Noto_Serif_Bengali,
} from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Providers from '@/components/providers'
import { SiteHeader } from '@/components/shell/site-header'
import { MobileTabBar } from '@/components/shell/mobile-tabbar'
import { SiteFooter } from '@/components/shell/site-footer'
import { CommandPalette } from '@/components/shell/command-palette'
import { PlayerRoot } from '@/components/player/player-root'
import { ServiceWorkerRegister } from '@/components/shell/sw-register'
import { ReaderIconSprite } from '@/components/reader/icon-sprite'
import { readerPrefsScript } from '@/lib/stores/reader'
import { site, absoluteUrl } from '@/lib/site'
import { JsonLd } from '@/components/seo/json-ld'

const ui = Manrope({ subsets: ['latin'], variable: '--font-ui', display: 'swap' })
const display = Fraunces({ subsets: ['latin'], variable: '--font-display-serif', display: 'swap', axes: ['opsz', 'SOFT'] })
const amiriQuran = Amiri_Quran({ weight: '400', subsets: ['arabic'], variable: '--font-amiri-quran', display: 'swap' })
const amiri = Amiri({ weight: ['400', '700'], subsets: ['arabic'], variable: '--font-amiri', display: 'swap' })
const scheherazade = Scheherazade_New({ weight: ['400', '700'], subsets: ['arabic'], variable: '--font-scheherazade', display: 'swap' })
const notoNaskh = Noto_Naskh_Arabic({ subsets: ['arabic'], variable: '--font-noto-naskh', display: 'swap' })
const lateef = Lateef({ weight: ['400'], subsets: ['arabic'], variable: '--font-lateef', display: 'swap' })
const kufi = Reem_Kufi({ subsets: ['arabic'], variable: '--font-reem-kufi', display: 'swap' })
const hind = Hind_Siliguri({ weight: ['400', '500', '600', '700'], subsets: ['bengali'], variable: '--font-hind-siliguri', display: 'swap' })
const notoSerifBn = Noto_Serif_Bengali({ subsets: ['bengali'], variable: '--font-noto-serif-bn', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Read Al Quran Online with Bangla & English Translation | আল কুরআন`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: site.locale,
    alternateLocale: [...site.alternateLocales],
  },
  twitter: { card: 'summary_large_image', title: site.name, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: site.name },
  icons: { apple: '/apple-icon.png' },
  category: 'religion',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f7f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0a110f' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  alternateName: ['Noor Quran', 'নূর কুরআন', 'Al Quran Online'],
  url: site.url,
  description: site.description,
  inLanguage: ['en', 'bn', 'ar'],
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl('/search')}?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fonts = [ui, display, amiriQuran, amiri, scheherazade, notoNaskh, lateef, kufi, hind, notoSerifBn].map((f) => f.variable).join(' ')
  return (
    <html lang="en" suppressHydrationWarning className={fonts}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: readerPrefsScript }} />
        <JsonLd data={websiteLd} />
      </head>
      <body className="min-h-dvh">
        <ReaderIconSprite />
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
          <SiteHeader />
          <main id="main" className="relative">{children}</main>
          <SiteFooter />
          <MobileTabBar />
          <CommandPalette />
          <PlayerRoot />
          <ServiceWorkerRegister />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
