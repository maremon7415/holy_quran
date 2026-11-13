import { AyahPage, ayahMeta, ayahParams, type AyahProps } from '@/components/pages/ayah'

export const dynamicParams = true
export const revalidate = 604800
export const generateStaticParams = ayahParams
export const generateMetadata = (p: AyahProps) => ayahMeta('en', p)
export default function Page(p: AyahProps) {
  return <AyahPage locale="en" {...p} />
}
