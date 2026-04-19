/**
 * Billing client — calls api.lux.cloud/v1/billing/credits.
 * If the backend is unreachable, we fail open (allow the request) so dev works.
 */
import { getAccessToken } from './auth'

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'https://api.lux.cloud'
const FREE_DAILY_QUERIES = Number(import.meta.env.VITE_FREE_DAILY_QUERIES || '10')

export interface CreditCheck {
  allowed: boolean
  remaining: number
  limit: number
}

export async function checkUserCredits(userId: string): Promise<CreditCheck> {
  try {
    const token = getAccessToken()
    const res = await fetch(`${API_BASE}/v1/billing/credits?userId=${encodeURIComponent(userId)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error(`credits endpoint ${res.status}`)
    return (await res.json()) as CreditCheck
  } catch {
    // Fail open during dev / when backend is down.
    return { allowed: true, remaining: FREE_DAILY_QUERIES, limit: FREE_DAILY_QUERIES }
  }
}

export async function deductCredit(userId: string): Promise<void> {
  try {
    const token = getAccessToken()
    await fetch(`${API_BASE}/v1/billing/credits/deduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    })
  } catch {
    /* best effort */
  }
}
