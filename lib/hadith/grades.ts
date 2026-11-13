// Grade normalisation (client-safe). The corpus stores free-text grades from several scholars.
export type GradeCategory = 'sahih' | 'hasan' | 'daif' | 'other'

export interface Grade { grader: string; grade: string; category: GradeCategory }

export function gradeCategory(grade: string): GradeCategory {
  const s = grade.toLowerCase()
  if (/da['’]?if|daif|weak|munkar|mawdu|maudu|fabricat|shadh/.test(s)) return 'daif'
  if (/hasan/.test(s)) return 'hasan'
  if (/sahih/.test(s)) return 'sahih'
  return 'other'
}

export const GRADE_LABEL: Record<GradeCategory, { en: string; bn: string; ar: string }> = {
  sahih: { en: 'Sahih (authentic)', bn: 'সহীহ (বিশুদ্ধ)', ar: 'صحيح' },
  hasan: { en: 'Hasan (good)', bn: 'হাসান (উত্তম)', ar: 'حسن' },
  daif: { en: 'Da‘if (weak)', bn: 'দাঈফ (দুর্বল)', ar: 'ضعيف' },
  other: { en: 'Graded', bn: 'মান', ar: 'حكم' },
}

export function normalizeGrades(raw: { name: string; grade: string }[] | undefined): Grade[] {
  return (raw ?? []).filter((g) => g && g.grade).map((g) => ({ grader: g.name, grade: g.grade.trim(), category: gradeCategory(g.grade) }))
}
