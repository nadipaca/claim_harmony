import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Claim, InsuranceCompany, User } from "@prisma/client"
import { ClaimsHistoryTable, type ClaimsHistoryRow } from "@/components/claims/ClaimsHistoryTable"

// Type for claims with included relations
type ClaimWithRelations = Claim & {
    insuranceCompany: InsuranceCompany | null
    acceptedByContractor: Pick<User, 'name' | 'email'> | null
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
    const diffYears = Math.floor(diffDays / 365)

    if (diffYears > 0) {
        return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`
    } else if (diffMonths > 0) {
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

export default async function ConsumerClaimsPage() {
    // RBAC: Require CONSUMER role
    const user = await requireRole(["CONSUMER"])

    // Fetch only this consumer's claims
    const claims = await prisma.claim.findMany({
        where: { consumerId: user.id },
        include: {
            insuranceCompany: true,
            acceptedByContractor: {
                select: { name: true, email: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    // Get priority active claims (most recent 3)
    const activeClaims = claims.slice(0, 3)
    const userName = user.name || user.email?.split('@')[0] || 'User'
    const historyClaims = claims.slice(0, 12)

    const historyRows: ClaimsHistoryRow[] = historyClaims.map((claim) => ({
        id: claim.id,
        createdAtIso: claim.createdAt.toISOString(),
        claimNumber: claim.claimNumber,
        address: claim.address,
        type: claim.type,
        status: claim.status,
    }))

    return (
        <div className="chPageContainer">
            {/* Header */}
            <div className="chPageHeader">
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}>
                        Dashboard
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '14px' }}>
                        Welcome back, {userName}.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link
                        href="/consumer/claims/new"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#1E3A8A',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '14px',
                            textDecoration: 'none'
                        }}
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Claim
                    </Link>
                </div>
            </div>

            {/* Priority Active Claims */}
            <div style={{ marginBottom: '32px' }}>
                <p style={{ color: '#64748B', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '16px' }}>
                    Priority Active Claims ({activeClaims.length})
                </p>

                {activeClaims.length === 0 ? (
                    <div style={{
                        background: 'white',
                        border: '1px solid #787878ff',
                        borderRadius: '12px',
                        padding: '48px 24px',
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
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                            No active claims
                        </h3>
                        <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>
                            Create your first claim to get started.
                        </p>
                        <Link
                            href="/consumer/claims/new"
                            style={{
                                display: 'inline-block',
                                background: '#1E3A8A',
                                color: 'white',
                                padding: '10px 24px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '14px',
                                textDecoration: 'none'
                            }}
                        >
                            Create New Claim
                        </Link>
                    </div>
                ) : (
                    <div className="chClaimCardsGrid">
                        {activeClaims.map((claim: ClaimWithRelations) => (
                            <div
                                key={claim.id}
                                style={{
                                    background: 'white',
                                    border: '1px solid #cbcbcbff',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    position: 'relative',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%'
                                }}
                            >
                                {/* Claim Type Badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <span style={{
                                        background: claim.type === 'ROOF' ? '#FEF3C7' :
                                            claim.type === 'WATER' ? '#DBEAFE' :
                                                claim.type === 'FIRE' ? '#FEE2E2' :
                                                    claim.type === 'MOLD' ? '#D1FAE5' : '#F1F5F9',
                                        color: claim.type === 'ROOF' ? '#92400E' :
                                            claim.type === 'WATER' ? '#1E40AF' :
                                                claim.type === 'FIRE' ? '#991B1B' :
                                                    claim.type === 'MOLD' ? '#065F46' : '#475569',
                                        padding: '4px 10px',
                                        borderRadius: '9999px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>
                                        {claim.type}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8', fontSize: '12px' }}>
                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                        </svg>
                                        {getRelativeTime(new Date(claim.createdAt))}
                                    </span>
                                </div>

                                {/* Address */}
                                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
                                    {claim.address.split(',')[0]}
                                </h3>

                                {/* Description with fixed height for alignment */}
                                <p style={{
                                    color: '#64748B',
                                    fontSize: '13px',
                                    lineHeight: '1.5',
                                    height: '40px',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    marginBottom: '16px'
                                }}>
                                    {claim.description}
                                </p>

                                {/* Spacer to push status to bottom */}
                                <div style={{ flex: 1, minHeight: '8px' }} />

                                {/* Status Indicator */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    background: claim.acceptedByContractor ? '#D1FAE5' : (claim.status === 'NEW' ? '#FEF3C7' : '#EFF6FF'),
                                    color: claim.acceptedByContractor ? '#065F46' : (claim.status === 'NEW' ? '#DC2626' : '#1E40AF'),
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }}>
                                    {claim.acceptedByContractor ? (
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : claim.status === 'NEW' ? (
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                                            <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    {claim.acceptedByContractor
                                        ? `Contractor Assigned`
                                        : (claim.status === 'NEW' ? 'Action Required' : 'Pending Review')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Claims History Table */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A' }}>
                        All Claims History
                    </h2>
                    <Link
                        href="/consumer/claims"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#1E3A8A',
                            fontSize: '14px',
                            fontWeight: '500',
                            textDecoration: 'none'
                        }}
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        View All Records
                    </Link>
                </div>

                {claims.length > 0 ? (
                    <ClaimsHistoryTable rows={historyRows} totalCount={claims.length} baseHref="/consumer/claims" />
                ) : (
                    <div style={{
                        background: 'white',
                        border: '1px solid #bebfc1ff',
                        borderRadius: '12px',
                        padding: '32px',
                        textAlign: 'center',
                        color: '#64748B'
                    }}>
                        No claims history yet.
                    </div>
                )}
            </div>
        </div>
    )
}

