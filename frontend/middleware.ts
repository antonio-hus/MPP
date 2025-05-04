import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check for token in both cookies and localStorage
  const { pathname } = request.nextUrl

  // Skip middleware for auth-related paths
  if (pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // For API routes and static files, skip middleware
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }

  // For client-side auth check, we'll use a client component
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
