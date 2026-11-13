import { JuzPage, juzMeta, juzParams, type JuzProps } from '@/components/pages/juz'

export const dynamicParams = false
export const generateStaticParams = juzParams
export const generateMetadata = (p: JuzProps) => juzMeta('bn', p)
export default function Page(p: JuzProps) {
  return <JuzPage locale="bn" {...p} />
}
