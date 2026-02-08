import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Role, ClaimEvent, ClaimDocument, User } from "@prisma/client"

type EventWithActor = ClaimEvent & {
    actorUser: Pick<User, 'name' | 'email'> | null
}

type DocumentWithUploader = ClaimDocument & {
    uploadedByUser: Pick<User, 'name' | 'email'>
}

// Event type labels
const eventLabels: Record<string, string> = {
    CLAIM_CREATED: 'Claim Created',
    CONTRACTOR_ACCEPTED: 'Contractor Accepted',
    DOCUMENT_UPLOADED: 'Document Uploaded'
}

// Event type colors
const eventColors: Record<string, { bg: string; text: string }> = {
    CLAIM_CREATED: { bg: '#1e3a5f', text: '#60a5fa' },
    CONTRACTOR_ACCEPTED: { bg: '#052e16', text: '#4ade80' },
    DOCUMENT_UPLOADED: { bg: '#422006', text: '#fbbf24' }
}

export default async function AdminClaimDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    // RBAC: Require ADMIN role
    await requireRole([Role.ADMIN])
    const { id } = await params

    // Fetch claim with all related data
    const claim = await prisma.claim.findUnique({
        where: { id },
        include: {
            insuranceCompany: true,
            consumer: {
                select: { id: true, name: true, email: true }
            },
            acceptedByContractor: {
                select: { id: true, name: true, email: true }
            },
            events: {
                orderBy: { createdAt: 'asc' },
                include: {
                    actorUser: {
                        select: { name: true, email: true }
                    }
                }
            },
            documents: {
                orderBy: { uploadedAt: 'desc' },
                include: {
                    uploadedByUser: {
                        select: { name: true, email: true }
                    }
                }
            }
        }
    })

    // Claim not found
    if (!claim) {
        notFound()
    }

    return (
        <div style={{ padding: '24px 32px', maxWidth: '1000px' }}>
            {/* Back Link */}
            <Link
                href="/admin/claims"
                style={{
                    color: '#64748B',
                    fontSize: '14px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '24px'
                }}
            >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to All Claims
            </Link>

            {/* Page Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '32px'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0F172A' }}>
                            {claim.claimNumber}
                        </h1>
                        <span style={{
                            background: claim.status === 'NEW' ? '#FEF3C7' : '#D1FAE5',
                            color: claim.status === 'NEW' ? '#92400E' : '#065F46',
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                        }}>
                            {claim.status}
                        </span>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '14px' }}>
                        Created {new Date(claim.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Claim Details Card */}
                <div style={{
                    background: 'white',
                    border: '1px solid #bebfc1ff',
                    borderRadius: '12px',
                    padding: '24px'
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '20px' }}>
                        Claim Details
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Property Address
                            </p>
                            <p style={{ color: '#0F172A', fontSize: '14px' }}>{claim.address}</p>
                        </div>
                        <div>
                            <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Claim Type
                            </p>
                            <span style={{
                                background: '#F1F5F9',
                                color: '#475569',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}>
                                {claim.type}
                            </span>
                        </div>
                        <div>
                            <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Description
                            </p>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                                {claim.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Parties Card */}
                <div style={{
                    background: 'white',
                    border: '1px solid #bebfc1ff',
                    borderRadius: '12px',
                    padding: '24px'
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '20px' }}>
                        Parties Involved
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Consumer
                            </p>
                            <p style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500' }}>
                                {claim.consumer.name || 'N/A'}
                            </p>
                            <p style={{ color: '#64748B', fontSize: '13px' }}>
                                {claim.consumer.email}
                            </p>
                        </div>
                        <div>
                            <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Contractor
                            </p>
                            {claim.acceptedByContractor ? (
                                <>
                                    <p style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500' }}>
                                        {claim.acceptedByContractor.name || 'N/A'}
                                    </p>
                                    <p style={{ color: '#64748B', fontSize: '13px' }}>
                                        {claim.acceptedByContractor.email}
                                    </p>
                                </>
                            ) : (
                                <p style={{ color: '#94A3B8', fontSize: '14px', fontStyle: 'italic' }}>
                                    Not assigned
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Insurance Company Card */}
            <div style={{
                background: 'white',
                border: '1px solid #bebfc1ff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '20px' }}>
                    Insurance Information
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Insurance Company
                        </p>
                        <p style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500' }}>
                            {claim.insuranceCompany.name}
                        </p>
                    </div>
                    <a
                        href={claim.insuranceCompany.claimsPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#1E3A8A',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            textDecoration: 'none'
                        }}
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open Insurance Portal
                    </a>
                </div>
            </div>

            {/* Timeline */}
            <div style={{
                background: 'white',
                border: '1px solid #bebfc1ff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '20px' }}>
                    Activity Timeline
                </h2>
                {claim.events.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontSize: '14px', fontStyle: 'italic' }}>
                        No events recorded yet.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {claim.events.map((event: EventWithActor, index: number) => (
                            <div
                                key={event.id}
                                style={{
                                    display: 'flex',
                                    gap: '16px',
                                    paddingBottom: index < claim.events.length - 1 ? '16px' : '0',
                                    borderBottom: index < claim.events.length - 1 ? '1px solid #E2E8F0' : 'none'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: eventColors[event.eventType]?.bg || '#F1F5F9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <svg width="18" height="18" fill="none" stroke={eventColors[event.eventType]?.text || '#64748B'} strokeWidth="2" viewBox="0 0 24 24">
                                        {event.eventType === 'CLAIM_CREATED' && (
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        )}
                                        {event.eventType === 'CONTRACTOR_ACCEPTED' && (
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        )}
                                        {event.eventType === 'DOCUMENT_UPLOADED' && (
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        )}
                                    </svg>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <p style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500' }}>
                                                {eventLabels[event.eventType] || event.eventType}
                                            </p>
                                            <p style={{ color: '#64748B', fontSize: '13px' }}>
                                                by {event.actorUser?.name || event.actorUser?.email || event.actorRole}
                                            </p>
                                        </div>
                                        <p style={{ color: '#94A3B8', fontSize: '12px' }}>
                                            {new Date(event.createdAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Documents */}
            <div style={{
                background: 'white',
                border: '1px solid #bebfc1ff',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '20px' }}>
                    Documents
                </h2>
                {claim.documents.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontSize: '14px', fontStyle: 'italic' }}>
                        No documents uploaded yet.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {claim.documents.map((doc: DocumentWithUploader) => (
                            <div
                                key={doc.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    background: '#F8FAFC',
                                    borderRadius: '8px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <svg width="20" height="20" fill="none" stroke="#64748B" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                        <p style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500' }}>
                                            {doc.filename}
                                        </p>
                                        <p style={{ color: '#64748B', fontSize: '12px' }}>
                                            Uploaded by {doc.uploadedByUser.name || doc.uploadedByUser.email} on {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {doc.storageUrl && (
                                    <a
                                        href={doc.storageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: '#1E3A8A',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        Open
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
