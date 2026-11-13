import { listTopics } from '@/lib/api/corpus'
import { json } from '@/lib/api/http'

export { OPTIONS } from '@/lib/api/http'
export const dynamic = 'force-static'

/** GET /api/v1/topics — all topics */
export const GET = () => {
  const topics = listTopics()
  return json({ total: topics.length, topics })
}
