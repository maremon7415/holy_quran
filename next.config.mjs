/** @type {import('next').NextConfig} */
// Build id is baked into the client and passed to the service worker (/sw.js?v=...) so every deploy gets fresh, versioned caches.
const BUILD_ID = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || String(Date.now())).slice(0, 12)
// Ask the Quran (/api/ask, /api/v1/ask, ask_quran over /api/mcp) runs transformers.js on onnxruntime-node.
// Its npm package ships every platform's binaries (~210 MB); Vercel runs linux-x64, so trace only that one.
const ASK_TRACE_EXCLUDES = [
  'node_modules/**/onnxruntime-node/bin/napi-v3/darwin/**',
  'node_modules/**/onnxruntime-node/bin/napi-v3/win32/**',
  'node_modules/**/onnxruntime-node/bin/napi-v3/linux/arm64/**',
  'node_modules/**/onnxruntime-web/**',
  'node_modules/**/@huggingface/transformers/dist/*.wasm',
  'node_modules/**/@huggingface/transformers/dist/transformers.{js,min.js,web.js,web.min.js,node.cjs,node.min.cjs,node.min.mjs}',
  'node_modules/**/@huggingface/transformers/dist/*.map',
  'node_modules/**/@img/sharp-libvips-linuxmusl-x64/**',
  'node_modules/**/@img/sharp-linuxmusl-x64/**',
  'scripts/.cache/**',
]
// onnxruntime's native binding dlopen()s libonnxruntime.so.1, which the file tracer cannot see
const ASK_TRACE_INCLUDES = ['./data/quran/**/*', './node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v3/linux/x64/{libonnxruntime.so.1,onnxruntime_binding.node}']
const nextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
  images: { unoptimized: true },
  // Quran corpus is read from disk at request time for on-demand ayah pages & search
  outputFileTracingIncludes: {
    '/surah/[slug]/[ayah]': ['./data/quran/**/*'],
    '/bn/surah/[slug]/[ayah]': ['./data/quran/**/*'],
    '/surah/[slug]/[ayah]/opengraph-image': ['./data/quran/**/*'],
    '/bn/surah/[slug]/[ayah]/opengraph-image': ['./data/quran/**/*'],
    '/api/search': ['./data/quran/**/*'],
    '/api/hifz/verses/[surah]': ['./data/quran/**/*'],
    '/search': ['./data/quran/**/*'],
    // AI / developer surfaces read the corpus at request time
    '/api/v1/**/*': ['./data/quran/**/*'],
    '/api/mcp': ASK_TRACE_INCLUDES,
    '/md/[...path]': ['./data/quran/**/*'],
    '/api/ask': ASK_TRACE_INCLUDES,
    '/api/v1/ask': ASK_TRACE_INCLUDES,
  },
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node', 'sharp'],
  outputFileTracingExcludes: {
    '/api/ask': ASK_TRACE_EXCLUDES,
    '/api/v1/ask': ASK_TRACE_EXCLUDES,
    '/api/mcp': ASK_TRACE_EXCLUDES,
  },
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/sitemap-index.xml' },
      // IndexNow key file /{INDEXNOW_KEY}.txt (route checks the key; robots.txt, llms.txt … are real routes and win)
      { source: '/:key([a-zA-Z0-9-]{8,128}).txt', destination: '/api/indexnow/:key' },
    ]
  },
  async headers() {
    return [
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] },
      { source: '/icons/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ]
  },
}

export default nextConfig
