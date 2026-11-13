import { LearnHubPage } from '@/components/pages/learn'
import { learnHubMeta } from '@/components/pages/learn'

export const metadata = learnHubMeta('en')
export default function Page() {
  return <LearnHubPage locale="en" />
}
