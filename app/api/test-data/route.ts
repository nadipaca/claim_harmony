import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const [users, insuranceCompanies, claims, events] = await Promise.all([
            prisma.user.findMany({
                select: { id: true, email: true, name: true, role: true },
            }),
            prisma.insuranceCompany.findMany(),
            prisma.claim.findMany({
                include: {
                    consumer: { select: { email: true, name: true } },
                    insuranceCompany: { select: { name: true } },
                    acceptedByContractor: { select: { email: true, name: true } },
                },
            }),
            prisma.claimEvent.findMany({
                include: {
                    actorUser: { select: { email: true } },
                },
            }),
        ])

        return NextResponse.json({
            success: true,
            data: {
                users,
                insuranceCompanies,
                claims,
                events,
            },
            summary: {
                totalUsers: users.length,
                totalCompanies: insuranceCompanies.length,
                totalClaims: claims.length,
                totalEvents: events.length,
            },
        })
    } catch (error) {
        console.error('Test data fetch error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch data' },
            { status: 500 }
        )
    }
}

