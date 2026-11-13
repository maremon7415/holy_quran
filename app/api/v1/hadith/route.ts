import { collectionList } from '@/lib/hadith/api'
import { json } from '@/lib/api/http'

export { OPTIONS } from '@/lib/api/http'

/** GET /api/v1/hadith → the hadith collections with counts. */
export async function GET() {
  return json({ collections: collectionList(), numbering: 'Commonly cited numbers (sunnah.com); Sahih Muslim uses the Muhammad Fu’ad Abd al-Baqi numbering.' })
}
