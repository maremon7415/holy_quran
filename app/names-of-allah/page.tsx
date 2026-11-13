import { NamesIndexPage, namesIndexMeta } from '@/components/pages/names'

export const metadata = namesIndexMeta('en')
export default function Page() {
  return <NamesIndexPage locale="en" />
}
