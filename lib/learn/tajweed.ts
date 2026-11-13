/** Client + server safe helpers for the tajweed example data (data/learn/tajweed-examples.json). */
import raw from '@/data/learn/tajweed-examples.json'

export interface TajweedExample { ref: string; html: string; classes: string[] }
export interface TajweedExampleGroup { id: string; examples: TajweedExample[] }

/** Classes the example markup may use: the Quran.com tajweed classes plus the synthetic ones added by scripts/build-tajweed-examples.mjs. */
export const ALLOWED_TAJWEED_CLASSES = [
  'ham_wasl', 'slnt', 'laam_shamsiyah', 'madda_normal', 'madda_permissible', 'madda_necessary', 'madda_obligatory', 'qalaqah', 'ikhafa_shafawi', 'ikhafa', 'iqlab',
  'idgham_shafawi', 'idgham_ghunnah', 'idgham_wo_ghunnah', 'ghunnah', 'idgham_mutajanisayn', 'idgham_mutaqaribayn',
  'izhar', 'izhar_shafawi', 'qamariyyah', 'tafkheem', 'tarqeeq', 'waqf',
] as const
const ALLOWED = new Set<string>(ALLOWED_TAJWEED_CLASSES)

/** Colours (mirror app/globals.css `.tajweed-on` and components/learn/learn.css). */
export const tajweedColors: Record<string, string> = {
  ham_wasl: '#9aa0a6', slnt: '#9aa0a6', laam_shamsiyah: '#9aa0a6', madda_normal: '#537fff', madda_permissible: '#4050ff', madda_necessary: '#000eaf', madda_obligatory: '#2144c1',
  qalaqah: '#dd0008', ikhafa_shafawi: '#9400a8', ikhafa: '#9400a8', iqlab: '#26bffd', idgham_shafawi: '#58b800', idgham_ghunnah: '#58b800',
  idgham_wo_ghunnah: '#169777', idgham_mutajanisayn: '#169777', idgham_mutaqaribayn: '#169777', ghunnah: '#ff7e1e',
  izhar: '#d97706', izhar_shafawi: '#d97706', qamariyyah: '#0d9488', tafkheem: '#ea580c', tarqeeq: '#2563eb', waqf: '#dc2626',
}

/**
 * Defence in depth: only `<tajweed class="allowed">` and `</tajweed>` survive, everything else is escaped as text.
 * Tags are kept balanced (a dropped opening tag also drops its closing tag).
 */
export function sanitizeTajweed(html: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  let out = ''
  let i = 0
  const open: boolean[] = []
  const re = /<tajweed class="([a-z_]+)">|<\/tajweed>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    out += esc(html.slice(i, m.index))
    if (m[0] === '</tajweed>') { if (open.pop()) out += '</tajweed>' }
    else if (ALLOWED.has(m[1])) { open.push(true); out += `<tajweed class="${m[1]}">` }
    else open.push(false)
    i = m.index + m[0].length
  }
  out += esc(html.slice(i))
  return out + '</tajweed>'.repeat(open.filter(Boolean).length)
}

/** Plain text of an example (tags removed). */
export const tajweedText = (html: string) => html.replace(/<\/?tajweed[^>]*>/g, '')

const rules = (raw as { rules: Record<string, { groups: TajweedExampleGroup[] }> }).rules
export const tajweedExampleGroups = (slug: string): TajweedExampleGroup[] => rules[slug]?.groups ?? []
export const allTajweedExamples = () => Object.entries(rules).flatMap(([slug, r]) => r.groups.flatMap((g) => g.examples.map((e) => ({ slug, group: g.id, ...e }))))

/** Display names of the tajweed classes used in examples. */
export const tajweedClassLabels: Record<string, { en: string; bn: string; ar: string }> = {
  ham_wasl: { en: 'Hamzatul wasl (silent when joined)', bn: 'হামযাতুল ওয়াসল (জুড়ে পড়লে নিঃশব্দ)', ar: 'همزة وصل' },
  slnt: { en: 'Silent letter', bn: 'অনুচ্চারিত হরফ', ar: 'حرف لا يُنطق' },
  laam_shamsiyah: { en: 'Lam shamsiyyah (silent lam)', bn: 'লাম শামসিয়্যাহ (নিঃশব্দ লাম)', ar: 'لام شمسية' },
  madda_normal: { en: 'Natural madd (2 counts)', bn: 'স্বাভাবিক মাদ্দ (২ মাত্রা)', ar: 'مد طبيعي' },
  madda_permissible: { en: 'Madd when stopping (2, 4 or 6)', bn: 'ওয়াকফের মাদ্দ (২, ৪ বা ৬)', ar: 'مد عارض' },
  madda_necessary: { en: 'Necessary madd (6 counts)', bn: 'মাদ্দে লাযিম (৬ মাত্রা)', ar: 'مد لازم' },
  madda_obligatory: { en: 'Connected / separated madd (4–5 counts)', bn: 'মুত্তাসিল / মুনফাসিল মাদ্দ (৪-৫ মাত্রা)', ar: 'مد متصل ومنفصل' },
  qalaqah: { en: 'Qalqalah (echo)', bn: 'কলকলা (প্রতিধ্বনি)', ar: 'قلقلة' },
  ikhafa_shafawi: { en: 'Ikhfa shafawi', bn: 'ইখফা শাফাবী', ar: 'إخفاء شفوي' },
  ikhafa: { en: 'Ikhfa', bn: 'ইখফা', ar: 'إخفاء' },
  iqlab: { en: 'Iqlab', bn: 'ইকলাব', ar: 'إقلاب' },
  idgham_shafawi: { en: 'Idgham shafawi', bn: 'ইদগাম শাফাবী', ar: 'إدغام شفوي' },
  idgham_ghunnah: { en: 'Idgham with ghunnah', bn: 'ইদগাম বিগুন্নাহ', ar: 'إدغام بغنة' },
  idgham_wo_ghunnah: { en: 'Idgham without ghunnah', bn: 'ইদগাম বেগুন্নাহ', ar: 'إدغام بغير غنة' },
  ghunnah: { en: 'Ghunnah (nasal sound)', bn: 'গুন্নাহ', ar: 'غنة' },
  idgham_mutajanisayn: { en: 'Idgham mutajanisayn', bn: 'ইদগাম মুতাজানিসাইন', ar: 'إدغام متجانسين' },
  idgham_mutaqaribayn: { en: 'Idgham mutaqaribayn', bn: 'ইদগাম মুতাকারিবাইন', ar: 'إدغام متقاربين' },
  izhar: { en: 'Izhar (clear noon)', bn: 'ইযহার (স্পষ্ট নুন)', ar: 'إظهار' },
  izhar_shafawi: { en: 'Izhar shafawi (clear meem)', bn: 'ইযহার শাফাবী (স্পষ্ট মীম)', ar: 'إظهار شفوي' },
  qamariyyah: { en: 'Lam qamariyyah (clear lam)', bn: 'লাম ক্বামারিয়্যাহ (স্পষ্ট লাম)', ar: 'لام قمرية' },
  tafkheem: { en: 'Tafkheem (heavy)', bn: 'তাফখীম (মোটা)', ar: 'تفخيم' },
  tarqeeq: { en: 'Tarqeeq (light)', bn: 'তারকীক (চিকন)', ar: 'ترقيق' },
  waqf: { en: 'Waqf sign', bn: 'ওয়াকফের চিহ্ন', ar: 'علامة وقف' },
}
