/** Size limits of the MCP endpoint (app/api/mcp/route.ts) and its tools (lib/mcp/server.ts). */
export const MCP_LIMITS = {
  /** max JSON-RPC messages per HTTP request */
  batch: 5,
  /** max request body */
  requestBytes: 64 * 1024,
  /** max UTF-8 size of one tool result's text */
  toolTextBytes: 100_000,
  /** max size of one HTTP response (5 × a full tool result + JSON-RPC framing) */
  responseBytes: 600_000,
  /** max ask_quran results */
  askLimit: 10,
} as const
