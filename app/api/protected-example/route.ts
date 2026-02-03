import { NextResponse } from 'next/server'
import { requireRole } from '../../lib/rbac'
import { Role } from '@prisma/client'

export async function GET() {
    try {
        // Example: Only ADMIN and CONTRACTOR can access this endpoint
        const user = await requireRole([Role.ADMIN, Role.CONTRACTOR])

        return NextResponse.json({
            success: true,
            message: 'Access granted to protected resource',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Access denied'
            },
            { status: 403 }
        )
    }
}
