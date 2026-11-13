// Generates Bangla uccharon (Arabic pronunciation written in Bangla script) for every ayah.
//
//   node scripts/build-bn-uccharon.mjs            # build all 114 surahs → data/quran/uccharon/{n}.json
//   node scripts/build-bn-uccharon.mjs --check    # only score the hand-checked fixtures
//
// Source: Quran.com API v4 word-level data (`text_uthmani` + scholarly transliteration), cached in
// scripts/.cache/. The Uthmani text carries every pronunciation cue we need (shadda, sukun, madd,
// dagger alif, silent-letter marks, iqlab marks, hamzat al-wasl), so the converter works from the
// Arabic of each word and uses the transliteration only for a sanity cross-check. Rules follow the
// spelling of popular Bangladeshi Quran books:
//   • short fatha → া, long ā → া- (hyphen = madd) except at the end of a word, ī → ী, ū → ূ
//   • shadda → conjunct (ব্ব, ল্ল, ম্ম…; য়্য after a vowel), idgham / sun letters split between words
//     ("বিসমিল্লা-হির রাহমা-নির রাহীম"), the word Allah glued to the previous word
//   • ʿ / ʾ carry an independent vowel (আ ই উ ঈ ঊ), "'" when they close a syllable (না'বুদু)
//   • pausal form at the end of every ayah (drop final short vowel / tanween, -an → া, ة → হ)
import fs from 'node:fs/promises'
import path from 'node:path'

const API = 'https://api.quran.com/api/v4'
const ROOT = process.cwd()
const CACHE = path.join(ROOT, 'scripts', '.cache')
const OUT = path.join(ROOT, 'data', 'quran', 'uccharon')

// ------------------------------------------------------------------ fetch (cached)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function getChapterWords(n) {
  const file = path.join(CACHE, `words-${n}.json`)
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'))
  } catch {}
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(`${API}/verses/by_chapter/${n}?words=true&word_fields=text_uthmani&per_page=300`, { headers: { accept: 'application/json' } })
      if (!r.ok) throw new Error(`${r.status}`)
      const d = await r.json()
      const slim = d.verses.map((v) => ({
        k: v.verse_key,
        w: v.words.filter((w) => w.char_type_name !== 'end').map((w) => ({ ar: w.text_uthmani, tl: w.transliteration?.text ?? '' })),
      }))
      await fs.mkdir(CACHE, { recursive: true })
      await fs.writeFile(file, JSON.stringify(slim))
      return slim
    } catch (e) {
      if (i >= 4) throw e
      await sleep(800 * 2 ** i)
    }
  }
}

// ------------------------------------------------------------------ Arabic → units
const LETTERS = {
  'ب': 'b', 'ت': 't', 'ة': 't', 'ث': 'th', 'ج': 'j', 'ح': 'H', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 'S', 'ض': 'D', 'ط': 'T', 'ظ': 'Z', 'ع': 'ʿ', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k',
  'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'Y', 'ا': 'A', 'ٱ': 'wasl',
  'ء': 'ʾ', 'أ': 'ʾ', 'إ': 'ʾ', 'ؤ': 'ʾ', 'ئ': 'ʾ', 'آ': 'ʾ',
}
const BN = {
  b: 'ব', t: 'ত', th: 'ছ', j: 'জ', H: 'হ', kh: 'খ', d: 'দ', dh: 'য', r: 'র', z: 'য', s: 'স', sh: 'শ', S: 'স', D: 'দ',
  T: 'ত', Z: 'য', gh: 'গ', f: 'ফ', q: 'ক', k: 'ক', l: 'ল', m: 'ম', n: 'ন', h: 'হ', w: 'ওয়', y: 'য়',
}
/** doubled letters written as a conjunct; the rest are simply repeated (শাররি, নাফফা-ছা-ত) */
const CONJ = new Set(['b', 'l', 'm', 'n', 't', 'T', 'd', 'D', 'j', 'k', 'q'])
const SIGN = { a: 'া', A: 'া', i: 'ি', I: 'ী', u: 'ু', U: 'ূ', '': '' }
const INDEP = { a: 'আ', A: 'আ', i: 'ই', I: 'ঈ', u: 'উ', U: 'ঊ' }
const LONG = { a: 'A', i: 'I', u: 'U' }
const SHORT = { A: 'a', I: 'i', U: 'u' }
const WAQF = /[ۖ-ۜ۞۩]/
const MUQATTAAT_NAMES = {
  'ا': 'আলিফ', 'ل': 'লা-ম', 'م': 'মী-ম', 'ص': 'সোয়া-দ', 'ر': 'রা', 'ك': 'কা-ফ', 'ه': 'হা', 'ي': 'ইয়া', 'ع': 'আইন',
  'ط': 'ত্বোয়া', 'س': 'সীন', 'ح': 'হা', 'ق': 'কা-ফ', 'ن': 'নূন',
}

