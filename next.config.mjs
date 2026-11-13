/** @type {import('next').NextConfig} */
// Build id is baked into the client and passed to the service worker (/sw.js?v=...) so every deploy gets fresh, versioned caches.
const BUILD_ID = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || String(Date.now())).slice(0, 12)
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
    '/api/mcp': ['./data/quran/**/*'],
    '/md/[...path]': ['./data/quran/**/*'],
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
