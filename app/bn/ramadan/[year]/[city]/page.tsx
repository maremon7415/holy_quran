import { RamadanCityPage, ramadanCityMeta, ramadanCityParams, type RamadanCityProps } from '@/components/pages/ramadan'

export const revalidate = 3600
export const dynamicParams = true
export const generateStaticParams = ramadanCityParams
export const generateMetadata = (p: RamadanCityProps) => ramadanCityMeta('bn', p)
export default function Page(p: RamadanCityProps) {
  return <RamadanCityPage locale="bn" {...p} />
}
