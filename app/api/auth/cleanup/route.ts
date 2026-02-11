import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cleanupExpiredTokens } from '@/lib/refresh-token'

/**
 * Admin-only endpoint to clean up expired refresh tokens from the database
 * Can be called manually or via a cron job
 */
export async function POST() {
    try {
        // Verify user is authenticated and is an admin
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden: Admin access required' },
                { status: 403 }
            )
        }

        // Clean up expired tokens
        const deletedCount = await cleanupExpiredTokens()

        return NextResponse.json({
            success: true,
            message: `Successfully cleaned up ${deletedCount} expired token(s)`,
            deletedCount
        })
    } catch (error) {
        console.error('[Auth] Cleanup error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
