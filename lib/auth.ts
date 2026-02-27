/**
 * Hanzo IAM OAuth2/OIDC Client — adapted for lux.chat
 * Supports lux.id + hanzo.id (same Casdoor backend, different orgs)
 */

export type IAMProvider = 'lux' | 'hanzo'

const IAM_URLS: Record<IAMProvider, string> = {
  lux: process.env.NEXT_PUBLIC_LUX_IAM_URL || 'https://lux.id',
  hanzo: process.env.NEXT_PUBLIC_HANZO_IAM_URL || 'https://hanzo.id',
}

const CLIENT_IDS: Record<IAMProvider, string> = {
  lux: process.env.NEXT_PUBLIC_LUX_IAM_CLIENT_ID || process.env.LUX_IAM_CLIENT_ID || '',
  hanzo: process.env.NEXT_PUBLIC_HANZO_IAM_CLIENT_ID || process.env.HANZO_IAM_CLIENT_ID || '',
}

function getRedirectUri(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`
  }
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
}

export interface IAMUser {
  sub: string
  name?: string
  displayName?: string
  email?: string
  emailVerified?: boolean
  picture?: string
  roles?: string[]
  permissions?: string[]
  walletAddress?: string
  walletChain?: string
  provider?: IAMProvider
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
  scope?: string
}

export interface AuthState {
  user: IAMUser | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  isAuthenticated: boolean
  isLoading: boolean
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'hanzo_access_token',
  REFRESH_TOKEN: 'hanzo_refresh_token',
  ID_TOKEN: 'hanzo_id_token',
  USER: 'hanzo_user',
  EXPIRES_AT: 'hanzo_expires_at',
  OAUTH_STATE: 'hanzo_oauth_state',
  OAUTH_PROVIDER: 'hanzo_oauth_provider',
} as const

function generateState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

function parseJwt(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return {}
  }
}

/** Build OAuth2 authorization URL for the given provider */
export function getAuthorizationUrl(provider: IAMProvider): string {
  const state = generateState()
  sessionStorage.setItem(STORAGE_KEYS.OAUTH_STATE, state)
  sessionStorage.setItem(STORAGE_KEYS.OAUTH_PROVIDER, provider)

  const params = new URLSearchParams({
    client_id: CLIENT_IDS[provider],
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'openid profile email',
    state,
  })

  return `${IAM_URLS[provider]}/login/oauth/authorize?${params.toString()}`
}

/** Exchange authorization code for tokens */
export async function exchangeCode(code: string, provider: IAMProvider): Promise<TokenResponse> {
  const res = await fetch(`${IAM_URLS[provider]}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_IDS[provider],
      code,
      redirect_uri: getRedirectUri(),
    }),
  })
  if (!res.ok) throw new Error('Code exchange failed')
  return res.json()
}

/** Get user info from IAM */
export async function getUserInfo(accessToken: string, provider: IAMProvider): Promise<IAMUser> {
  const res = await fetch(`${IAM_URLS[provider]}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to fetch user info')
  const info = await res.json()
  return { ...info, provider }
}

/** Handle OAuth callback — verify state, exchange code, fetch user */
export async function handleOAuthCallback(code: string, state: string): Promise<{ tokens: TokenResponse; user: IAMUser }> {
  const storedState = sessionStorage.getItem(STORAGE_KEYS.OAUTH_STATE)
  const provider = (sessionStorage.getItem(STORAGE_KEYS.OAUTH_PROVIDER) || 'lux') as IAMProvider
  sessionStorage.removeItem(STORAGE_KEYS.OAUTH_STATE)
  sessionStorage.removeItem(STORAGE_KEYS.OAUTH_PROVIDER)

  if (state !== storedState) throw new Error('Invalid OAuth state')

  const tokens = await exchangeCode(code, provider)
  const user = await getUserInfo(tokens.access_token, provider)
  storeAuthState(tokens, user)
  return { tokens, user }
}

/** Refresh access token */
export async function refreshAccessToken(refreshToken: string, provider: IAMProvider): Promise<TokenResponse> {
  const res = await fetch(`${IAM_URLS[provider]}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_IDS[provider],
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error('Token refresh failed')
  return res.json()
}

/** Store auth state to localStorage */
export function storeAuthState(tokens: TokenResponse, user: IAMUser): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token)
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, (Date.now() + tokens.expires_in * 1000).toString())
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  if (tokens.refresh_token) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token)
  if (tokens.id_token) localStorage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.id_token)
}

/** Get stored auth state */
export function getStoredAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false, isLoading: false }
  }
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT)
    const user = userStr ? JSON.parse(userStr) : null
    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null
    const isExpired = expiresAt ? Date.now() > expiresAt : true
    return { user, accessToken, refreshToken, expiresAt, isAuthenticated: !!accessToken && !isExpired, isLoading: false }
  } catch {
    return { user: null, accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false, isLoading: false }
  }
}

/** Clear auth state */
export function clearAuthState(): void {
  if (typeof window === 'undefined') return
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
}

/** Logout — revoke + clear */
export async function logout(): Promise<void> {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  const userStr = localStorage.getItem(STORAGE_KEYS.USER)
  const provider: IAMProvider = userStr ? (JSON.parse(userStr).provider || 'lux') : 'lux'

  if (accessToken || refreshToken) {
    try {
      await fetch(`${IAM_URLS[provider]}/oauth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_IDS[provider],
          token: refreshToken || accessToken || '',
          token_type_hint: refreshToken ? 'refresh_token' : 'access_token',
        }),
      })
    } catch { /* best effort */ }
  }
  clearAuthState()
}

/** Server-side: validate token and get user ID from cookie/header */
export async function validateServerToken(accessToken: string): Promise<IAMUser | null> {
  // Try lux.id first, then hanzo.id
  for (const provider of ['lux', 'hanzo'] as IAMProvider[]) {
    try {
      const user = await getUserInfo(accessToken, provider)
      if (user?.sub) return user
    } catch { /* try next */ }
  }
  return null
}