/** Parse one Uthmani word into pronunciation units {c, v, gem, tan, bare, silah, ...}. */
function parseWord(word) {
  const units = []
  let last = null
  const word0 = word
  for (const ch of word) {
    // alif madda after a fatha is a plain long ā (إِنَّآ, جَآءَ); at the start it is ʾā
    if (ch === 'آ' && last && last.v === 'a' && !last.tan) { last.v = 'A'; continue }
    const L = LETTERS[ch]
    if (L) {
      last = { c: L, v: null, gem: false, tan: null, bare: true, marks: '', ch }
      if (ch === 'إ') last.v = 'i'
      if (ch === 'آ') { last.v = 'A'; last.bare = false }
      if (ch === 'ة') last.marbuta = true
      units.push(last)
      continue
    }
    if (ch === 'ـ') { last = { c: null, v: null, gem: false, tan: null, bare: true, marks: '', ch }; units.push(last); continue }
    if (!last) continue
    switch (ch) {
      case 'َ': last.v = 'a'; last.bare = false; break
      case 'ُ': last.v = 'u'; last.bare = false; break
      case 'ِ': last.v = 'i'; last.bare = false; break
      case 'ً': last.v = 'a'; last.tan = true; last.bare = false; break
      case 'ٌ': last.v = 'u'; last.tan = true; last.bare = false; break
      case 'ٍ': last.v = 'i'; last.tan = true; last.bare = false; break
      case 'ْ': last.v = ''; last.bare = false; break
      case 'ّ': last.gem = true; last.bare = false; break
      case 'ٔ': last.c = 'ʾ'; break // hamza above (on tatweel / carrier)
      case 'ٕ': last.c = 'ʾ'; if (last.v == null) last.v = 'i'; break
      case 'ٰ': last.dagger = true; break // superscript alif → long ā
      case '۟': case '۠': last.silent = true; break
      case 'ۢ': case 'ۭ': last.iqlab = true; break
      case 'ۥ': last.smallW = true; break
      case 'ۦ': case 'ۧ': last.smallY = true; break
      default: break // maddah, small seen, waqf etc.
    }
  }
  // resolve tatweel placeholders, dagger alif, vowel letters
  const out = []
  for (let i = 0; i < units.length; i++) {
    const u = units[i]
    const prev = out[out.length - 1]
    if (u.c == null) {
      // placeholder carrying marks for the previous letter
      if (prev) {
        if (u.dagger) prev.v = 'A'
        if (u.smallY && prev.v === 'i') prev.v = 'I'
        if (u.smallW && prev.v === 'u') prev.v = 'U'
      }
      continue
    }
    if (u.silent) continue
    if (u.c === 'A') {
      // bare alif: lengthens a fatha, otherwise silent (after tanween fath / waw al-jamaʿa)
      if (prev && prev.v === 'a' && !prev.tan) prev.v = 'A'
      else if (prev && prev.v === 'a' && prev.tan) prev.alifTan = true
      if (u.dagger && prev && prev.v === 'a') prev.v = 'A'
      continue
    }
    if (u.c === 'Y') {
      if (u.v != null) { u.c = 'y' } else {
        if (prev && (prev.v === 'a' || u.dagger) && !prev.tan) prev.v = 'A'
        else if (prev && prev.v === 'i' && !prev.tan) prev.v = 'I'
        continue
      }
    }
    if ((u.c === 'w' || u.c === 'y') && u.dagger && u.bare) { if (prev) prev.v = 'A'; continue }
    if (u.c === 'w' && u.bare && prev && prev.v === 'u' && !prev.tan) { prev.v = 'U'; continue }
    if (u.c === 'y' && u.bare && prev && prev.v === 'i' && !prev.tan) { prev.v = 'I'; continue }
    if (u.dagger) u.v = 'A'
    if (u.smallW && u.v === 'u') { u.v = 'U'; u.silah = true }
    if (u.smallY && u.v === 'i') { u.v = 'I'; u.silah = true }
    out.push(u)
  }
  // Allah (and its prefixed forms): the vowel after the doubled lam is long
  const skel = word0.replace(/[^ء-يٱ]/g, '').replace(/ٱ/g, 'ا')
  if (/^(?:[وف]?[بلت]?)?(?:ا?لله|لله)(?:م)?$/.test(skel)) {
    const l = out.find((x) => x.c === 'l' && x.gem)
    if (l && l.v === 'a') { l.v = 'A'; out.allah = true }
  }
  out.word = word0
  return out
}

