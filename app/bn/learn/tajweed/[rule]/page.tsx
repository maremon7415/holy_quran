import { TajweedRulePage, tajweedRuleMeta, tajweedRuleParams, type RuleProps } from '@/components/pages/learn-tajweed'

export const dynamicParams = false
export const generateStaticParams = tajweedRuleParams
export const generateMetadata = (p: RuleProps) => tajweedRuleMeta('bn', p)
export default function Page(p: RuleProps) {
  return <TajweedRulePage locale="bn" {...p} />
}
