import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Role, Claim, InsuranceCompany, User } from "@prisma/client"

// Type for claims with included relations
type ClaimWithRelations = Claim & {
    insuranceCompany: InsuranceCompany
    consumer: Pick<User, 'id' | 'name' | 'email'>
    acceptedByContractor: Pick<User, 'id' | 'name' | 'email'> | null
}

export default async function AdminClaimsPage() {
    // RBAC: Require ADMIN role
    await requireRole([Role.ADMIN])

    // Fetch ALL claims with relations
    const claims = await prisma.claim.findMany({
        include: {
            insuranceCompany: true,
            consumer: {
                select: { id: true, name: true, email: true }
            },
            acceptedByContractor: {
                select: { id: true, name: true, email: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div style={{ padding: '24px 32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}>
                        All Claims
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '14px' }}>
                        View and manage all claims across all consumers.
                    </p>
                </div>
                <div style={{
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
                        placeholder="Search claims..."
                        style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '14px',
                            color: '#0F172A',
                            width: '200px',
                            background: 'transparent'
                        }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', marginTop: '16px' }}>
                <div style={{
                    background: 'white',
                    border: '1px solid #bebfc1ff',
                    borderRadius: '8px',
                    padding: '16px 24px',
                    minWidth: '140px'
                }}>
                    <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Total Claims</p>
                    <p style={{ color: '#0F172A', fontSize: '24px', fontWeight: 'bold' }}>{claims.length}</p>
                </div>
                <div style={{
                    background: 'white',
                    border: '1px solid #bebfc1ff',
                    borderRadius: '8px',
                    padding: '16px 24px',
                    minWidth: '140px'
                }}>
                    <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>New</p>
                    <p style={{ color: '#92400E', fontSize: '24px', fontWeight: 'bold' }}>
                        {claims.filter(c => c.status === 'NEW').length}
                    </p>
                </div>
                <div style={{
                    background: 'white',
                    border: '1px solid #bebfc1ff',
                    borderRadius: '8px',
                    padding: '16px 24px',
                    minWidth: '140px'
                }}>
                    <p style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Accepted</p>
                    <p style={{ color: '#065F46', fontSize: '24px', fontWeight: 'bold' }}>
                        {claims.filter(c => c.status === 'ACCEPTED').length}
                    </p>
                </div>
            </div>

            {/* Claims Table */}
            {claims.length === 0 ? (
                <div style={{
                    background: 'white',
                    border: '1px solid #bebfc1ff',
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                        No claims found
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '14px' }}>
                        There are no claims in the system yet.
                    </p>
                </div>
            ) : (
                <div style={{
                    background: 'white',
                    border: '1px solid #bebfc1ff',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC' }}>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748B', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Claim #</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748B', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748B', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Insurer</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748B', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Consumer</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748B', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Contractor</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748B', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '14px 20px', textAlign: 'right', color: '#64748B', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.map((claim: ClaimWithRelations) => (
                                <tr key={claim.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                                    <td style={{ padding: '16px 20px', color: '#1E3A8A', fontSize: '14px', fontWeight: '500' }}>
                                        {claim.claimNumber}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            background: claim.status === 'NEW' ? '#FEF3C7' : '#D1FAE5',
                                            color: claim.status === 'NEW' ? '#92400E' : '#065F46',
                                            padding: '4px 10px',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#0F172A', fontSize: '14px' }}>
                                        {claim.insuranceCompany.name}
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#0F172A', fontSize: '14px' }}>
                                        {claim.consumer.name || claim.consumer.email}
                                    </td>
                                    <td style={{ padding: '16px 20px', color: claim.acceptedByContractor ? '#0F172A' : '#94A3B8', fontSize: '14px' }}>
                                        {claim.acceptedByContractor
                                            ? (claim.acceptedByContractor.name || claim.acceptedByContractor.email)
                                            : '-'}
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#64748B', fontSize: '14px' }}>
                                        {new Date(claim.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                        <Link
                                            href={`/admin/claims/${claim.id}`}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                color: '#1E3A8A',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            View
                                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {claims.length > 0 && (
                        <div style={{
                            padding: '12px 20px',
                            borderTop: '1px solid #E2E8F0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: '#64748B',
                            fontSize: '13px'
                        }}>
                            <span>Showing 1-{claims.length} of {claims.length}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'white', color: '#64748B', cursor: 'pointer' }}>Previous</button>
                                <button style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'white', color: '#64748B', cursor: 'pointer' }}>Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
