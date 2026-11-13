import { HijriDatePage, hijriMeta } from '@/components/pages/hijri-date'

export const revalidate = 900
export const generateMetadata = () => hijriMeta('bn')
export default function Page() {
  return <HijriDatePage locale="bn" />
}
