import { TopicsIndexPage, topicsIndexMeta } from '@/components/pages/topics'

export const metadata = topicsIndexMeta('en')
export default function Page() {
  return <TopicsIndexPage locale="en" />
}
