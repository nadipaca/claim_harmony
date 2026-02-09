import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/rbac'
import { canAccessClaim } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'
import { Role, ClaimEventType } from '@prisma/client'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ claimNumber: string }> }
) {
    try {
        // Authenticate user
        const user = await requireAuth()
        const { claimNumber } = await params

        // Construct the full claim number (add CLM- prefix if not present)
        const fullClaimNumber = claimNumber.startsWith('CLM-') ? claimNumber : `CLM-${claimNumber}`

        // Fetch claim
        const claim = await prisma.claim.findFirst({
            where: { claimNumber: fullClaimNumber },
            select: {
                id: true,
                consumerId: true,
                acceptedByContractorId: true,
                status: true
            }
        })

        if (!claim) {
            return NextResponse.json(
                { error: 'Claim not found' },
                { status: 404 }
            )
        }

        // Check authorization
        if (!canAccessClaim(user, claim)) {
            return NextResponse.json(
                { error: 'Unauthorized to access this claim' },
                { status: 403 }
            )
        }

        // Parse form data
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const docType = formData.get('docType') as string | null

        // Validate file
        if (!file || file.size === 0) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        if (!file.name || file.name.length === 0) {
            return NextResponse.json(
                { error: 'Invalid filename' },
                { status: 400 }
            )
        }

        // Generate unique filename to avoid collisions
        const timestamp = Date.now()
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const storagePath = `claims/${claim.id}/${timestamp}_${sanitizedFilename}`

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('claims-docs')
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (uploadError) {
            console.error('Supabase upload error:', uploadError)
            return NextResponse.json(
                { error: `Upload failed: ${uploadError.message}` },
                { status: 500 }
            )
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabaseAdmin
            .storage
            .from('claims-docs')
            .getPublicUrl(storagePath)

        const storageUrl = urlData?.publicUrl || null

        // Create document record with storage URL
        const document = await prisma.claimDocument.create({
            data: {
                claimId: claim.id,
                filename: file.name,
                docType: docType || null,
                uploadedByUserId: user.id,
                storageUrl: storageUrl
            }
        })

        // Create timeline event
        await prisma.claimEvent.create({
            data: {
                claimId: claim.id,
                eventType: ClaimEventType.DOCUMENT_UPLOADED,
                actorRole: user.role as Role,
                actorUserId: user.id,
                meta: {
                    filename: file.name,
                    docType: docType || null,
                    documentId: document.id
                }
            }
        })

        return NextResponse.json({
            success: true,
            document: {
                id: document.id,
                filename: document.filename,
                docType: document.docType,
                storageUrl: document.storageUrl
            }
        })
    } catch (error) {
        console.error('Document upload error:', error)

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'You must be logged in' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to upload document' },
            { status: 500 }
        )
    }
}
