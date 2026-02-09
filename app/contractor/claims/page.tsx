import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Role, Claim, InsuranceCompany } from "@prisma/client"

// Type for claims with included relations
type ClaimWithInsurer = Claim & {
    insuranceCompany: InsuranceCompany
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffMonths > 0) {
        return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`
    } else if (diffWeeks > 0) {
        return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`
    } else if (diffDays > 0) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
    } else if (diffHours > 0) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
    } else if (diffMinutes > 0) {
        return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`
    } else {
        return 'Just now'
    }
}

// Claim type badge colors
function getTypeBadgeStyle(type: string): { background: string; color: string } {
    switch (type) {
        case 'ROOF':
            return { background: '#FEF3C7', color: '#92400E' }
        case 'WATER':
            return { background: '#DBEAFE', color: '#1E40AF' }
        case 'FIRE':
            return { background: '#FEE2E2', color: '#991B1B' }
        case 'MOLD':
            return { background: '#D1FAE5', color: '#065F46' }
        default:
            return { background: '#F1F5F9', color: '#475569' }
    }
}

export default async function ContractorClaimsPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    // RBAC: Require CONTRACTOR role
    const user = await requireRole([Role.CONTRACTOR])
    const { tab } = await searchParams
    const activeTab = tab === 'active' ? 'active' : 'available'

    const userName = user.name || user.email?.split('@')[0] || 'Contractor'

    // Fetch available claims (status = NEW)
    const availableClaims = await prisma.claim.findMany({
        where: { status: 'NEW' },
        include: { insuranceCompany: true },
        orderBy: { createdAt: 'desc' }
    })

    // Fetch contractor's active jobs (status = ACCEPTED and accepted by this contractor)
    const activeClaims = await prisma.claim.findMany({
        where: {
            status: 'ACCEPTED',
            acceptedByContractorId: user.id
        },
        include: { insuranceCompany: true },
        orderBy: { createdAt: 'desc' }
    })

    const claims = activeTab === 'active' ? activeClaims : availableClaims

    return (
        <div className="chPageContainer">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}>
                        Job Board
                    </h1>
                    {/* Subtitle */}
                    <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
                        Review available claims in your area.
                    </p>
                </div>
                {/* <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: 'white',
                    border: '1px solid #a7a7a7ff',
                    borderRadius: '8px'
                }}>
                    <svg width="16" height="16" fill="none" stroke="#94A3B8" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search address or Claim ID..."
                        style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '14px',
                            color: '#0F172A',
                            width: '200px',
                            background: 'transparent'
                        }}
                    />
                </div> */}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #787878ff', marginBottom: '24px' }}>
                <Link
                    href="/contractor/claims?tab=available"
                    style={{
                        padding: '12px 0',
                        fontSize: '14px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        color: activeTab === 'available' ? '#1E3A8A' : '#64748B',
                        borderBottom: activeTab === 'available' ? '2px solid #1E3A8A' : '2px solid transparent',
                        marginBottom: '-1px'
                    }}
                >
                    Available ({availableClaims.length})
                </Link>
                <Link
                    href="/contractor/claims?tab=active"
                    style={{
                        padding: '12px 0',
                        fontSize: '14px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        color: activeTab === 'active' ? '#1E3A8A' : '#64748B',
                        borderBottom: activeTab === 'active' ? '2px solid #1E3A8A' : '2px solid transparent',
                        marginBottom: '-1px'
                    }}
                >
                    My Active Jobs ({activeClaims.length})
                </Link>
            </div>

            {/* Claims List */}
            {claims.length === 0 ? (
                <div style={{
                    background: 'white',
                    border: '1px solid #787878ff',
                    borderRadius: '12px',
                    padding: '48px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#F1F5F9',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <svg width="32" height="32" fill="none" stroke="#94A3B8" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                        {activeTab === 'active' ? 'No active jobs' : 'No available claims right now'}
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '14px' }}>
                        {activeTab === 'active'
                            ? 'Claims you accept will appear here.'
                            : 'Check back later for new claims in your area.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {claims.map((claim: ClaimWithInsurer) => {
                        const typeBadge = getTypeBadgeStyle(claim.type)
                        return (
                            <div
                                key={claim.id}
                                style={{
                                    background: 'white',
                                    border: '1px solid #bebfc1ff',
                                    borderRadius: '12px',
                                    padding: '20px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px'
                                }}
                            >
                                {/* House Icon */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: '#FEF9E7',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Image
                                        src="/home.svg"
                                        alt=""
                                        width={24}
                                        height={24}
                                    />
                                </div>

                                {/* Claim Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                                            {claim.address.split(',')[0]}
                                            {claim.address.includes(',') && (
                                                <span style={{ fontWeight: '400' }}>
                                                    , {claim.address.split(',').slice(1).join(',').trim()}
                                                </span>
                                            )}
                                        </h3>
                                        <span style={{
                                            ...typeBadge,
                                            padding: '3px 10px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {claim.type}
                                        </span>
                                    </div>
                                    <p style={{
                                        color: '#64748B',
                                        fontSize: '14px',
                                        margin: '0 0 8px 0',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {claim.description}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '13px' }}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                        </svg>
                                        Posted {getRelativeTime(new Date(claim.createdAt))}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Link
                                    href={`/contractor/claims/${claim.claimNumber.replace('CLM-', '')}`}
                                    style={{
                                        background: '#1E3A8A',
                                        color: 'white',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        textDecoration: 'none',
                                        flexShrink: 0
                                    }}
                                >
                                    {activeTab === 'active' ? 'View Details' : 'View & Accept'}
                                </Link>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

