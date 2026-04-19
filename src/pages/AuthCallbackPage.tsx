import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { handleOAuthCallback } from '@/lib/auth'

export function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const [, navigate] = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    if (!code || !state) {
      setError('Missing authorization code')
      return
    }
    handleOAuthCallback(code, state)
      .then(() => navigate('/'))
      .catch((err: Error) => setError(err.message || 'Authentication failed'))
  }, [navigate])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-red-500">Authentication failed: {error}</p>
          <a href="/" className="text-blue-500 underline">
            Go back
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-[hsl(var(--muted-foreground))]">Signing in...</p>
    </div>
  )
}
