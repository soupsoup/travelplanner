import { NextResponse } from 'next/server'

export function middleware(req: any) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Temporarily disable auth protection
    // '/dashboard/:path*',
    // '/trips/:path*',
    // '/profile/:path*',
  ],
} 