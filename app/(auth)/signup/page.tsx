'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

type Role = 'CONSUMER' | 'CONTRACTOR' | 'ADMIN'

export default function SignupPage() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2>(1)
    const [role, setRole] = useState<Role>('CONSUMER')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function handleRoleSelect(selectedRole: Role) {
        setRole(selectedRole)
    }

    function handleNextStep() {
        setStep(2)
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: role
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Registration failed')
                setLoading(false)
                return
            }

            const signInResult = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false
            })

            if (signInResult?.error) {
                router.push('/login')
                return
            }

            const roleRedirects: Record<Role, string> = {
                CONSUMER: '/consumer/claims',
                CONTRACTOR: '/contractor/claims',
                ADMIN: '/admin/claims'
            }

            router.push(roleRedirects[role])
        } catch (err) {
            setError('An error occurred during registration')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#E5E7EB' }}>
            {step === 1 ? (
                // Step 1: Account Type Selection
                <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-10">
                    {/* Back to Login */}
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm mb-8 transition-colors"
                        style={{ color: '#6B7280' }}
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to login
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-block text-xs font-bold uppercase px-3 py-1.5 rounded mb-4" style={{ background: '#FEF3C7', color: '#92400E', letterSpacing: '0.05em' }}>
                            SIGNUP FLOW
                        </div>
                        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--ch-text)' }}>
                            Select Account Type
                        </h1>
                        <p style={{ color: '#6B7280' }}>
                            Join the <span style={{ color: 'var(--ch-navy)' }}>ClaimHarmony</span> network.
                        </p>
                    </div>

                    {/* Account Type Cards */}
                    <div className="space-y-3 mb-8">
                        {/* Homeowner */}
                        <button
                            type="button"
                            onClick={() => handleRoleSelect('CONSUMER')}
                            className="w-full text-left border-2 rounded-lg p-4 transition-all"
                            style={{
                                borderColor: role === 'CONSUMER' ? 'var(--ch-gold)' : '#E5E7EB',
                                background: role === 'CONSUMER' ? '#FFFBEB' : 'white'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: role === 'CONSUMER' ? 'var(--ch-gold)' : '#F3F4F6' }}>
                                        <svg className="w-6 h-6" style={{ color: role === 'CONSUMER' ? 'white' : '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold" style={{ color: 'var(--ch-text)' }}>
                                            Homeowner
                                        </h3>
                                        <p className="text-sm" style={{ color: '#6B7280' }}>
                                            File a claim for property damage.
                                        </p>
                                    </div>
                                </div>
                                {role === 'CONSUMER' && (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--ch-gold)' }}>
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>

                        {/* Contractor */}
                        <button
                            type="button"
                            onClick={() => handleRoleSelect('CONTRACTOR')}
                            className="w-full text-left border-2 rounded-lg p-4 transition-all"
                            style={{
                                borderColor: role === 'CONTRACTOR' ? 'var(--ch-gold)' : '#E5E7EB',
                                background: role === 'CONTRACTOR' ? '#FFFBEB' : 'white'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: role === 'CONTRACTOR' ? 'var(--ch-gold)' : '#F3F4F6' }}>
                                        <svg className="w-6 h-6" style={{ color: role === 'CONTRACTOR' ? 'white' : '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold" style={{ color: 'var(--ch-text)' }}>
                                            Contractor
                                        </h3>
                                        <p className="text-sm" style={{ color: '#6B7280' }}>
                                            Find jobs and manage restoration leads.
                                        </p>
                                    </div>
                                </div>
                                {role === 'CONTRACTOR' && (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--ch-gold)' }}>
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>

                        {/* Public Adjuster */}
                        <button
                            type="button"
                            onClick={() => handleRoleSelect('ADMIN')}
                            className="w-full text-left border-2 rounded-lg p-4 transition-all"
                            style={{
                                borderColor: role === 'ADMIN' ? 'var(--ch-gold)' : '#E5E7EB',
                                background: role === 'ADMIN' ? '#FFFBEB' : 'white'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: role === 'ADMIN' ? 'var(--ch-gold)' : '#F3F4F6' }}>
                                        <svg className="w-6 h-6" style={{ color: role === 'ADMIN' ? 'white' : '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold" style={{ color: 'var(--ch-text)' }}>
                                            Public Adjuster
                                        </h3>
                                        <p className="text-sm" style={{ color: '#6B7280' }}>
                                            Represent policyholders in claims.
                                        </p>
                                    </div>
                                </div>
                                {role === 'ADMIN' && (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--ch-gold)' }}>
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Create Account Button */}
                    <button
                        onClick={handleNextStep}
                        className="primary-action w-full"
                    >
                        Create Account
                    </button>
                </div>
            ) : (
                // Step 2: User Details Form
                <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-10">
                    <div className="mb-8">
                        <button
                            onClick={() => setStep(1)}
                            className="inline-flex items-center font-medium mb-4 transition-colors text-sm"
                            style={{ color: '#6B7280' }}
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--ch-text)' }}>
                            Complete your profile
                        </h1>
                        <p style={{ color: '#6B7280' }}>
                            Account type:{' '}
                            <span className="font-semibold" style={{ color: 'var(--ch-text)' }}>
                                {role === 'CONSUMER' ? 'Homeowner' : role === 'CONTRACTOR' ? 'Contractor' : 'Public Adjuster'}
                            </span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-xs font-semibold uppercase mb-2" style={{ color: '#6B7280', letterSpacing: '0.05em' }}>
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="ch-input"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold uppercase mb-2" style={{ color: '#6B7280', letterSpacing: '0.05em' }}>
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="ch-input"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold uppercase mb-2" style={{ color: '#6B7280', letterSpacing: '0.05em' }}>
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="ch-input"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase mb-2" style={{ color: '#6B7280', letterSpacing: '0.05em' }}>
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                className="ch-input"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="ch-error rounded-lg px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="primary-action w-full"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

