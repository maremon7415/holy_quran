import { ZakatPage, zakatMeta } from '@/components/pages/zakat'

export const metadata = zakatMeta('bn')
export default function Page() {
  return <ZakatPage locale="bn" />
}
