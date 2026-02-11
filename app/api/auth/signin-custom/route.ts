import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateRefreshToken, storeRefreshToken } from '@/lib/refresh-token'
import { encode } from 'next-auth/jwt'

// Dummy hash for timing protection
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('dummy-password-for-timing-protection', 10)

/**
 * Custom signin endpoint that handles both JWT and refresh token generation
 * This bypasses NextAuth's authorize flow to properly set refresh token cookies
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Missing credentials' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                role: true,
                name: true,
            }
        })

        // Verify password (always run to prevent timing attacks)
        const passwordToCheck = user?.passwordHash ?? DUMMY_PASSWORD_HASH
        const isValid = await bcrypt.compare(password, passwordToCheck)

        if (!user || !isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Generate access token (JWT)
        const accessToken = await encode({
            token: {
                id: user.id,
                email: user.email,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + (15 * 60)
            },
            secret: process.env.NEXTAUTH_SECRET!,
            maxAge: 15 * 60,
        })

        // Generate and store refresh token
        const refreshToken = generateRefreshToken()
        await storeRefreshToken(user.id, refreshToken)

        // Create response
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })

        // Set refresh token as httpOnly cookie
        response.cookies.set('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        })

        // Set access token as httpOnly cookie for NextAuth compatibility
        response.cookies.set('next-auth.session-token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
        })

        if (process.env.NODE_ENV === 'development') {
            console.log(`[Auth] User logged in: ${user.email}`)
        }

        return response
    } catch (error) {
        console.error('[Auth] Signin error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
