import { requireRole, canAccessClaim } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Role, ClaimEvent, User } from "@prisma/client"
import { AcceptClaimButton } from "./AcceptClaimButton"

type EventWithActor = ClaimEvent & {
    actorUser: Pick<User, 'name' | 'email'> | null
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

export default async function ContractorClaimDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    // RBAC: Require CONTRACTOR role
    const user = await requireRole([Role.CONTRACTOR])
    const { id } = await params

    // Fetch claim with related data
    const claim = await prisma.claim.findUnique({
        where: { id },
        include: {
            insuranceCompany: true,
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
            }
        }
    })

    // Claim not found
    if (!claim) {
        notFound()
    }

    // RBAC: Check if contractor can access this claim
    if (!canAccessClaim(user, claim)) {
        notFound()
    }

    // Determine button state
    const isAcceptedByCurrentUser = claim.status === 'ACCEPTED' && claim.acceptedByContractorId === user.id
    const isAcceptedByOther = claim.status === 'ACCEPTED' && claim.acceptedByContractorId !== user.id
    const canAccept = claim.status === 'NEW'

    return (
        <div style={{ padding: '24px 32px', maxWidth: '900px' }}>
            {/* Back Link */}
            <Link
                href="/contractor/claims"
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
                Back to Job Board
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
                        Posted {new Date(claim.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                </div>

                {/* Accept Button */}
                <div>
                    {canAccept && (
                        <AcceptClaimButton claimId={claim.id} />
                    )}
                    {isAcceptedByCurrentUser && (
                        <button
                            disabled
                            style={{
                                background: '#D1FAE5',
                                color: '#065F46',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '14px',
                                border: 'none',
                                cursor: 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Accepted by you
                        </button>
                    )}
                    {isAcceptedByOther && (
                        <button
                            disabled
                            style={{
                                background: '#FEE2E2',
                                color: '#991B1B',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '14px',
                                border: 'none',
                                cursor: 'not-allowed'
                            }}
                        >
                            Already accepted
                        </button>
                    )}
                </div>
            </div>

            {/* Claim Details Card */}
            <div style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '20px' }}>
                    Claim Details
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                            Insurance Company
                        </p>
                        <p style={{ color: '#0F172A', fontSize: '14px' }}>{claim.insuranceCompany.name}</p>
                    </div>
                    {claim.acceptedByContractor && (
                        <div>
                            <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Assigned Contractor
                            </p>
                            <p style={{ color: '#0F172A', fontSize: '14px' }}>
                                {claim.acceptedByContractor.name || claim.acceptedByContractor.email}
                            </p>
                        </div>
                    )}
                </div>
                <div style={{ marginTop: '20px' }}>
                    <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Description
                    </p>
                    <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                        {claim.description}
                    </p>
                </div>
            </div>

            {/* Timeline */}
            <div style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '24px'
            }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '20px' }}>
                    Activity Timeline
                </h2>
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
            </div>
        </div>
    )
}
