import { EventsHubPage, eventsHubMeta } from '@/components/pages/events'

export const revalidate = 3600
export const generateMetadata = () => eventsHubMeta('en')
export default function Page() {
  return <EventsHubPage locale="en" />
}
