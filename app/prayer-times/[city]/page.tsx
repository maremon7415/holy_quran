import { CityPrayerPage, cityMeta, cityParams, type CityProps } from '@/components/pages/city-prayer'

export const revalidate = 900 // the client islands fix "today" after the city's midnight; this keeps meta/JSON-LD dates close
export const dynamicParams = true
export const generateStaticParams = cityParams
export const generateMetadata = (p: CityProps) => cityMeta('en', p)
export default function Page(p: CityProps) {
  return <CityPrayerPage locale="en" {...p} />
}
