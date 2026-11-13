import type { Metadata } from 'next'
import { QiblaView } from '@/components/qibla/qibla-view'
import { absoluteUrl } from '@/lib/site'

const title = 'Qibla Direction — Live Compass to the Kaaba | কিবলার দিক'
const description = 'Find the Qibla direction from anywhere with a live compass, exact bearing and distance to the Kaaba in Makkah. আপনার অবস্থান থেকে কিবলার সঠিক দিক ও কাবার দূরত্ব জানুন।'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: ['Qibla direction', 'Qibla compass', 'Kaaba direction', 'কিবলার দিক', 'কিবলা কম্পাস'],
  alternates: { canonical: '/qibla' },
  openGraph: { title, description, url: absoluteUrl('/qibla'), type: 'website' },
}

export default function QiblaPage() {
  return <QiblaView />
}
