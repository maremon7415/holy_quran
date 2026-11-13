import { EventsHubPage, eventsHubMeta } from '@/components/pages/events'

export const revalidate = 3600
export const generateMetadata = () => eventsHubMeta('bn')
export default function Page() {
  return <EventsHubPage locale="bn" />
}
