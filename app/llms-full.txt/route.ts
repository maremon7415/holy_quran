import { llmsFullTxt } from '@/lib/content/llms'

export const dynamic = 'force-static'
export const GET = async () => new Response(await llmsFullTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } })
