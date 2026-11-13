/** Tajweed rule legend (colours mirror the .tajweed-on rules in globals.css). */
export const tajweedLegend = [
  { cls: 'ghunnah', color: '#ff7e1e', en: 'Ghunnah', bn: 'গুন্নাহ', ar: 'غنّة' },
  { cls: 'ikhafa', color: '#9400a8', en: 'Ikhfa', bn: 'ইখফা', ar: 'إخفاء' },
  { cls: 'idgham_ghunnah', color: '#58b800', en: 'Idgham (ghunnah)', bn: 'ইদগাম (গুন্নাহ)', ar: 'إدغام بغنّة' },
  { cls: 'idgham_wo_ghunnah', color: '#169777', en: 'Idgham', bn: 'ইদগাম', ar: 'إدغام' },
  { cls: 'iqlab', color: '#26bffd', en: 'Iqlab', bn: 'ইকলাব', ar: 'إقلاب' },
  { cls: 'qalaqah', color: '#dd0008', en: 'Qalqalah', bn: 'কলকলা', ar: 'قلقلة' },
  { cls: 'madda_normal', color: '#537fff', en: 'Madd (2)', bn: 'মাদ্দ (২)', ar: 'مدّ (٢)' },
  { cls: 'madda_permissible', color: '#4050ff', en: 'Madd (2/4/6)', bn: 'মাদ্দ জায়েজ', ar: 'مدّ (٢/٤/٦)' },
  { cls: 'madda_obligatory', color: '#2144c1', en: 'Madd (4/5)', bn: 'মাদ্দ ওয়াজিব', ar: 'مدّ (٤/٥)' },
  { cls: 'madda_necessary', color: '#000eaf', en: 'Madd (6)', bn: 'মাদ্দ লাযিম', ar: 'مدّ (٦)' },
  { cls: 'slnt', color: '#9aa0a6', en: 'Silent', bn: 'অনুচ্চারিত', ar: 'ساكن لا يُنطق' },
] as const
