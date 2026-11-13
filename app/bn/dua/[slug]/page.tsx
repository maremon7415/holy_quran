import { DuaPage, duaMeta, duaParams, type SlugProps } from '@/components/pages/dua'

export const dynamicParams = false
export const generateStaticParams = duaParams
export const generateMetadata = (p: SlugProps) => duaMeta('bn', p)
export default function Page(p: SlugProps) {
  return <DuaPage locale="bn" {...p} />
}
