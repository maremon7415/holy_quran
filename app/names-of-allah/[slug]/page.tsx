import { NamePage, nameMeta, nameParams, type SlugProps } from '@/components/pages/names'

export const dynamicParams = false
export const generateStaticParams = nameParams
export const generateMetadata = (p: SlugProps) => nameMeta('en', p)
export default function Page(p: SlugProps) {
  return <NamePage locale="en" {...p} />
}
