import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { CopyButton } from '@/components/content/copy-button'
import { buildMeta, howToLd } from '@/lib/content/seo'
import { absoluteUrl, site } from '@/lib/site'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'

const copy = {
  en: {
    title: 'Noor Quran MCP Server: Quran, Duas & Tafsir for AI Agents',
    description: 'Connect Claude, ChatGPT, Cursor or any MCP client to Noor Quran: search the Quran, get ayahs with Arabic, English & Bangla, tafsir, duas, topics and the 99 Names, with citation links.',
  },
  bn: {
    title: 'নূর কুরআন MCP সার্ভার: AI এজেন্টের জন্য কুরআন, দোয়া ও তাফসীর',
    description: 'Claude, ChatGPT, Cursor বা যেকোনো MCP ক্লায়েন্ট নূর কুরআনে যুক্ত করুন: কুরআন অনুসন্ধান, আরবি-ইংরেজি-বাংলা আয়াত, তাফসীর, দোয়া, বিষয় ও আল্লাহর ৯৯ নাম — উদ্ধৃতি লিংকসহ।',
  },
}

export const mcpMeta = (locale: Locale): Metadata =>
  buildMeta({ ...copy[locale], path: '/mcp', locale, keywords: ['Quran MCP server', 'Model Context Protocol Quran', 'Quran ChatGPT connector', 'Quran Claude connector', 'Islamic AI tools', 'কুরআন AI'] })

export const MCP_TOOLS: { name: string; args: string; en: string; bn: string }[] = [
  { name: 'search_quran', args: 'query, lang?, limit?', en: 'Full-text search in Arabic, English and Bangla.', bn: 'আরবি, ইংরেজি ও বাংলায় কুরআন অনুসন্ধান।' },
  { name: 'get_ayah', args: 'reference ("2:255" | "2:255-257"), translations?', en: 'Arabic, Saheeh, Abdel Haleem, Bangla, transliteration, uccharon, URL and citation.', bn: 'আরবি, ইংরেজি, বাংলা, উচ্চারণ, লিংক ও উদ্ধৃতি।' },
  { name: 'get_surah', args: 'surah (number | name)', en: 'Facts, summary and introduction of a surah.', bn: 'সূরার তথ্য, সারসংক্ষেপ ও ভূমিকা।' },
  { name: 'get_tafsir', args: 'reference, edition? (ibn-kathir | ahsanul-bayaan | muyassar)', en: 'Classical tafsir (cached from Quran.com).', bn: 'তাফসীর (Quran.com থেকে, ক্যাশসহ)।' },
  { name: 'find_dua', args: 'query | occasion | category | slug', en: 'Authentic duas with source and when to recite.', bn: 'উৎস ও পড়ার সময়সহ প্রামাণ্য দোয়া।' },
  { name: 'get_topic_verses', args: 'topic, lang?', en: 'What the Quran says about a topic: quick answer and verses.', bn: 'কোনো বিষয়ে কুরআন কী বলে: সংক্ষিপ্ত উত্তর ও আয়াত।' },
  { name: 'get_name_of_allah', args: 'name (number | transliteration | Arabic)', en: 'One of the 99 Names with meaning and Quran reference.', bn: 'আল্লাহর ৯৯ নামের একটি — অর্থ ও কুরআনের রেফারেন্সসহ।' },
  { name: 'search / fetch', args: 'query / id', en: 'Document search + fetch (ChatGPT connectors & deep research).', bn: 'ডকুমেন্ট অনুসন্ধান ও আনা (ChatGPT কানেক্টর)।' },
]

function Code({ children }: { children: string }) {
  return (
    <div className="relative mt-2">
      <pre className="overflow-x-auto rounded-2xl bg-muted/70 p-4 pe-24 text-[13px] leading-relaxed" dir="ltr"><code>{children}</code></pre>
      <CopyButton text={children} className="absolute end-2 top-2 py-1.5" />
    </div>
  )
}

