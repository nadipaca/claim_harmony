import { NextResponse } from 'next/server'
import { validateRefreshToken, revokeRefreshToken, generateRefreshToken, storeRefreshToken } from '@/lib/refresh-token'
import { encode } from 'next-auth/jwt'
import { cookies } from 'next/headers'

export async function POST() {
    try {
        // Get refresh token from httpOnly cookie
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get('refresh_token')?.value

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'No refresh token provided' },
                { status: 401 }
            )
        }

        // Validate the refresh token and get user data
        const validationResult = await validateRefreshToken(refreshToken)

        if (!validationResult) {
            return NextResponse.json(
                { error: 'Invalid or expired refresh token' },
                { status: 401 }
            )
        }

        const { user, tokenId } = validationResult

        // Generate new access token (JWT)
        const newAccessToken = await encode({
            token: {
                id: user.id,
                email: user.email,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
            },
            secret: process.env.NEXTAUTH_SECRET!,
            maxAge: 15 * 60,
        })

        // Rotate refresh token (delete old, create new)
        await revokeRefreshToken(tokenId)
        const newRefreshToken = generateRefreshToken()
        await storeRefreshToken(user.id, newRefreshToken)

        // Create response
        const response = NextResponse.json({
            success: true,
            accessToken: newAccessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })

        // Set new refresh token as httpOnly cookie
        response.cookies.set('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: '/',
        })

        if (process.env.NODE_ENV === 'development') {
            console.log(`[Auth] Token refreshed for user: ${user.email}`)
        }

        return response
    } catch (error) {
        console.error('[Auth] Refresh token error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
