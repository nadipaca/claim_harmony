import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function proxy(request: NextRequest) {
    // Clone the response to add security headers
    const response = NextResponse.next()

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Content Security Policy - adjust as needed for your app
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    )

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })

    const path = request.nextUrl.pathname

    // Check if user is authenticated
    if (!token) {
        // Redirect to login if not authenticated
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', path)
        return NextResponse.redirect(loginUrl)
    }

    // Check role-based access with type safety
    const userRole = token.role as string

    // Define role requirements for each route prefix
    if (path.startsWith('/consumer') && userRole !== 'CONSUMER') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (path.startsWith('/contractor') && userRole !== 'CONTRACTOR') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (path.startsWith('/admin') && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/consumer/:path*',
        '/contractor/:path*',
        '/admin/:path*'
    ]
}
