import { EventPage, eventMeta, eventParams, type EventProps } from '@/components/pages/events'

export const revalidate = 3600
export const dynamicParams = true
export const generateStaticParams = eventParams
export const generateMetadata = (p: EventProps) => eventMeta('bn', p)
export default function Page(p: EventProps) {
  return <EventPage locale="bn" {...p} />
}
