/** Environment helpers for accounts. Pure + safe to import anywhere on the server (no side effects). */
export function authSecret(): string | undefined {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || undefined
}
export function googleEnabled(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)
}
/** Accounts need a database AND a signing secret. Without them every account feature is hidden, never errors. */
export function accountsEnabled(): boolean {
  return Boolean(process.env.MONGODB_URI && authSecret())
}
