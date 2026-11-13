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
      <div lang="bn">{children}</div>
    </LocaleProvider>
  )
}
