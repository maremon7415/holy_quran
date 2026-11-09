/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // Quran corpus is read from disk at request time for on-demand ayah pages & search
  outputFileTracingIncludes: {
    '/surah/[slug]/[ayah]': ['./data/quran/**/*'],
    '/api/search': ['./data/quran/**/*'],
    '/api/hifz/verses/[surah]': ['./data/quran/**/*'],
    '/search': ['./data/quran/**/*'],
  },
  async headers() {
    return [
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] },
      { source: '/icons/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ]
  },
}

export default nextConfig
