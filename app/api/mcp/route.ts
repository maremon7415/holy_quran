import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { createMcpServer } from '@/lib/mcp/server'
import { checkRateLimit, rateLimitMessage } from '@/lib/api/ratelimit'
import { MCP_LIMITS } from '@/lib/mcp/limits'

/**
 * Model Context Protocol endpoint (Streamable HTTP, stateless, JSON responses).
 * Each request gets a fresh server + transport; all tools are read-only over the local corpus.
 * Docs: /mcp
 *
 * Abuse limits (a 12.5 KB batch of 100 `fetch` calls used to return 43 MB):
 *  - request body ≤ 64 KB; JSON-RPC batches ≤ 5 messages (else a JSON-RPC error, HTTP 400/413);
 *  - every tool result ≤ 100 KB (lib/mcp/server.ts truncates long documents with a link to the full page);
 *  - the whole response ≤ 600 KB (else a JSON-RPC error);
 *  - per IP: 60 messages / min, and 20 `ask_quran` calls / min (the embedding model) → HTTP 429 + Retry-After.
 * maxDuration 60: the first ask_quran on a cold instance downloads the model (~210 MB) — see lib/ask/embed.ts.
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version',
}

type Msg = { id?: string | number | null; method?: unknown; params?: { name?: unknown } }

function rpcError(status: number, code: number, message: string, extra: Record<string, string> = {}, ids: (string | number | null)[] | null = null) {
  const err = (id: string | number | null) => ({ jsonrpc: '2.0', id, error: { code, message } })
  const body = ids ? ids.map(err) : err(null)
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS, ...extra } })
}

async function handle(req: Request) {
  let parsedBody: unknown = undefined
  let msgs: Msg[] = []
  if (req.method === 'POST') {
    const declared = Number(req.headers.get('content-length') ?? 0)
    if (declared > MCP_LIMITS.requestBytes) return rpcError(413, -32600, `Request body too large (max ${MCP_LIMITS.requestBytes} bytes).`)
    const text = await req.text()
    if (Buffer.byteLength(text) > MCP_LIMITS.requestBytes) return rpcError(413, -32600, `Request body too large (max ${MCP_LIMITS.requestBytes} bytes).`)
    try { parsedBody = JSON.parse(text) } catch { return rpcError(400, -32700, 'Parse error: Invalid JSON') }
    if (Array.isArray(parsedBody)) {
      if (parsedBody.length === 0 || parsedBody.length > MCP_LIMITS.batch) return rpcError(400, -32600, `Invalid Request: JSON-RPC batches are limited to ${MCP_LIMITS.batch} messages (got ${parsedBody.length}). Send separate requests.`)
      msgs = parsedBody as Msg[]
    } else msgs = [parsedBody as Msg]
  }
  const embeds = msgs.filter((m) => m && m.method === 'tools/call' && m.params?.name === 'ask_quran').length
  const rl = checkRateLimit(req, { api: Math.max(1, msgs.length), embed: embeds })
  if (!rl.ok) return rpcError(429, -32000, rateLimitMessage(rl), { 'Retry-After': String(rl.retryAfterSec) })

  const server = createMcpServer()
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
  await server.connect(transport)
  try {
    const res = await transport.handleRequest(req, parsedBody === undefined ? undefined : { parsedBody })
    const headers = new Headers(res.headers)
    for (const [k, v] of Object.entries(CORS)) headers.set(k, v)
    headers.set('Cache-Control', 'no-store')
    // the body is fully buffered in JSON mode, so the server can be closed right away
    const body = res.body ? await res.arrayBuffer() : null
    if (body && body.byteLength > MCP_LIMITS.responseBytes) {
      const ids = Array.isArray(parsedBody) ? msgs.filter((m) => m && m.id !== undefined).map((m) => m.id ?? null) : null
      return rpcError(200, -32603, `Response too large (${body.byteLength} bytes, max ${MCP_LIMITS.responseBytes}). Request fewer or smaller documents per call.`, {}, ids)
    }
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
