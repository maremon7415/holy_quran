import { openApiSpec } from '@/lib/api/openapi'

export const dynamic = 'force-static'
export const GET = () =>
  new Response(JSON.stringify(openApiSpec(), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
