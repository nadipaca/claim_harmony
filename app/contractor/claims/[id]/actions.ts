'use server'

import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role, ClaimEventType } from "@prisma/client"

export async function acceptClaim(claimId: string): Promise<{ success?: boolean; error?: string }> {
    // RBAC: Require CONTRACTOR role
    const user = await requireRole([Role.CONTRACTOR])

    // Use transaction to prevent race conditions
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Fetch current claim state
            const claim = await tx.claim.findUnique({
                where: { id: claimId },
                select: {
                    id: true,
                    status: true,
                    acceptedByContractorId: true
                }
            })

            // Claim not found
            if (!claim) {
                return { error: "Claim not found" }
            }

            // Already accepted by another contractor
            if (claim.status === 'ACCEPTED' && claim.acceptedByContractorId !== user.id) {
                return { error: "This claim has already been accepted by another contractor" }
            }

            // Already accepted by current contractor (idempotent - return success)
            if (claim.status === 'ACCEPTED' && claim.acceptedByContractorId === user.id) {
                return { success: true, alreadyAccepted: true }
            }

            // Accept the claim
            await tx.claim.update({
                where: { id: claimId },
                data: {
                    status: 'ACCEPTED',
                    acceptedByContractorId: user.id
                }
            })

            // Create ClaimEvent
            await tx.claimEvent.create({
                data: {
                    claimId: claimId,
                    eventType: ClaimEventType.CONTRACTOR_ACCEPTED,
                    actorRole: Role.CONTRACTOR,
                    actorUserId: user.id,
                    meta: { accepted: true }
                }
            })

            return { success: true }
        })

        // Revalidate paths to reflect updates
        revalidatePath(`/contractor/claims/${claimId}`)
        revalidatePath('/contractor/claims')

        return result
    } catch (error) {
        console.error('Error accepting claim:', error)
        return { error: "Failed to accept claim. Please try again." }
    }
}