export function McpPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const L = (en: string, bnText: string) => lt(locale, { en, bn: bnText })
  const endpoint = absoluteUrl('/api/mcp')
  const clients: { id: string; name: string; en: string; bn: string; code?: string }[] = [
    { id: 'claude', name: 'Claude (claude.ai / desktop)', en: 'Settings → Connectors → Add custom connector → paste the URL below. No sign-in needed.', bn: 'Settings → Connectors → Add custom connector → নিচের URL দিন। কোনো লগইন লাগবে না।', code: endpoint },
    { id: 'claude-code', name: 'Claude Code', en: 'Add it from the terminal:', bn: 'টার্মিনাল থেকে যোগ করুন:', code: `claude mcp add --transport http noor-quran ${endpoint}` },
    { id: 'chatgpt', name: 'ChatGPT', en: 'Settings → Apps & Connectors → Advanced → enable Developer mode, then Create → paste the URL, authentication “No authentication”. The search/fetch tools also work in deep research.', bn: 'Settings → Apps & Connectors → Advanced → Developer mode চালু করুন, তারপর Create → URL দিন, Authentication: “No authentication”।', code: endpoint },
    { id: 'cursor', name: 'Cursor', en: 'Add to ~/.cursor/mcp.json (or .cursor/mcp.json in a project):', bn: '~/.cursor/mcp.json ফাইলে যোগ করুন:', code: JSON.stringify({ mcpServers: { 'noor-quran': { url: endpoint } } }, null, 2) },
    { id: 'vscode', name: 'VS Code (GitHub Copilot)', en: 'Add to .vscode/mcp.json:', bn: '.vscode/mcp.json ফাইলে যোগ করুন:', code: JSON.stringify({ servers: { 'noor-quran': { type: 'http', url: endpoint } } }, null, 2) },
    { id: 'gemini', name: 'Gemini CLI', en: 'Add to ~/.gemini/settings.json:', bn: '~/.gemini/settings.json ফাইলে যোগ করুন:', code: JSON.stringify({ mcpServers: { 'noor-quran': { httpUrl: endpoint } } }, null, 2) },
  ]
  return (
    <div className={pageShell}>
      <JsonLd data={howToLd({
        name: bn ? 'নূর কুরআন MCP সার্ভার যুক্ত করবেন যেভাবে' : 'How to connect the Noor Quran MCP server',
        description: copy[locale].description,
        path: h('/mcp'),
        inLanguage: bn ? 'bn' : undefined,
        steps: clients.map((c) => ({ name: c.name, text: `${bn ? c.bn : c.en}${c.code ? ` ${c.code}` : ''}` })),
      })} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'ডেভেলপার' : 'Developers', ar: 'المطورون', href: '/developers' }, { name: 'MCP', href: '/mcp' }]} className="mb-4" />
      <PageHero
        eyebrow={L('Model Context Protocol', 'মডেল কনটেক্সট প্রোটোকল')}
        icon="sparkle"
        title={L('Noor Quran for AI agents', 'AI এজেন্টের জন্য নূর কুরআন')}
        subtitle={L(
          `A free, read-only MCP server so assistants can look up ayahs, tafsir, duas, topics and the 99 Names from a verified corpus — and cite ${site.name} with a link for every answer.`,
          'বিনামূল্যের, শুধু-পাঠযোগ্য MCP সার্ভার — AI সহকারী যাচাইকৃত তথ্যভান্ডার থেকে আয়াত, তাফসীর, দোয়া, বিষয় ও আল্লাহর ৯৯ নাম খুঁজে প্রতিটি উত্তরে লিংকসহ উদ্ধৃতি দিতে পারে।'
        )}
      >
        <div className="mt-6 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{L('Server URL (Streamable HTTP, no auth)', 'সার্ভার URL (Streamable HTTP, লগইন ছাড়া)')}</p>
          <Code>{endpoint}</Code>
        </div>
      </PageHero>

      <section aria-labelledby="connect-h" className="mt-12">
        <h2 id="connect-h" className="font-display mb-4 text-2xl font-semibold">{L('Connect your assistant', 'আপনার সহকারী যুক্ত করুন')}</h2>
        <div className="grid gap-4">
          {clients.map((c) => (
            <section key={c.id} aria-labelledby={`c-${c.id}`} className="card-soft rounded-3xl p-5">
              <h3 id={`c-${c.id}`} className="font-semibold">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{bn ? c.bn : c.en}</p>
              {c.code && <Code>{c.code}</Code>}
            </section>
          ))}
        </div>
      </section>

      <section aria-labelledby="tools-h" className="mt-12">
        <h2 id="tools-h" className="font-display mb-4 text-2xl font-semibold">{L('Tools', 'টুলসমূহ')}</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {MCP_TOOLS.map((t) => (
            <li key={t.name} className="px-5 py-4">
              <p className="flex flex-wrap items-baseline gap-x-3"><code className="font-semibold text-primary">{t.name}</code><code dir="ltr" className="text-xs text-muted-foreground">{t.args}</code></p>
              <p className="mt-1 text-sm text-muted-foreground">{bn ? t.bn : t.en}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">{L('Every result includes url (the canonical page) and citation. Please show the link when you quote.', 'প্রতিটি ফলাফলে url (স্থায়ী পাতা) ও citation থাকে। উদ্ধৃতির সময় লিংকটি দেখান।')}</p>
      </section>

      <section aria-labelledby="test-h" className="mt-12">
        <h2 id="test-h" className="font-display mb-2 text-2xl font-semibold">{L('Try it with curl', 'curl দিয়ে পরীক্ষা করুন')}</h2>
        <Code>{`curl -s ${endpoint} \\
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_ayah","arguments":{"reference":"2:255"}}}'`}</Code>
        <p className="mt-4 text-sm text-muted-foreground">
          {L('Prefer plain HTTP? See the', 'সাধারণ HTTP চান? দেখুন')} <Link href={h('/developers')} className="font-medium text-primary hover:underline">{L('JSON API and markdown pages', 'JSON API ও মার্কডাউন পাতা')}</Link> · <a href="/llms.txt" className="font-medium text-primary hover:underline">llms.txt</a>
        </p>
      </section>
    </div>
  )
}
