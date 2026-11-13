import { listNames } from '@/lib/api/corpus'
import { json } from '@/lib/api/http'

export { OPTIONS } from '@/lib/api/http'
export const dynamic = 'force-static'

/** GET /api/v1/names — the 99 Names of Allah */
export const GET = () => json({ total: 99, names: listNames() })
