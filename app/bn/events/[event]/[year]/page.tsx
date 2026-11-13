import { EventYearPage, eventYearMeta, eventYearParams, type EventYearProps } from '@/components/pages/events'

export const revalidate = 3600
export const dynamicParams = true
export const generateStaticParams = eventYearParams
export const generateMetadata = (p: EventYearProps) => eventYearMeta('bn', p)
export default function Page(p: EventYearProps) {
  return <EventYearPage locale="bn" {...p} />
}
