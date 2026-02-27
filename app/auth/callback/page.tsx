'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { handleOAuthCallback } from '@/lib/auth'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      setError('Missing authorization code')
      return
    }

    handleOAuthCallback(code, state)
      .then(({ tokens }) => {
        document.cookie = `hanzo_access_token=${tokens.access_token}; path=/; max-age=${tokens.expires_in}; samesite=lax`
        router.replace('/')
      })
      .catch((err) => {
        setError(err.message || 'Authentication failed')
      })
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-500">Authentication failed: {error}</p>
          <a href="/" className="text-blue-500 underline">Go back</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Signing in...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
