import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/rbac'
import { canAccessClaim } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

// GET - View or Download document
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; documentId: string }> }
) {
    try {
        // Authenticate user
        const user = await requireAuth()
        const { id: claimId, documentId } = await params

        // Check if this is a download request
        const url = new URL(request.url)
        const isDownload = url.searchParams.get('download') === 'true'

        // Fetch claim
        const claim = await prisma.claim.findUnique({
            where: { id: claimId },
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

        // Fetch document
        const document = await prisma.claimDocument.findUnique({
            where: { id: documentId }
        })

        if (!document || document.claimId !== claimId) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            )
        }

        if (!document.storageUrl) {
            return NextResponse.json(
                { error: 'Document file not available' },
                { status: 404 }
            )
        }

        // Extract storage path from URL
        const urlParts = document.storageUrl.split('/claims-docs/')
        if (urlParts.length < 2) {
            return NextResponse.json(
                { error: 'Invalid storage URL' },
                { status: 500 }
            )
        }
        const storagePath = decodeURIComponent(urlParts[1])

        // Download file from Supabase
        const { data, error } = await supabaseAdmin
            .storage
            .from('claims-docs')
            .download(storagePath)

        if (error || !data) {
            console.error('Supabase download error:', error)
            return NextResponse.json(
                { error: 'Failed to retrieve file' },
                { status: 500 }
            )
        }

        // Convert blob to buffer
        const buffer = Buffer.from(await data.arrayBuffer())

        // Determine content type
        const extension = document.filename.toLowerCase().split('.').pop()
        const contentTypes: Record<string, string> = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        }
        const contentType = contentTypes[extension || ''] || data.type || 'application/octet-stream'

        // Return file with proper headers
        const headers = new Headers()
        headers.set('Content-Type', contentType)
        headers.set('Content-Length', buffer.length.toString())

        if (isDownload) {
            // Force download with filename
            headers.set('Content-Disposition', `attachment; filename="${document.filename}"`)
        } else {
            // Allow inline viewing (especially for PDFs and images)
            headers.set('Content-Disposition', `inline; filename="${document.filename}"`)
        }

        return new NextResponse(buffer, { headers })

    } catch (error) {
        console.error('Document retrieval error:', error)

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'You must be logged in' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to retrieve document' },
            { status: 500 }
        )
    }
}
