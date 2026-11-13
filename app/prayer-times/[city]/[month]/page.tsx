import { CityMonthPage, monthMeta, monthParams, type MonthProps } from '@/components/pages/city-month'

export const revalidate = 3600
export const dynamicParams = true
export const generateStaticParams = monthParams
export const generateMetadata = (p: MonthProps) => monthMeta('en', p)
export default function Page(p: MonthProps) {
  return <CityMonthPage locale="en" {...p} />
}
