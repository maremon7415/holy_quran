import { RamadanIndexPage } from '@/components/pages/ramadan'

export const revalidate = 3600
export default function Page() {
  return RamadanIndexPage({ locale: 'bn' })
}
