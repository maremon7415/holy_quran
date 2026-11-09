import type { Metadata } from 'next'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { MasayelView, type Masala } from '@/components/masayel/masayel-view'
import { absoluteUrl } from '@/lib/site'

const title = 'Masayel — Islamic Rulings on Salah, Tahara & Sawm | ইসলামি মাসায়েল'
const description = 'Concise Islamic fiqh questions and answers on prayer, purification and fasting, with references. নামাজ, পবিত্রতা ও রোজার মাসায়েল রেফারেন্সসহ।'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: ['masayel', 'Islamic rulings', 'fiqh Q&A', 'salah rulings', 'মাসায়েল', 'নামাজের মাসআলা', 'ইসলামি মাসআলা'],
  alternates: { canonical: '/masayel' },
  openGraph: { title, description, url: absoluteUrl('/masayel'), type: 'website' },
}

export default async function MasayelPage() {
  const items: Masala[] = JSON.parse(await readFile(path.join(process.cwd(), 'public/data/masayel.json'), 'utf8'))
  return <MasayelView items={items} />
}
