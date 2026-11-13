import { DevelopersPage, developersMeta } from '@/components/pages/developers'

export const metadata = developersMeta('en')
export default function Page() {
  return <DevelopersPage locale="en" />
}
