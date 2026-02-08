import { requireRole, canAccessClaim } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ClaimEvent, ClaimDocument, User } from "@prisma/client"
import { ClaimTimeline, ClaimDocuments } from "@/components/claim"

type EventWithActor = ClaimEvent & {
    actorUser: Pick<User, 'name' | 'email'> | null
}

type DocumentWithUploader = ClaimDocument & {
    uploadedByUser: Pick<User, 'name' | 'email'>
}

export default async function ClaimDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const user = await requireRole(["CONSUMER"])
    const { id } = await params

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

    if (!claim) {
        notFound()
    }

    if (!canAccessClaim(user, claim)) {
        notFound()
    }

    const userName = user.name || user.email?.split('@')[0] || 'User'

    return (
        <div style={{ padding: '24px 32px', background: '#F8FAFC', minHeight: '100vh' }}>
            {/* Page Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}>
                        Claim Detail
                    </h1>
                </div>
                {/* <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: 'white',
                    border: '1px solid #a7a7a7ff',
                    borderRadius: '8px',
                    width: '260px'
                }}>
                    <svg width="16" height="16" fill="none" stroke="#94A3B8" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span style={{ color: '#94A3B8', fontSize: '14px' }}>
                        Search address or Claim ID...
                    </span>
                </div> */}
            </div>

            {/* Main Content - Left (3/4) and Right (1/4) */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
                {/* Left Column - Claim Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* CARD 1: Claim Details */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px'
                    }}>
                        {/* Section 3a: Claim number + address (left) and Date of Loss (right) */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A' }}>
                                        #{claim.claimNumber.replace('CLM-', '')}
                                    </h2>
                                    <span style={{
                                        background: claim.status === 'NEW' ? '#FEF3C7' : '#1E3A8A',
                                        color: claim.status === 'NEW' ? '#92400E' : 'white',
                                        padding: '4px 12px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>
                                        {claim.status === 'ACCEPTED' ? 'CONTRACTOR ASSIGNED' : claim.status}
                                    </span>
                                </div>
                                <p style={{ color: '#64748B', fontSize: '14px' }}>
                                    {claim.address}
                                </p>
                            </div>
                            <div style={{
                                textAlign: 'right'
                            }}>
                                <p style={{
                                    color: '#64748B',
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '4px'
                                }}>
                                    DATE OF LOSS
                                </p>
                                <p style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600' }}>
                                    {new Date(claim.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Section 3b: Homeowner, Assigned Provider, Linked Carrier (3 columns) */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '16px'
                        }}>
                            {/* Homeowner - Full blue border */}
                            <div style={{
                                borderWidth: '1px 1px 1px 3px',
                                borderStyle: 'solid',
                                borderColor: '#1E3A8A',
                                borderRadius: '8px',
                                padding: '16px',
                                background: 'white'
                            }}>
                                <p style={{
                                    color: '#64748B',
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '12px'
                                }}>
                                    HOMEOWNER
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        background: '#1E3A8A',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '12px',
                                        flexShrink: 0
                                    }}>
                                        {(claim.consumer.name || claim.consumer.email)?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{
                                            color: '#0F172A',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {claim.consumer.name || 'Homeowner'}
                                        </p>
                                        <p style={{
                                            color: '#1E3A8A',
                                            fontSize: '11px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {claim.consumer.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Provider - Full gold border */}
                            <div style={{
                                borderWidth: '1px 1px 1px 3px',
                                borderStyle: 'solid',
                                borderColor: '#D4AF37',
                                borderRadius: '8px',
                                padding: '16px',
                                background: claim.acceptedByContractor ? '#FFFEF5' : 'white'
                            }}>
                                <p style={{
                                    color: '#64748B',
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '12px'
                                }}>
                                    ASSIGNED PROVIDER
                                </p>
                                {claim.acceptedByContractor ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            background: '#1E3A8A',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: '700',
                                            fontSize: '12px',
                                            flexShrink: 0
                                        }}>
                                            {(claim.acceptedByContractor.name || claim.acceptedByContractor.email)?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{
                                                color: '#0F172A',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {claim.acceptedByContractor.name || claim.acceptedByContractor.email}
                                            </p>
                                            <p style={{ color: '#1E3A8A', fontSize: '10px', fontWeight: '600' }}>
                                                VETTED PLATINUM
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: '#94A3B8', fontSize: '13px', fontStyle: 'italic' }}>
                                        Not yet assigned
                                    </p>
                                )}
                            </div>

                            {/* Linked Carrier - Full coral/red border */}
                            <div style={{
                                borderWidth: '1px 1px 1px 3px',
                                borderStyle: 'solid',
                                borderColor: '#F87171',
                                borderRadius: '8px',
                                padding: '16px',
                                background: 'white'
                            }}>
                                <p style={{
                                    color: '#64748B',
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '12px'
                                }}>
                                    LINKED CARRIER
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        background: '#DC2626',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '12px',
                                        flexShrink: 0
                                    }}>
                                        {claim.insuranceCompany.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{
                                            color: '#0F172A',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {claim.insuranceCompany.name}
                                        </p>
                                        <p style={{ color: '#1E3A8A', fontSize: '11px' }}>
                                            Policy #998-221-X
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3c: Loss Description */}
                        <div>
                            <p style={{
                                color: '#64748B',
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '8px'
                            }}>
                                LOSS DESCRIPTION
                            </p>
                            <p style={{
                                color: '#475569',
                                fontSize: '14px',
                                lineHeight: '1.7'
                            }}>
                                {claim.description}
                            </p>
                        </div>
                    </div>

                    {/* CARD 2: Activity Timeline */}
                    <ClaimTimeline events={claim.events as EventWithActor[]} />
                </div>

                {/* Right Column - Documents Card */}
                <div>
                    <ClaimDocuments
                        claimId={claim.id}
                        documents={claim.documents as DocumentWithUploader[]}
                    />
                </div>
            </div>
        </div>
    )
}
