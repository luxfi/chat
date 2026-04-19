/**
 * Hanzo IAM OAuth2/OIDC Client — pure client-side for Vite SPA.
 * Supports lux.id + hanzo.id (same Casdoor backend, different orgs).
 */

export type IAMProvider = 'lux' | 'hanzo'

const IAM_URLS: Record<IAMProvider, string> = {
  lux: (import.meta.env.VITE_LUX_IAM_URL as string) || 'https://lux.id',
  hanzo: (import.meta.env.VITE_HANZO_IAM_URL as string) || 'https://hanzo.id',
}

const CLIENT_IDS: Record<IAMProvider, string> = {
  lux: (import.meta.env.VITE_LUX_IAM_CLIENT_ID as string) || '',
  hanzo: (import.meta.env.VITE_HANZO_IAM_CLIENT_ID as string) || '',
}

function getRedirectUri(): string {
  return `${window.location.origin}/auth/callback`
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
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

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
  return `${IAM_URLS[provider]}/oauth/authorize?${params.toString()}`
}

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

export async function getUserInfo(accessToken: string, provider: IAMProvider): Promise<IAMUser> {
  const res = await fetch(`${IAM_URLS[provider]}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to fetch user info')
  const info = await res.json()
  return { ...info, provider }
}

export async function handleOAuthCallback(
  code: string,
  state: string,
): Promise<{ tokens: TokenResponse; user: IAMUser }> {
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

export function storeAuthState(tokens: TokenResponse, user: IAMUser): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token)
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, (Date.now() + tokens.expires_in * 1000).toString())
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  if (tokens.refresh_token) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token)
  if (tokens.id_token) localStorage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.id_token)
}

export function getStoredAuthState(): AuthState {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT)
    const user = userStr ? (JSON.parse(userStr) as IAMUser) : null
    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null
    const isExpired = expiresAt ? Date.now() > expiresAt : true
    return {
      user,
      accessToken,
      refreshToken,
      expiresAt,
      isAuthenticated: !!accessToken && !isExpired,
      isLoading: false,
    }
  } catch {
    return { user: null, accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false, isLoading: false }
  }
}

export function clearAuthState(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}

export async function logout(): Promise<void> {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  const userStr = localStorage.getItem(STORAGE_KEYS.USER)
  const provider: IAMProvider = userStr ? ((JSON.parse(userStr) as IAMUser).provider || 'lux') : 'lux'

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
    } catch {
      /* best effort */
    }
  }
  clearAuthState()
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}
