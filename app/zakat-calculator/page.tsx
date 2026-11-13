import { ZakatPage, zakatMeta } from '@/components/pages/zakat'

export const metadata = zakatMeta('en')
export default function Page() {
  return <ZakatPage locale="en" />
}