// ------------------------------------------------------------------ units → Bangla
function half(c, prevV) {
  if (c === 'y') return prevV === 'i' || prevV === 'I' ? '' : 'ই'
  if (c === 'w') return prevV === 'u' || prevV === 'U' ? '' : 'উ'
  if (c === 'ʿ' || c === 'ʾ') return "'"
  return BN[c] ?? ''
}

/** Render a consonant+vowel. `start`: no vowel before it in this token; `end`: last sound of the token. */
function syll(u, v, { start, prevV, gem, end }) {
  const c = u.c
  const vs = v == null ? '' : v
  if (c === 'ʿ' || c === 'ʾ') {
    if (!vs) return "'"
    return INDEP[vs] + (vs === 'A' && !end ? '-' : '')
  }
  const dash = vs === 'A' && !end ? '-' : ''
  if (c === 'y') {
    if (gem) return half('y', prevV) + 'য়্য' + SIGN[vs] + dash
    if (!vs) return prevV == null ? 'ই' : 'ই'
    if (vs === 'u' || vs === 'U') return 'ইউ'
    return (start || prevV == null ? 'ইয়' : 'য়') + SIGN[vs] + dash
  }
  if (c === 'w') {
    if (gem) return half('w', prevV) + 'ওয়' + SIGN[vs] + dash
    if (!vs) return prevV === 'u' || prevV === 'i' ? 'উ' : 'ও'
    if (vs === 'u') return 'উ'
    if (vs === 'U') return 'ঊ'
    return 'ওয়' + SIGN[vs] + dash
  }
  const b = BN[c]
  return (gem ? (CONJ.has(c) ? b + '্' + b : b + b) : b) + SIGN[vs] + dash
}

/**
 * Render one ayah (array of Uthmani words) to Bangla uccharon. Words are processed as one
 * utterance; pausal form applies at the end and at compulsory stops (ۘ).
 */
