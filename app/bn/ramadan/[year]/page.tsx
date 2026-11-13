import { RamadanYearPage, ramadanYearMeta, ramadanYearParams, type YearProps } from '@/components/pages/ramadan'

export const revalidate = 3600
export const dynamicParams = true
export const generateStaticParams = ramadanYearParams
export const generateMetadata = (p: YearProps) => ramadanYearMeta('bn', p)
export default function Page(p: YearProps) {
  return <RamadanYearPage locale="bn" {...p} />
}
