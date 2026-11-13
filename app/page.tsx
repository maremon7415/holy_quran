import { HomePage, homeMeta } from '@/components/pages/home'

export const revalidate = 3600
export const metadata = homeMeta('en')
export default function Page() {
  return <HomePage locale="en" />
}
