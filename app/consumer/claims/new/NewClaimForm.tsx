'use client'

import { useState } from 'react'
import { createClaim } from './actions'
import Link from 'next/link'

const CLAIM_TYPES = [
    { value: 'ROOF', label: 'Roof' },
    { value: 'WATER', label: 'Water' },
    { value: 'FIRE', label: 'Fire' },
    { value: 'MOLD', label: 'Mold' },
    { value: 'OTHER', label: 'Other' }
]

export default function NewClaimForm({
    insuranceCompanies
}: {
    insuranceCompanies: { id: string; name: string }[]
}) {
    const [step, setStep] = useState(1)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Form data
    const [address, setAddress] = useState('')
    const [insuranceCompanyId, setInsuranceCompanyId] = useState('')
    const [dateOfLoss, setDateOfLoss] = useState('')
    const [claimType, setClaimType] = useState('')
    const [description, setDescription] = useState('')
    const [isEmergency, setIsEmergency] = useState(false)

    const selectedInsurer = insuranceCompanies.find(c => c.id === insuranceCompanyId)

    async function handleSubmit() {
        setError(null)
        setLoading(true)

        const formData = new FormData()
        formData.set('address', address)
        formData.set('type', claimType)
        formData.set('description', description)
        formData.set('insuranceCompanyId', insuranceCompanyId)

        const result = await createClaim(formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    function canProceedStep1() {
        return address.length >= 5 && insuranceCompanyId
    }

    function canProceedStep2() {
        return claimType && description.length >= 10
    }

    return (
        <div style={{ padding: '24px 32px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}>
                    New Claim
                </h1>
                <p style={{ color: '#64748B', fontSize: '14px' }}>
                    Provide loss details to notify vetted professionals.
                </p>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: step >= 1 ? '#1E3A8A' : '#E2E8F0',
                        color: step >= 1 ? 'white' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '600'
                    }}>
                        {step > 1 ? '✓' : '1'}
                    </div>
                    <span style={{ fontSize: '11px', color: step >= 1 ? '#0F172A' : '#94A3B8', marginTop: '8px', textTransform: 'uppercase', fontWeight: '500' }}>Property</span>
                </div>

                <div style={{ flex: 1, height: '2px', background: step > 1 ? '#1E3A8A' : '#E2E8F0', marginBottom: '24px' }} />

                {/* Step 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: step >= 2 ? '#1E3A8A' : '#E2E8F0',
                        color: step >= 2 ? 'white' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '600'
                    }}>
                        {step > 2 ? '✓' : '2'}
                    </div>
                    <span style={{ fontSize: '11px', color: step >= 2 ? '#0F172A' : '#94A3B8', marginTop: '8px', textTransform: 'uppercase', fontWeight: '500' }}>Details</span>
                </div>

                <div style={{ flex: 1, height: '2px', background: step > 2 ? '#1E3A8A' : '#E2E8F0', marginBottom: '24px' }} />

                {/* Step 3 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: step >= 3 ? '#1E3A8A' : '#E2E8F0',
                        color: step >= 3 ? 'white' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '600'
                    }}>
                        3
                    </div>
                    <span style={{ fontSize: '11px', color: step >= 3 ? '#0F172A' : '#94A3B8', marginTop: '8px', textTransform: 'uppercase', fontWeight: '500' }}>Review</span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginBottom: '24px',
                    maxWidth: '560px',
                    margin: '0 auto 24px'
                }}>
                    {error}
                </div>
            )}

            {/* Form Card */}
            <div style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '560px',
                margin: '0 auto'
            }}>
                {/* Step 1: Property & Insurance */}
                {step === 1 && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <span style={{ fontSize: '18px' }}>🏠</span>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A' }}>Property & Insurance</h2>
                        </div>

                        {/* Property Address */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                color: '#64748B',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '8px'
                            }}>
                                Property Address
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Street address, City, State, ZIP"
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    color: '#0F172A',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* Insurance Carrier */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                color: '#64748B',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '8px'
                            }}>
                                Insurance Carrier
                            </label>
                            <select
                                value={insuranceCompanyId}
                                onChange={(e) => setInsuranceCompanyId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    color: insuranceCompanyId ? '#0F172A' : '#94A3B8',
                                    boxSizing: 'border-box',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Select your carrier...</option>
                                {insuranceCompanies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date of Loss */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{
                                display: 'block',
                                color: '#64748B',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '8px'
                            }}>
                                Date of Loss
                            </label>
                            <input
                                type="date"
                                value={dateOfLoss}
                                onChange={(e) => setDateOfLoss(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    color: dateOfLoss ? '#0F172A' : '#94A3B8',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Link
                                href="/consumer/claims"
                                style={{
                                    padding: '12px 24px',
                                    color: '#64748B',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none'
                                }}
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!canProceedStep1()}
                                style={{
                                    padding: '12px 32px',
                                    background: canProceedStep1() ? '#1E3A8A' : '#CBD5E1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: canProceedStep1() ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </>
                )}

                {/* Step 2: Loss Details */}
                {step === 2 && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <span style={{ fontSize: '18px' }}>📋</span>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A' }}>Loss Details</h2>
                        </div>

                        {/* Type of Claim */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                color: '#64748B',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '12px'
                            }}>
                                Type of Claim
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                {CLAIM_TYPES.slice(0, 3).map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setClaimType(type.value)}
                                        style={{
                                            padding: '12px',
                                            background: claimType === type.value ? '#EFF6FF' : '#F8FAFC',
                                            border: claimType === type.value ? '2px solid #1E3A8A' : '1px solid #E2E8F0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            color: claimType === type.value ? '#1E3A8A' : '#64748B',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
                                {CLAIM_TYPES.slice(3).map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setClaimType(type.value)}
                                        style={{
                                            padding: '12px',
                                            background: claimType === type.value ? '#EFF6FF' : '#F8FAFC',
                                            border: claimType === type.value ? '2px solid #1E3A8A' : '1px solid #E2E8F0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            color: claimType === type.value ? '#1E3A8A' : '#64748B',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Short Description */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                color: '#64748B',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '8px'
                            }}>
                                Short Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder='Tell us what happened. Be as specific as possible (e.g., "Shingles blown off south slope during hurricane").'
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    color: '#0F172A',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    lineHeight: '1.5'
                                }}
                            />
                        </div>

                        {/* Emergency Toggle */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px',
                            background: '#FFFBEB',
                            borderRadius: '8px',
                            marginBottom: '32px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '20px' }}>⚡</span>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                                        Emergency Mitigation Needed?
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                                        Check this if you need immediate assistance.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEmergency(!isEmergency)}
                                style={{
                                    width: '44px',
                                    height: '24px',
                                    borderRadius: '12px',
                                    background: isEmergency ? '#1E3A8A' : '#CBD5E1',
                                    border: 'none',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    position: 'absolute',
                                    top: '3px',
                                    left: isEmergency ? '23px' : '3px',
                                    transition: 'left 0.2s'
                                }} />
                            </button>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '12px 16px',
                                    color: '#64748B',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!canProceedStep2()}
                                style={{
                                    padding: '12px 32px',
                                    background: canProceedStep2() ? '#1E3A8A' : '#CBD5E1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: canProceedStep2() ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: Review & Submit */}
                {step === 3 && (
                    <>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '24px' }}>
                            Review & Submit
                        </h2>

                        {/* Review Summary */}
                        <div style={{
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
                                <span style={{ color: '#64748B', fontSize: '13px', textTransform: 'uppercase', fontWeight: '500' }}>Property</span>
                                <span style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500' }}>{address.split(',')[0] || address}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
                                <span style={{ color: '#64748B', fontSize: '13px', textTransform: 'uppercase', fontWeight: '500' }}>Insurance</span>
                                <span style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500' }}>{selectedInsurer?.name || 'Not Set'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
                                <span style={{ color: '#64748B', fontSize: '13px', textTransform: 'uppercase', fontWeight: '500' }}>Loss Type</span>
                                <span style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500' }}>{claimType || 'Not Set'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px' }}>
                                <span style={{ color: '#64748B', fontSize: '13px', textTransform: 'uppercase', fontWeight: '500' }}>Emergency</span>
                                <span style={{ color: isEmergency ? '#DC2626' : '#0F172A', fontSize: '14px', fontWeight: '500' }}>
                                    {isEmergency ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div style={{
                            border: '2px dashed #E2E8F0',
                            borderRadius: '8px',
                            padding: '32px',
                            textAlign: 'center',
                            marginBottom: '32px'
                        }}>
                            <svg width="32" height="32" fill="none" stroke="#94A3B8" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 12px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500', margin: '0 0 4px' }}>
                                Add Initial Photos or Policy Docs
                            </p>
                            <p style={{ color: '#94A3B8', fontSize: '12px', margin: 0 }}>
                                (Optional - max 16 MB)
                            </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                            <button
                                onClick={() => setStep(2)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '12px 16px',
                                    color: '#64748B',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{
                                    padding: '12px 32px',
                                    background: loading ? '#94A3B8' : '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'Submitting...' : 'Submit Claim Report'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
