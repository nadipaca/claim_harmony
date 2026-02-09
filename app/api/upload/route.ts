import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase environment variables are not configured')
    }

    return createClient(supabaseUrl, supabaseServiceKey)
}

const MAX_FILE_SIZE = 16 * 1024 * 1024 // 16MB
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf',
]

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get Supabase client at runtime
        const supabaseAdmin = getSupabaseAdmin()

        const formData = await request.formData()
        const files = formData.getAll('files') as File[]

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 })
        }

        const uploadedFiles: Array<{
            filename: string
            path: string
            url: string
            size: number
            type: string
        }> = []

        for (const file of files) {
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File "${file.name}" exceeds maximum size of 16MB` },
                    { status: 400 }
                )
            }

            // Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: `File type "${file.type}" is not allowed. Allowed types: images, PDF` },
                    { status: 400 }
                )
            }

            // Generate unique filename
            const timestamp = Date.now()
            const randomId = Math.random().toString(36).substring(2, 8)
            const extension = file.name.split('.').pop()
            const sanitizedName = file.name
                .replace(/[^a-zA-Z0-9.-]/g, '_')
                .substring(0, 50)
            const uniqueFilename = `${session.user.id}/${timestamp}-${randomId}-${sanitizedName}`

            // Convert file to buffer
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            // Upload to Supabase Storage
            const { data, error } = await supabaseAdmin.storage
                .from('claims-docs')
                .upload(uniqueFilename, buffer, {
                    contentType: file.type,
                    upsert: false
                })

            if (error) {
                console.error('Supabase upload error:', error)
                return NextResponse.json(
                    { error: `Failed to upload "${file.name}": ${error.message}` },
                    { status: 500 }
                )
            }

            // Get public URL
            const { data: urlData } = supabaseAdmin.storage
                .from('claims-docs')
                .getPublicUrl(data.path)

            uploadedFiles.push({
                filename: file.name,
                path: data.path,
                url: urlData.publicUrl,
                size: file.size,
                type: file.type
            })
        }

        return NextResponse.json({
            success: true,
            files: uploadedFiles
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Internal server error during upload' },
            { status: 500 }
        )
    }
}

