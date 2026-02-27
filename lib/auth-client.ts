'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getStoredAuthState,
  getAuthorizationUrl,
  handleOAuthCallback,
  logout as iamLogout,
  type AuthState,
  type IAMProvider,
} from './auth'

export function signInWithLux() {
  window.location.href = getAuthorizationUrl('lux')
}

export function signInWithHanzo() {
  window.location.href = getAuthorizationUrl('hanzo')
}

export async function signOut() {
  await iamLogout()
  window.location.href = '/'
}

export { handleOAuthCallback }

/** Simple hook to get auth state */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null, accessToken: null, refreshToken: null, expiresAt: null,
    isAuthenticated: false, isLoading: true,
  })

  useEffect(() => {
    setState({ ...getStoredAuthState(), isLoading: false })
  }, [])

  return state
}
