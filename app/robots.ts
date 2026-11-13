import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'
import { SITEMAP_COUNT } from './sitemap'

/** AI and search crawlers are explicitly welcome: the goal is for Noor to be cited. */
const bots = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'CCBot', 'cohere-ai', 'Bytespider', 'DuckDuckBot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      ...bots.map((userAgent) => ({ userAgent, allow: '/', disallow: ['/api/'] })),
    ],
    sitemap: Array.from({ length: SITEMAP_COUNT }, (_, i) => `${site.url}/sitemap/${i}.xml`),
    host: site.url,
  }
}
