import { TopicPage, topicMeta, topicParams, type SlugProps } from '@/components/pages/topics'

export const dynamicParams = false
export const generateStaticParams = topicParams
export const generateMetadata = (p: SlugProps) => topicMeta('bn', p)
export default function Page(p: SlugProps) {
  return <TopicPage locale="bn" {...p} />
}
