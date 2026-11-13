import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { createMcpServer } from '@/lib/mcp/server'

/**
 * Model Context Protocol endpoint (Streamable HTTP, stateless, JSON responses).
 * Each request gets a fresh server + transport; all tools are read-only over the local corpus.
 * Docs: /mcp
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version',
}

async function handle(req: Request) {
  const server = createMcpServer()
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
  await server.connect(transport)
  try {
    const res = await transport.handleRequest(req)
    const headers = new Headers(res.headers)
    for (const [k, v] of Object.entries(CORS)) headers.set(k, v)
    headers.set('Cache-Control', 'no-store')
    // the body is fully buffered in JSON mode, so the server can be closed right away
    const body = res.body ? await res.arrayBuffer() : null
    return new Response(body, { status: res.status, statusText: res.statusText, headers })
  } finally {
    await transport.close().catch(() => {})
    await server.close().catch(() => {})
  }
}

export const POST = handle
export const DELETE = handle

/** Stateless server: no SSE stream to resume. A browser GET gets a pointer to the docs instead of a bare 405. */
export async function GET(req: Request) {
  if ((req.headers.get('accept') ?? '').includes('text/event-stream')) return handle(req)
  return Response.json(
    { name: 'noor-quran', transport: 'streamable-http', endpoint: new URL('/api/mcp', req.url).toString(), docs: new URL('/mcp', req.url).toString(), message: 'POST JSON-RPC 2.0 messages here (initialize, tools/list, tools/call).' },
    { headers: { ...CORS, 'Cache-Control': 'public, max-age=3600' } }
  )
}

export const OPTIONS = () => new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } })
