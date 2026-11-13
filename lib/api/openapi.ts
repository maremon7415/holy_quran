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
      description: `Free, keyless, CORS-enabled JSON API over the ${site.name} corpus: the Quran (Uthmani Arabic, Saheeh International, Abdel Haleem, Taisirul Quran Bangla, transliteration, Bangla uccharon), authentic duas with sources, Quran topics and the 99 Names of Allah. Every object includes \`url\` — the canonical page on ${site.url} — and a \`citation\` string; please link to it when you quote. Responses are cached at the edge for 24h. Fair use: 60 requests per minute per IP (20 per minute for /ask); over the limit you get HTTP 429 with \`Retry-After\`. AI agents can use the MCP server at ${site.url}/api/mcp instead.`,
      license: { name: 'Content: see sources (Quran.com API); code: open source', url: site.github },
      contact: { name: site.name, url: `${site.url}/developers` },
    },
    servers: [{ url: site.url }],
    externalDocs: { description: 'Developer guide', url: `${site.url}/developers` },
    tags: [{ name: 'Quran' }, { name: 'Duas' }, { name: 'Topics' }, { name: 'Names of Allah' }, { name: 'Islamic events' }],
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
      '/api/v1/ask': {
        get: {
          tags: ['Quran'], operationId: 'askQuran', summary: 'Ask the Quran — meaning-based (semantic) search in English, Bangla or Arabic',
          description: 'A natural question ("what does Allah say about people who are patient in hardship?", "বাবা-মায়ের সাথে আচরণ") → the most relevant ayahs even without shared keywords. Cosine similarity of EmbeddingGemma-300m embeddings (question vs. each ayah’s English + Bangla translation) plus small boosts for shared words and curated topics; consecutive ayahs are merged into ranges. No generated text. If the model is unavailable the response has `mode: "lexical"` and a `note`.',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 300 }, example: 'what does the Quran say about patience in hardship' },
            { name: 'lang', in: 'query', schema: { type: 'string', enum: ['en', 'bn', 'ar'] }, description: 'Translation returned with the Arabic (default: English + Bangla); bn adds Bangla uccharon' },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 20, default: 10 } },
          ],
          responses: { 200: okJson('AskResult', 'Ranked ayah ranges with canonical URLs and citations'), 400: err },
        },
      },
      '/api/v1/hadith': { get: { tags: ['Hadith'], operationId: 'listHadithCollections', summary: 'Hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Malik, Nawawi, Qudsi) with counts', responses: { 200: { description: 'Collections' } } } },
      '/api/v1/hadith/{collection}/{number}': {
        get: {
          tags: ['Hadith'], operationId: 'getHadith', summary: 'One hadith: Arabic, English, Bangla, narrator, grade, canonical url and citation',
          description: 'Numbers are the commonly cited ones (sunnah.com); Sahih Muslim uses the Muhammad Fu’ad Abd al-Baqi numbering. Narrations sharing a number are returned together.',
          parameters: [{ name: 'collection', in: 'path', required: true, schema: { type: 'string', enum: ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik', 'nawawi40', 'qudsi40'] } }, { name: 'number', in: 'path', required: true, schema: { type: 'integer', minimum: 1 }, example: 1 }],
          responses: { 200: { description: 'Hadith' }, 400: err, 404: err, 502: err },
        },
      },
      '/api/v1/hadith/search': {
        get: {
          tags: ['Hadith'], operationId: 'searchHadith', summary: 'Search hadith in English, Bangla or Arabic (language detected from the query; "Bukhari 1" returns `exact`)',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 200 } },
            { name: 'collection', in: 'query', schema: { type: 'string' }, description: 'Restrict to one collection (faster).' },
            { name: 'lang', in: 'query', schema: { type: 'string', enum: ['en', 'bn', 'ar'] } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
          ],
          responses: { 200: { description: 'Ranked hadiths with snippets. `failed` lists collections that could not be searched right now (partial results, cached for 60 s only).' }, 400: err, 429: err, 502: err },
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
      '/api/v1/events': {
        get: {
          tags: ['Islamic events'], operationId: 'listEvents', summary: 'Islamic events with Saudi (Umm al-Qura) and expected Bangladesh dates: the next 12 months, or one Gregorian year (current year −1 … +4); ?event= returns one event',
          parameters: [
            { name: 'year', in: 'query', schema: { type: 'integer', minimum: 1900, maximum: 2200 }, description: 'Gregorian year (current year −1 … +4)' },
            { name: 'event', in: 'query', schema: { type: 'string', enum: ['ramadan-start', 'laylatul-qadr', 'eid-al-fitr', 'day-of-arafah', 'eid-al-adha', 'islamic-new-year', 'ashura', 'white-days'] }, description: 'Return only this event (a name such as "Eid ul Adha" also works)' },
          ],
          responses: { 200: { description: 'Events' }, 400: err, 404: err },
        },
      },
      '/api/v1/events/{slug}': {
        get: {
          tags: ['Islamic events'], operationId: 'getEvent', summary: 'One Islamic event: next occurrence, or ?year=',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: str, example: 'eid-al-adha' }, { name: 'year', in: 'query', schema: { type: 'integer' } }],
          responses: { 200: okJson('IslamicEvent', 'Event dates (Saudi Umm al-Qura + expected Bangladesh), Quran/hadith sources, canonical URL and citation'), 400: err, 404: err },
        },
      },
    },
    components: {
      schemas: {
        IslamicEvent: { type: 'object', properties: { event: str, name: { type: 'object' }, hijriLabel: str, year: { type: ['integer', 'null'] }, occurrences: { type: 'array', items: { type: 'object', properties: { hijri: { type: 'object' }, saudi: { type: 'object', description: 'Umm al-Qura dates' }, bangladeshExpected: { type: 'object', description: 'Saudi date + 1 day (moon sighting; not an announcement)' }, days: { type: 'array', items: { type: 'object' } } } } }, note: str, quran: { type: 'array', items: { type: 'object' } }, hadith: { type: 'array', items: { type: 'object' } }, url, urlBn: url, markdown: url, citation: str } },
        AskResult: { type: 'object', properties: { query: str, mode: { type: 'string', enum: ['semantic', 'lexical'] }, note: str, model: str, method: str, askPage: url, results: { type: 'array', items: { type: 'object', properties: { reference: { ...str, description: '"2:153" or a range "2:155-157"' }, surah: { type: 'object' }, score: { type: 'number' }, similarity: { type: 'number', description: 'cosine similarity of the best ayah' }, matched: { type: 'object', properties: { words: { type: 'array', items: str }, topics: { type: 'array', items: str } } }, ayahs: { type: 'array', items: { type: 'object', properties: { key: str, arabic: str, saheeh: str, bangla: str, uccharon: str } } }, url, urlBn: url, markdown: url, citation: str } } } } },
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
