import { TopicPage, topicMeta, topicParams, type SlugProps } from '@/components/pages/topics'

export const dynamicParams = false
export const generateStaticParams = topicParams
export const generateMetadata = (p: SlugProps) => topicMeta('en', p)
export default function Page(p: SlugProps) {
  return <TopicPage locale="en" {...p} />
}
