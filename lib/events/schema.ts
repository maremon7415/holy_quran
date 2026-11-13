/** schema.org `Event` builder for the Islamic-events pages (pure). */
import { absoluteUrl } from '@/lib/site'
import { publisherRef } from '@/lib/seo/structured'
import { ymdKey } from '@/lib/places/dates'
import type { EventOccurrence } from './calendar'
import type { EventContent } from './content'

type Json = Record<string, unknown>
const place = (name: string, cc: string): Json => ({ '@type': 'Place', name, address: { '@type': 'PostalAddress', addressCountry: cc } })

export function eventLd(a: { content: EventContent; occ: EventOccurrence; name: string; description: string; path: string; locale: 'en' | 'bn'; image?: string }): Json {
  const url = absoluteUrl(a.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${url}#event`,
    name: a.name,
    description: a.description,
    url,
    inLanguage: a.locale,
    // Umm al-Qura (Saudi) date; the Bangladesh expectation (+1 day) is in the description and on the page
    startDate: ymdKey(a.occ.start),
    endDate: ymdKey(a.occ.end),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: `https://schema.org/${a.content.attendance}EventAttendanceMode`,
    location: [place('Saudi Arabia', 'SA'), place('Bangladesh', 'BD')],
    image: absoluteUrl(a.image ?? '/opengraph-image'),
    isAccessibleForFree: true,
    organizer: publisherRef(),
  }
}
