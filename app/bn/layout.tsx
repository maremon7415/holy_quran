import type { Metadata } from 'next'
import { LocaleProvider } from '@/lib/i18n/locale-context'
import { site } from '@/lib/site'

/** Nested (not root) layout: every page under /bn renders Bangla UI chrome. */
export const metadata: Metadata = {
  title: {
    default: `${site.name} — বাংলা অর্থসহ আল কুরআন পড়ুন, শুনুন ও মুখস্থ করুন`,
    template: `%s | নূর কুরআন`,
  },
  description: site.descriptionBn,
}

export default function BnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider locale="bn">
      {/* The shared root layout still emits <html lang="en"> (see docs/ARCHITECTURE.md); React hoists this into <head> so pre-JS consumers get the language. */}
      <meta httpEquiv="content-language" content="bn" />
      <div lang="bn">{children}</div>
    </LocaleProvider>
  )
}
