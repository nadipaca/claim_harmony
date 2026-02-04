'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createClaim } from './actions'
import Link from 'next/link'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            style={{
                background: pending ? '#71717a' : '#D4AF37',
                color: '#000',
                padding: '14px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: pending ? 'not-allowed' : 'pointer',
                width: '100%'
            }}
        >
            {pending ? 'Creating Claim...' : 'Create Claim'}
        </button>
    )
}

export default function NewClaimPage({
    insuranceCompanies
}: {
    insuranceCompanies: { id: string; name: string }[]
}) {
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        const result = await createClaim(formData)
        if (result?.error) {
            setError(result.error)
        }
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Back Link */}
            <Link
                href="/consumer/claims"
                style={{
                    color: '#a1a1aa',
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
                Back to Claims
            </Link>

            {/* Page Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    Create New Claim
                </h1>
                <p style={{ color: '#71717a', fontSize: '14px' }}>
                    Fill out the form below to submit a new property claim.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    background: '#450a0a',
                    border: '1px solid #dc2626',
                    color: '#fca5a5',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginBottom: '24px'
                }}>
                    {error}
                </div>
            )}

            {/* Form */}
            <form action={handleSubmit}>
                <div style={{
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    padding: '24px'
                }}>
                    {/* Address */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            color: '#e4e4e7',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '8px'
                        }}>
                            Property Address *
                        </label>
                        <input
                            type="text"
                            name="address"
                            required
                            minLength={5}
                            placeholder="123 Main Street, Miami, FL 33101"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: '#09090b',
                                border: '1px solid #27272a',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Claim Type */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            color: '#e4e4e7',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '8px'
                        }}>
                            Claim Type *
                        </label>
                        <select
                            name="type"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: '#09090b',
                                border: '1px solid #27272a',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        >
                            <option value="">Select claim type...</option>
                            <option value="ROOF">Roof Damage</option>
                            <option value="WATER">Water Damage</option>
                            <option value="FIRE">Fire Damage</option>
                            <option value="MOLD">Mold Damage</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Insurance Company */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            color: '#e4e4e7',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '8px'
                        }}>
                            Insurance Company *
                        </label>
                        <select
                            name="insuranceCompanyId"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: '#09090b',
                                border: '1px solid #27272a',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        >
                            <option value="">Select insurance company...</option>
                            {insuranceCompanies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            color: '#e4e4e7',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '8px'
                        }}>
                            Description *
                        </label>
                        <textarea
                            name="description"
                            required
                            minLength={10}
                            rows={4}
                            placeholder="Describe the damage and circumstances..."
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: '#09090b',
                                border: '1px solid #27272a',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '14px',
                                resize: 'vertical',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Submit Button */}
                    <SubmitButton />
                </div>
            </form>
        </div>
    )
}
