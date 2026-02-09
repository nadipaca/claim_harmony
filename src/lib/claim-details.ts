import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export const claimDetailInclude = {
    insuranceCompany: true,
    consumer: {
        select: { id: true, name: true, email: true },
    },
    acceptedByContractor: {
        select: { id: true, name: true, email: true },
    },
    events: {
        orderBy: { createdAt: "asc" },
        include: {
            actorUser: {
                select: { name: true, email: true },
            },
        },
    },
    documents: {
        orderBy: { uploadedAt: "desc" },
        include: {
            uploadedByUser: {
                select: { name: true, email: true },
            },
        },
    },
} satisfies Prisma.ClaimInclude

export type ClaimDetail = Prisma.ClaimGetPayload<{ include: typeof claimDetailInclude }>

export function normalizeClaimNumber(rawClaimNumber: string): string {
    const trimmed = rawClaimNumber.trim()
    return trimmed.startsWith("CLM-") ? trimmed : `CLM-${trimmed}`
}

export async function getClaimDetailByNumber(claimNumber: string): Promise<ClaimDetail | null> {
    return prisma.claim.findFirst({
        where: { claimNumber },
        include: claimDetailInclude,
    })
}

