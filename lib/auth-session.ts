import { cookies } from 'next/headers'
import { validateServerToken, type IAMUser } from './auth'

export async function getSessionUser(): Promise<IAMUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hanzo_access_token')?.value
    if (!token) return null
    return await validateServerToken(token)
  } catch {
    return null
  }
}

export async function getUserId(): Promise<string> {
  const user = await getSessionUser()
  return user?.sub || 'anonymous'
}