export function renderAyah(words, { verseKey } = {}) {
  const [s, a] = (verseKey ?? '0:0').split(':').map(Number)
  const parsed = []
  for (const w of words) {
    const clean = w.replace(WAQF, '').trim()
    const stop = /ۘ/.test(w)
    if (!clean) { if (stop && parsed.length) parsed[parsed.length - 1].stop = true; continue }
    // muqattaʿat: words with no vowel marks at all in the opening ayah
    if ((a === 1 || verseKey === '42:2') && !/[ً-ْ]/.test(clean)) {
      parsed.push({ muq: [...clean].filter((ch) => MUQATTAAT_NAMES[ch]).map((ch) => MUQATTAAT_NAMES[ch]).join(' '), stop: true })
      continue
    }
    const u = parseWord(clean)
    parsed.push({ units: u, lamWord: isLamWord(u), stop })
  }
  if (parsed.length) parsed[parsed.length - 1].stop = true

  // pausal forms
  for (const w of parsed) {
    if (!w.stop || !w.units) continue
    const us = w.units
    const lastU = us[us.length - 1]
    if (!lastU) continue
    if (lastU.marbuta) { lastU.v = ''; lastU.tan = false; lastU.pausalH = true }
    else if (lastU.tan && lastU.v === 'a') { lastU.v = 'A'; lastU.tan = false }
    else if (lastU.silah) { lastU.v = '' }
    else if (lastU.tan || ['a', 'i', 'u'].includes(lastU.v)) { lastU.v = ''; lastU.tan = false }
  }

  const tokens = []
  let cur = ''
  let prevV = null // vowel of the previous sound in this utterance (null = consonant / none)
  let utterStart = true
  const push = () => { if (cur) tokens.push(cur); cur = '' }
  /** close the current (or previous) token with the first half of a doubled consonant */
  const closeWith = (h) => {
    if (cur) { cur += h; push() } else if (tokens.length) tokens[tokens.length - 1] += h
    prevV = null
  }

  for (let wi = 0; wi < parsed.length; wi++) {
    const w = parsed[wi]
    const next = parsed[wi + 1]
    if (w.muq) {
      push(); tokens.push(w.muq); prevV = null; utterStart = true; continue
    }
    const us = w.units
    const nextFirst = next?.units ? firstSound(next.units) : null
    const startsWasl = us[0]?.c === 'wasl'
    const lamWord = w.lamWord // Allah, alladhī… → one conjunct
    if (utterStart || !startsWasl) push()
    let i = 0
    if (startsWasl) {
      i = 1
      if (utterStart) {
        const l = us[1], third = us[2]
        let vw = 'i'
        if (l?.c === 'l' && (l.v === '' || l.bare || l.gem || third?.gem)) vw = 'a'
        else if (third && (third.v === 'u' || third.v === 'U')) vw = 'u'
        cur += INDEP[vw]
        prevV = vw
      }
    }
    for (; i < us.length; i++) {
      const u = us[i]
      if (u.c === 'wasl') continue // wa-l… / fa-l… inside a word
      const nx = us[i + 1] ?? null
      const isLast = i === us.length - 1
      const nextSound = nx ?? nextFirst
      // bare letter before a shadda: sun-letter lam / idgham → silent, the shadda letter supplies the sound
      if (u.bare && u.v == null && nextSound?.gem && !u.tan) {
        if (!(lamWord && u.c === 'l')) continue
        continue
      }
      let v = u.v ?? ''
      // long vowel shortened before a hamzat al-wasl (fī l-arḍi → fil-arḍi)
      if (isLast && next?.units?.[0]?.c === 'wasl' && SHORT[v]) v = SHORT[v]
      const end = isLast && !u.tan && !u.pausalH && !nextGlued(next)
      // doubled letter right at a word / article boundary → split across tokens (rab-bil / hir-raḥ)
      const atBoundary = u.gem && !lamWord && (cur === '' || (i > 0 && us[i - 1].c === 'l' && us[i - 1].bare && us[i - 1].v == null && isArticleLam(us, i - 1)) || us[i - 1]?.c === 'wasl')
      if (atBoundary && !(utterStart && cur === '' && tokens.length === 0 && i === 0)) {
        closeWith(half(u.c, prevV))
        cur += syll(u, v, { start: true, prevV: null, gem: false, end })
      } else {
        let s1 = syll(u, v, { start: cur === '', prevV, gem: u.gem, end })
        if (u.c === 'ʿ' && cur !== '' && !cur.endsWith('-') && v) s1 = "'" + s1
        cur += s1
      }
      if (u.pausalH) cur += 'হ'
      if (u.iqlab && !u.tan && u.c === 'n' && nextSound?.c === 'b') cur = cur.slice(0, -1) + 'ম'
      prevV = v || null
      if (u.tan) appendTan(u)
      // moon-letter article mid-utterance: "rabbil ʿālamīn" – break after the lam
      if (u.c === 'l' && v === '' && nx && isArticleLam(us, i) && !(utterStart && i === 1)) { push(); prevV = null }
      // "wa" prefix before a vowel-initial word: ওয়া ইয়্যা-কা, ওয়া আমিলূ
      if (i === 0 && u.c === 'w' && v === 'a' && nx && ['ʾ', 'ʿ', 'y'].includes(nx.c) && !nx.gem && us.length > 2) { push(); prevV = null }
    }
    utterStart = !!(w.stop && wi < parsed.length - 1)

    function appendTan(u) {
      const nf = nextFirst
      if (nf?.gem && ['l', 'r', 'm', 'n', 'y', 'w'].includes(nf.c) && !w.stop) { push(); prevV = u.v; return }
      if (next?.units?.[0]?.c === 'wasl' && !w.stop) { cur += 'নি'; prevV = 'i'; return }
      cur += u.iqlab && nf?.c === 'b' ? 'ম' : 'ন'
      prevV = null
    }
  }
  push()
  return tokens.join(' ').replace(/\s+/g, ' ').trim()
}

