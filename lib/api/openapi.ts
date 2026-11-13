/** OpenAPI 3.1 description of the public JSON API (/api/v1/*). Served at /openapi.json. */
import { site } from '@/lib/site'
import { duaCategories } from '@/data/content/duas'

const str = { type: 'string' } as const
const url = { type: 'string', format: 'uri' } as const
const err = { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
const okJson = (ref: string, description: string) => ({ description, content: { 'application/json': { schema: { $ref: `#/components/schemas/${ref}` } } } })

export function openApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: `${site.name} API`,
      version: '1.0.0',
      summary: 'Read-only Quran, dua, topic and 99-Names data with canonical citation URLs.',
      description: `Free, keyless, CORS-enabled JSON API over the ${site.name} corpus: the Quran (Uthmani Arabic, Saheeh International, Abdel Haleem, Taisirul Quran Bangla, transliteration, Bangla uccharon), authentic duas with sources, Quran topics and the 99 Names of Allah. Every object includes \`url\` — the canonical page on ${site.url} — and a \`citation\` string; please link to it when you quote. Responses are cached at the edge for 24h. AI agents can use the MCP server at ${site.url}/api/mcp instead.`,
      license: { name: 'Content: see sources (Quran.com API); code: open source', url: site.github },
      contact: { name: site.name, url: `${site.url}/developers` },
    },
    servers: [{ url: site.url }],
    externalDocs: { description: 'Developer guide', url: `${site.url}/developers` },
    tags: [{ name: 'Quran' }, { name: 'Duas' }, { name: 'Topics' }, { name: 'Names of Allah' }],
    paths: {
      '/api/v1/ayah/{ref}': {
        get: {
          tags: ['Quran'], operationId: 'getAyah', summary: 'One ayah or a range (max 50)',
          parameters: [
            { name: 'ref', in: 'path', required: true, schema: str, examples: { single: { value: '2:255' }, range: { value: '2:255-257' }, named: { value: 'al-baqarah:255' } } },
            { name: 'translations', in: 'query', required: false, description: 'Comma-separated subset of saheeh, abdel_haleem, bangla, transliteration, uccharon', schema: str },
          ],
          responses: { 200: okJson('AyahResult', 'Ayah(s)'), 400: err, 404: err },
        },
      },
      '/api/v1/surah/{id}': {
        get: { tags: ['Quran'], operationId: 'getSurah', summary: 'Surah facts, summary and introduction', parameters: [{ name: 'id', in: 'path', required: true, description: '1–114 or a name such as al-baqarah', schema: str }], responses: { 200: okJson('Surah', 'Surah'), 404: err } },
      },
      '/api/v1/surahs': { get: { tags: ['Quran'], operationId: 'listSurahs', summary: 'All 114 surahs', responses: { 200: { description: 'List', content: { 'application/json': { schema: { type: 'object', properties: { total: { type: 'integer' }, surahs: { type: 'array', items: { $ref: '#/components/schemas/SurahRef' } } } } } } } } } },
      '/api/v1/search': {
        get: {
          tags: ['Quran'], operationId: 'searchQuran', summary: 'Full-text search (Arabic, English, Bangla)',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 200 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } },
            { name: 'lang', in: 'query', schema: { type: 'string', enum: ['en', 'bn', 'ar'] } },
          ],
          responses: { 200: okJson('SearchResult', 'Ranked ayahs'), 400: err },
        },
      },
      '/api/v1/duas': {
        get: {
          tags: ['Duas'], operationId: 'listDuas', summary: 'List or search duas',
          parameters: [
            { name: 'q', in: 'query', schema: str, description: 'Need or occasion, e.g. anxiety, travel, ঘুম' },
            { name: 'category', in: 'query', schema: { type: 'string', enum: duaCategories.map((c) => c.id) } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50 } },
          ],
          responses: { 200: { description: 'Duas', content: { 'application/json': { schema: { type: 'object', properties: { total: { type: 'integer' }, results: { type: 'array', items: { $ref: '#/components/schemas/Dua' } } } } } } }, 400: err },
        },
      },
      '/api/v1/duas/{slug}': { get: { tags: ['Duas'], operationId: 'getDua', summary: 'One dua', parameters: [{ name: 'slug', in: 'path', required: true, schema: str, example: 'dua-for-anxiety' }], responses: { 200: okJson('Dua', 'Dua'), 404: err } } },
      '/api/v1/topics': { get: { tags: ['Topics'], operationId: 'listTopics', summary: 'All topics', responses: { 200: { description: 'Topics' } } } },
      '/api/v1/topics/{slug}': {
        get: {
          tags: ['Topics'], operationId: 'getTopic', summary: 'What the Quran says about a topic',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: str, example: 'patience' }, { name: 'lang', in: 'query', schema: { type: 'string', enum: ['en', 'bn'] } }],
          responses: { 200: okJson('Topic', 'Topic'), 404: err },
        },
      },
      '/api/v1/names': { get: { tags: ['Names of Allah'], operationId: 'listNames', summary: 'The 99 Names of Allah', responses: { 200: { description: 'Names' } } } },
      '/api/v1/names/{id}': { get: { tags: ['Names of Allah'], operationId: 'getName', summary: 'One Name by number, slug or Arabic', parameters: [{ name: 'id', in: 'path', required: true, schema: str, example: 'ar-rahman' }], responses: { 200: okJson('Name', 'Name'), 404: err } } },
    },
    components: {
      schemas: {
        Error: { type: 'object', required: ['error'], properties: { error: { type: 'object', properties: { status: { type: 'integer' }, code: str, message: str } } } },
        Links: { type: 'object', required: ['url', 'citation'], properties: { url: { ...url, description: 'Canonical page — cite this' }, urlBn: { ...url, description: 'Bangla page' }, markdown: { ...url, description: 'Markdown alternate' }, citation: str } },
        SurahRef: { type: 'object', properties: { id: { type: 'integer' }, slug: str, name: str, nameArabic: str, nameBangla: str, meaning: str, revelationPlace: str, versesCount: { type: 'integer' }, url } },
        Ayah: {
          type: 'object',
          properties: {
            key: str, surah: { type: 'integer' }, ayah: { type: 'integer' }, arabic: str,
            translations: { type: 'object', properties: { saheeh: str, abdel_haleem: str, bangla: str } },
            transliteration: str, uccharon: { type: 'string', description: 'Bangla-script pronunciation (auto-generated)' },
            juz: { type: 'integer' }, page: { type: 'integer' }, sajdah: { type: 'boolean' }, url, urlBn: url, markdown: url,
          },
        },
        AyahResult: { allOf: [{ $ref: '#/components/schemas/Links' }, { type: 'object', properties: { reference: str, surah: { $ref: '#/components/schemas/SurahRef' }, ayahs: { type: 'array', items: { $ref: '#/components/schemas/Ayah' } } } }] },
        Surah: { allOf: [{ $ref: '#/components/schemas/Links' }, { type: 'object', properties: { id: { type: 'integer' }, name: str, nameArabic: str, nameBangla: str, meaning: str, revelationPlace: str, revelationOrder: { type: 'integer' }, versesCount: { type: 'integer' }, juz: { type: 'object' }, pages: { type: 'object' }, summary: { type: ['string', 'null'] }, info: { type: ['string', 'null'] } } }] },
        SearchResult: { type: 'object', properties: { query: str, total: { type: 'integer' }, results: { type: 'array', items: { type: 'object', properties: { key: str, surahName: str, arabic: str, saheeh: str, bangla: str, url, citation: str } } } } },
        Dua: { allOf: [{ $ref: '#/components/schemas/Links' }, { type: 'object', properties: { slug: str, title: { type: 'object' }, arabic: str, transliteration: str, meaning: { type: 'object' }, source: str, when: { type: 'object' } } }] },
        Topic: { allOf: [{ $ref: '#/components/schemas/Links' }, { type: 'object', properties: { slug: str, quickAnswer: str, intro: { type: 'object' }, verses: { type: 'array', items: { type: 'object' } } } }] },
        Name: { allOf: [{ $ref: '#/components/schemas/Links' }, { type: 'object', properties: { number: { type: 'integer' }, arabic: str, transliteration: str, meaning: { type: 'object' }, explanation: { type: 'object' } } }] },
      },
    },
  }
}
