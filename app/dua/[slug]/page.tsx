import { DuaPage, duaMeta, duaParams, type SlugProps } from '@/components/pages/dua'

export const dynamicParams = false
export const generateStaticParams = duaParams
export const generateMetadata = (p: SlugProps) => duaMeta('en', p)
export default function Page(p: SlugProps) {
  return <DuaPage locale="en" {...p} />
}
