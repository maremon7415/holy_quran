import fs from 'node:fs/promises'
import path from 'node:path'

/** Static copy of the precomputed ayah vectors (data/quran/embeddings.bin, ~2.4 MB) for in-browser smart search. */
export const dynamic = 'force-static'

export async function GET() {
  const buf = await fs.readFile(path.join(process.cwd(), 'data/quran/embeddings.bin'))
  return new Response(new Uint8Array(buf), {
    headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
  })
}
