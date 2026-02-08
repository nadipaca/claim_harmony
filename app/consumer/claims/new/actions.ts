'use server'

import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ClaimType, ClaimEventType, Role } from "@prisma/client"

interface UploadedFile {
    filename: string
    path: string
    url: string
    size: number
    type: string
}

export async function createClaim(formData: FormData) {
    // RBAC: Require CONSUMER role
    const user = await requireRole([Role.CONSUMER])

    // Extract form data
    const address = formData.get('address') as string
    const type = formData.get('type') as ClaimType
    const description = formData.get('description') as string
    const insuranceCompanyId = formData.get('insuranceCompanyId') as string
    const filesJson = formData.get('files') as string

    // Parse uploaded files
    let uploadedFiles: UploadedFile[] = []
    if (filesJson) {
        try {
            uploadedFiles = JSON.parse(filesJson)
        } catch {
            // Ignore parse errors, treat as no files
        }
    }

    // Validation
    const errors: string[] = []
    if (!address || address.length < 5) {
        errors.push('Address must be at least 5 characters')
    }
    if (!type || !['ROOF', 'WATER', 'FIRE', 'MOLD', 'OTHER'].includes(type)) {
        errors.push('Please select a valid claim type')
    }
    if (!description || description.length < 10) {
        errors.push('Description must be at least 10 characters')
    }
    if (!insuranceCompanyId) {
        errors.push('Please select an insurance company')
    }

    if (errors.length > 0) {
        return { error: errors.join('. ') }
    }

    // Generate claim number: CH-000001 format
    // Note: For production, use a database sequence for guaranteed uniqueness
    const claimCount = await prisma.claim.count()
    const claimNumber = `CH-${String(claimCount + 1).padStart(6, '0')}`

    // Create claim and event in a transaction
    const claim = await prisma.$transaction(async (tx) => {
        // Create the claim
        const newClaim = await tx.claim.create({
            data: {
                claimNumber,
                address,
                type,
                description,
                status: 'NEW',
                consumerId: user.id,
                insuranceCompanyId
            }
        })

        // Create the CLAIM_CREATED event
        await tx.claimEvent.create({
            data: {
                claimId: newClaim.id,
                eventType: ClaimEventType.CLAIM_CREATED,
                actorRole: Role.CONSUMER,
                actorUserId: user.id,
                meta: { createdFrom: 'consumer_new_claim' }
            }
        })

        // Create ClaimDocument records for uploaded files
        if (uploadedFiles.length > 0) {
            await tx.claimDocument.createMany({
                data: uploadedFiles.map(file => ({
                    claimId: newClaim.id,
                    filename: file.filename,
                    docType: file.type.startsWith('image/') ? 'photo' : 'document',
                    storageUrl: file.url,
                    uploadedByUserId: user.id
                }))
            })

            // Create document upload event
            await tx.claimEvent.create({
                data: {
                    claimId: newClaim.id,
                    eventType: ClaimEventType.DOCUMENT_UPLOADED,
                    actorRole: Role.CONSUMER,
                    actorUserId: user.id,
                    meta: {
                        documentCount: uploadedFiles.length,
                        filenames: uploadedFiles.map(f => f.filename)
                    }
                }
            })
        }

        return newClaim
    })

    // Redirect to claim detail page
    redirect(`/consumer/claims/${claim.id}`)
}
