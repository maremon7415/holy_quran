import type { Metadata } from 'next'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { CalendarView, type IslamicEvent } from '@/components/calendar/calendar-view'
import { absoluteUrl } from '@/lib/site'

const title = 'Islamic Calendar — Hijri Dates & Islamic Events | হিজরি ক্যালেন্ডার'
const description = 'Hijri month calendar with Gregorian dates, Ramadan, Eid, Arafah and other Islamic events, plus today’s Hijri date. হিজরি ও ইংরেজি তারিখসহ ইসলামি ক্যালেন্ডার।'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: ['Islamic calendar', 'Hijri calendar', 'Hijri date today', 'Ramadan date', 'Eid date', 'হিজরি ক্যালেন্ডার', 'ইসলামি ক্যালেন্ডার'],
  alternates: { canonical: '/calendar' },
  openGraph: { title, description, url: absoluteUrl('/calendar'), type: 'website' },
}

export default async function CalendarPage() {
  const events: IslamicEvent[] = JSON.parse(await readFile(path.join(process.cwd(), 'public/data/islamic-events.json'), 'utf8'))
  return <CalendarView events={events} />
}
