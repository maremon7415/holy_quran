import { CityPrayerPage, cityMeta, cityParams, type CityProps } from '@/components/pages/city-prayer'

export const revalidate = 3600
export const dynamicParams = true
export const generateStaticParams = cityParams
export const generateMetadata = (p: CityProps) => cityMeta('en', p)
export default function Page(p: CityProps) {
  return <CityPrayerPage locale="en" {...p} />
}
