import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check if it's an admin route
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Exclude login page to avoid infinite loop
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next()
        }

        // Check for auth cookie
        const token = request.cookies.get('access_token')

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}
