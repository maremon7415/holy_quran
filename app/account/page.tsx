import type { Metadata } from 'next'
import { AccountView } from '@/components/sync/account-view'

export const metadata: Metadata = {
  title: 'Account & Sync',
  description: 'Sign in to sync your bookmarks, notes, reading progress and memorisation across devices.',
  robots: { index: false, follow: false },
}

export default function AccountPage() {
  return <AccountView />
}
