import { NextRequest, NextResponse } from 'next/server'

const publicPaths = ['/', '/share', '/iframe', '/auth/callback', '/api/models']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check for Hanzo IAM access token cookie
  const token = request.cookies.get('hanzo_access_token')
  if (!token) {
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('login', 'required')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
