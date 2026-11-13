import { listSurahs } from '@/lib/api/corpus'
import { json } from '@/lib/api/http'

export { OPTIONS } from '@/lib/api/http'
export const dynamic = 'force-static'

/** GET /api/v1/surahs — all 114 surahs */
export const GET = () => json({ total: 114, surahs: listSurahs() })
