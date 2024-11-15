import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.nextUrl.pathname)
  
  const token = request.cookies.get('token')?.value
  console.log('Token found:', !!token)

  if (request.nextUrl.pathname.startsWith('/clients')) {
    if (!token) {
      console.log('No token found, redirecting to login')
      return NextResponse.redirect(new URL('/', request.url))
    }
    console.log('Token found, allowing access to /clients')
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/clients/:path*']
}