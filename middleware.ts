import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
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

    // Check role-based access
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

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/consumer/:path*',
        '/contractor/:path*',
        '/admin/:path*'
    ]
}
