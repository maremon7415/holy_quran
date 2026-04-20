import type { Metadata } from 'next'
import { 
  Inter, 
  Merriweather, 
  Outfit, 
  Noto_Sans_Bengali, 
  Hind_Siliguri, 
  Tiro_Bangla, 
  Amiri, 
  Cairo, 
  Lateef 
} from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Providers from '@/components/providers'
import GlobalFooter from '@/components/global-footer'
import ConstructionNoticeModal from '@/components/construction-notice-modal'

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const merriweather = Merriweather({ weight: ['400', '700'], subsets: ["latin"], variable: '--font-merriweather' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

const notoBengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: '--font-noto-bengali' });
const hindSiliguri = Hind_Siliguri({ weight: ['400', '700'], subsets: ["bengali"], variable: '--font-hind-siliguri' });
const tiroBangla = Tiro_Bangla({ weight: ['400'], subsets: ["bengali"], variable: '--font-tiro-bangla' });

const amiri = Amiri({ weight: ['400', '700'], subsets: ["arabic"], variable: '--font-amiri' });
const cairo = Cairo({ subsets: ["arabic"], variable: '--font-cairo' });
const lateef = Lateef({ weight: ['400'], subsets: ["arabic"], variable: '--font-lateef' });


export const metadata: Metadata = {
  title: 'Quran App - Read & Listen',
  description: 'Beautiful Quran app with multiple translations, recitations, prayer times, and Islamic features',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo_tab.png',
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Quran App',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`lang-en font-sans antialiased ${inter.variable} ${merriweather.variable} ${outfit.variable} ${notoBengali.variable} ${hindSiliguri.variable} ${tiroBangla.variable} ${amiri.variable} ${cairo.variable} ${lateef.variable}`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">{children}</div>
            <GlobalFooter />
          </div>
          <ConstructionNoticeModal />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
