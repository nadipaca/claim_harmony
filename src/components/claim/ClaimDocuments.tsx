'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ClaimDocument, User } from '@prisma/client'

type DocumentWithUploader = ClaimDocument & {
    uploadedByUser: Pick<User, 'name' | 'email'>
}

interface ClaimDocumentsProps {
    claimId: string
    documents: DocumentWithUploader[]
}

// PDF Icon (Google Docs style - red)
function PdfIcon() {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="6" fill="#EA4335" />
            <path d="M10 8h10l6 6v14a2 2 0 01-2 2H10a2 2 0 01-2-2V10a2 2 0 012-2z" fill="#fff" fillOpacity="0.9" />
            <path d="M20 8l6 6h-4a2 2 0 01-2-2V8z" fill="#EA4335" fillOpacity="0.4" />
            <text x="12" y="24" fontSize="7" fontWeight="bold" fill="#EA4335">PDF</text>
        </svg>
    )
}

// Image Icon (Google Docs style - blue)
function ImageIcon() {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="6" fill="#4285F4" />
            <rect x="8" y="10" width="20" height="16" rx="2" fill="#fff" fillOpacity="0.9" />
            <circle cx="13" cy="15" r="2" fill="#4285F4" fillOpacity="0.6" />
            <path d="M8 22l5-4 3 2 6-5 6 5v4a2 2 0 01-2 2H10a2 2 0 01-2-2v-2z" fill="#4285F4" fillOpacity="0.4" />
        </svg>
    )
}

// Generic Document Icon (gold/yellow)
function DocIcon() {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="6" fill="#FBBC04" />
            <path d="M10 8h10l6 6v14a2 2 0 01-2 2H10a2 2 0 01-2-2V10a2 2 0 012-2z" fill="#fff" fillOpacity="0.9" />
            <path d="M20 8l6 6h-4a2 2 0 01-2-2V8z" fill="#FBBC04" fillOpacity="0.4" />
            <rect x="11" y="18" width="10" height="1.5" rx="0.75" fill="#FBBC04" fillOpacity="0.6" />
            <rect x="11" y="21" width="8" height="1.5" rx="0.75" fill="#FBBC04" fillOpacity="0.6" />
            <rect x="11" y="24" width="6" height="1.5" rx="0.75" fill="#FBBC04" fillOpacity="0.6" />
        </svg>
    )
}

// Get appropriate icon based on file extension
function FileIcon({ filename }: { filename: string }) {
    const ext = filename.toLowerCase().split('.').pop()
    if (ext === 'pdf') return <PdfIcon />
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext || '')) return <ImageIcon />
    return <DocIcon />
}

export function ClaimDocuments({ claimId, documents }: ClaimDocumentsProps) {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Handle file selection - accumulate files
    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (files && files.length > 0) {
            const newFiles = Array.from(files)
            setSelectedFiles(prev => [...prev, ...newFiles])
            setError(null)
        }
        // Reset input value so the same file can be selected again
        e.target.value = ''
    }

    // Remove a file from the selected list
    function handleRemoveFile(index: number) {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    // Clear all selected files
    function handleClearAll() {
        setSelectedFiles([])
    }

    // Upload all selected files
    async function handleUpload() {
        if (selectedFiles.length === 0) {
            setError('Please select at least one file')
            return
        }

        setError(null)
        setIsUploading(true)

        try {
            // Upload each file sequentially
            for (const file of selectedFiles) {
                const formData = new FormData()
                formData.append('file', file)

                const response = await fetch(`/api/claims/${claimId}/documents`, {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || `Failed to upload ${file.name}`)
                }
            }

            // Clear selected files and refresh page
            setSelectedFiles([])
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    // Download a document
    async function handleDownload(documentId: string, filename: string) {
        try {
            const response = await fetch(`/api/claims/${claimId}/documents/${documentId}?download=true`)
            if (!response.ok) {
                throw new Error('Download failed')
            }
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch (err) {
            console.error('Download failed:', err)
        }
    }

    // Format file size
    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #8d8e90ff',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            {/* Header with attachments count */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                    Attachments
                </span>
                <span style={{
                    color: '#64748B',
                    fontSize: '11px',
                    fontWeight: '500'
                }}>
                    {documents.length} ITEMS
                </span>
            </div>

            {/* Existing documents list */}
            {documents.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                background: 'white'
                            }}
                        >
                            <div style={{ flexShrink: 0 }}>
                                <FileIcon filename={doc.filename} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    color: '#0F172A',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    marginBottom: '2px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {doc.filename}
                                </p>
                                <p style={{ color: '#94A3B8', fontSize: '11px' }}>
                                    {doc.docType || 'document'}
                                </p>
                            </div>
                            {/* Download button */}
                            <button
                                onClick={() => handleDownload(doc.id, doc.filename)}
                                title="Download document"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    background: '#F1F5F9',
                                    color: '#64748B',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload section */}
            <div>
                {/* Drop zone */}
                <label
                    htmlFor="file-upload"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px 16px',
                        border: '2px dashed #CBD5E1',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: 'white'
                    }}
                >
                    <svg width="24" height="24" fill="none" stroke="#94A3B8" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span style={{
                        color: '#0F172A',
                        fontSize: '13px',
                        fontWeight: '500',
                        marginTop: '8px'
                    }}>
                        Click to select files
                    </span>
                    <span style={{
                        color: '#94A3B8',
                        fontSize: '10px',
                        marginTop: '4px',
                        textTransform: 'uppercase'
                    }}>
                        SUPPORTS JPG, PNG, PDF (Multiple files allowed)
                    </span>
                    <input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        disabled={isUploading}
                    />
                </label>

                {/* Selected files preview list */}
                {selectedFiles.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                        }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                                Selected Files ({selectedFiles.length})
                            </span>
                            <button
                                onClick={handleClearAll}
                                type="button"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#DC2626',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Clear All
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={`${file.name}-${index}-${file.size}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        background: '#F8FAFC'
                                    }}
                                >
                                    <div style={{ flexShrink: 0, transform: 'scale(0.8)', transformOrigin: 'left center' }}>
                                        <FileIcon filename={file.name} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            color: '#0F172A',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {file.name}
                                        </p>
                                        <p style={{ color: '#94A3B8', fontSize: '11px' }}>
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                    {/* Remove button */}
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        type="button"
                                        title="Remove file"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            background: 'transparent',
                                            color: '#DC2626',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px' }}>
                        {error}
                    </p>
                )}

                {/* Upload button - only show when files are selected */}
                {selectedFiles.length > 0 && (
                    <button
                        onClick={handleUpload}
                        type="button"
                        disabled={isUploading}
                        style={{
                            width: '100%',
                            marginTop: '12px',
                            padding: '12px',
                            background: isUploading ? '#94A3B8' : '#1E3A8A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: isUploading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
                    </button>
                )}
            </div>
        </div>
    )
}
