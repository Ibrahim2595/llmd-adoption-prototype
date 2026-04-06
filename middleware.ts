import { NextRequest, NextResponse } from 'next/server'

/**
 * Inject the current pathname as a request header so server-side layouts
 * (which don't receive params for nested routes) can detect the active version
 * and render the correct sidebar tree.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/docs/:path*'],
}