/** ٱللَّه / ٱلَّذِى / ٱلَّتِى …: hamzat al-wasl + (lam) + doubled lam → one conjunct, glued to the previous word */
function isLamWord(us) {
  let k = 0
  while (k < 2 && ['w', 'f', 'b', 'l', 'k', 't'].includes(us[k]?.c) && us[k].v && 'ai'.includes(us[k].v)) k++
  if (us[k]?.c !== 'wasl') return false
  if (us[k + 1]?.c === 'l' && us[k + 1].gem) return true
  return us[k + 1]?.c === 'l' && us[k + 1].bare && us[k + 1].v == null && us[k + 2]?.c === 'l' && us[k + 2].gem
}
function isArticleLam(us, i) {
  if (us[i - 1]?.c === 'wasl') return true
  return isArticleAfterPrefix(us, i)
}

function nextGlued(next) {
  return !!next?.units && next.units[0]?.c === 'wasl'
}
function firstSound(us) {
  // first pronounced unit of a word continued from the previous one (skip wasl + assimilated lam)
  let i = 0
  if (us[0]?.c === 'wasl') i = 1
  if (us[i]?.c === 'l' && us[i].bare && us[i].v == null && us[i + 1]?.gem) return us[i + 1]
  return us[i]
}
/** bi-l / li-l / wa-l / fa-l / ka-l (moon letter) → lam with sukun right after a 1-2 letter prefix */
function isArticleAfterPrefix(us, i) {
  if (i < 1 || i > 3) return false
  const pre = us.slice(0, i)
  if (!pre.every((x) => ['w', 'f', 'b', 'l', 'k', 'wasl'].includes(x.c) && (x.c === 'wasl' || ['a', 'i'].includes(x.v)))) return false
  // must be followed by a letter (not end of word) and preceded by the article's alif/lam
  return pre.some((x) => x.c === 'wasl') || pre[pre.length - 1].c === 'l'
}

// ------------------------------------------------------------------ fixtures / scoring
function lev(a, b) {
  a = [...a]; b = [...b]
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}
const sim = (a, b) => 1 - lev(a, b) / Math.max([...a].length, [...b].length, 1)
const loose = (s) => s.replace(/[\s\-'’]/g, '')

async function check() {
  const fx = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts', 'uccharon-fixtures.json'), 'utf8'))
  let tot = 0, totL = 0, n = 0
  const cache = {}
  for (const [key, ref] of Object.entries(fx)) {
    const [s, a] = key.split(':').map(Number)
    cache[s] ??= await getChapterWords(s)
    const v = cache[s].find((x) => x.k === `${s}:${a}`)
    let out = renderAyah(v.w.map((w) => w.ar), { verseKey: v.k })
    let r = ref
    if (ref.endsWith('…')) {
      r = ref.slice(0, -1).trim()
      const toks = out.split(' ')
      let o = ''
      for (const t of toks) { if (loose(o).length >= loose(r).length) break; o += (o ? ' ' : '') + t }
      out = o
    }
    const sc = sim(out, r), scL = sim(loose(out), loose(r))
    tot += sc; totL += scL; n++
    console.log(`${key.padEnd(6)} ${(sc * 100).toFixed(0).padStart(3)}% ${(scL * 100).toFixed(0).padStart(3)}%  ${out}\n${''.padEnd(18)}${r}`)
  }
  console.log(`\nmean similarity: exact ${((tot / n) * 100).toFixed(1)}%  ignoring spaces/hyphens ${((totL / n) * 100).toFixed(1)}%  (${n} ayahs)`)
}

async function build() {
  await fs.mkdir(OUT, { recursive: true })
  let total = 0
  for (let s = 1; s <= 114; s++) {
    const verses = await getChapterWords(s)
    const out = verses.map((v) => renderAyah(v.w.map((w) => w.ar), { verseKey: v.k }))
    total += out.length
    await fs.writeFile(path.join(OUT, `${s}.json`), JSON.stringify(out))
    if (s % 10 === 0) process.stdout.write(`${s} `)
  }
  console.log(`\nwrote ${total} ayahs → ${path.relative(ROOT, OUT)}`)
  await check()
}

if (process.argv.includes('--check')) await check()
else await build()
