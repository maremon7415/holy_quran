'use client'
import { useEffect } from 'react'
import { refreshAccount } from '@/lib/sync/account'

/** Mounted once in Providers: starts the sync engine when accounts exist and the visitor is signed in. No-op otherwise. */
export function SyncRoot() {
  useEffect(() => {
    void refreshAccount()
  }, [])
  return null
}
