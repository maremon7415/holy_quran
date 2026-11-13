/**
 * Read a request body as UTF-8 text, aborting as soon as more than `max` bytes arrived.
 * Works for chunked bodies without Content-Length (which `req.text()` would buffer completely first).
 * Returns null when the cap is exceeded.
 */
export async function readBodyCapped(req: Request, max: number): Promise<string | null> {
  const declared = Number(req.headers.get('content-length') ?? NaN)
  if (Number.isFinite(declared) && declared > max) return null
  if (!req.body) return ''
  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > max) {
      await reader.cancel().catch(() => {})
      return null
    }
    chunks.push(value)
  }
  const buf = new Uint8Array(size)
  let off = 0
  for (const c of chunks) {
    buf.set(c, off)
    off += c.byteLength
  }
  return new TextDecoder().decode(buf)
}
