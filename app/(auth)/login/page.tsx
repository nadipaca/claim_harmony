'use client'

import { signIn } from 'next-auth/react'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            })

            if (result?.error) {
                setError('Invalid email or password')
                setLoading(false)
                return
            }

            const response = await fetch('/api/auth/session')
            const session = await response.json()

            if (session?.user?.role) {
                const roleRedirects: Record<string, string> = {
                    CONSUMER: '/consumer/claims',
                    CONTRACTOR: '/contractor/claims',
                    ADMIN: '/admin/claims'
                }

                const redirectUrl = roleRedirects[session.user.role] || '/'
                router.push(redirectUrl)
            } else {
                router.push('/')
            }
        } catch (err) {
            setError('An error occurred during login')
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#E5E7EB',
            padding: '2rem'
        }}>
            <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: '900px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}>
                {/* Left Panel - Branded */}
                <div style={{
                    width: '50%',
                    background: '#1E3A8A',
                    padding: '48px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '500px'
                }}>
                    <div>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '64px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: '#D4AF37',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>ClaimHarmony</span>
                        </div>

                        {/* Heading */}
                        <h1 style={{
                            fontSize: '42px',
                            fontWeight: 'bold',
                            color: 'white',
                            lineHeight: '1.2',
                            marginBottom: '24px'
                        }}>
                            Simplify your<br />property claims.
                        </h1>
                        <p style={{ fontSize: '16px', color: '#93C5FD', lineHeight: '1.6' }}>
                            The trusted Florida network connecting<br />
                            homeowners with vetted restoration<br />
                            professionals.
                        </p>
                    </div>

                    {/* Footer */}
                    <div style={{ fontSize: '14px', color: '#93C5FD' }}>
                        © 2026 ClaimHarmony Platform. All rights reserved.
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div style={{
                    width: '50%',
                    background: 'white',
                    padding: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ width: '100%', maxWidth: '320px' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0F172A', marginBottom: '8px' }}>
                                Welcome back
                            </h2>
                            <p style={{ color: '#6B7280' }}>
                                Log in to your dashboard.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#6B7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '8px'
                                }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="name@company.com"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Password Field */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#6B7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '8px'
                                }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div style={{
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    color: '#DC2626',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    marginBottom: '16px'
                                }}>
                                    {error}
                                </div>
                            )}

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: '#1E3A8A',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: '14px', color: '#6B7280' }}>
                                Don't have an account?{' '}
                                <Link href="/signup" style={{ color: '#1E3A8A', fontWeight: '600', textDecoration: 'underline' }}>
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        {/* Test Credentials - Development Only */}
                        {process.env.NODE_ENV === 'development' && (
                            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
                                <p style={{ fontSize: '12px', fontWeight: '500', color: '#0F172A', marginBottom: '8px' }}>
                                    Test Credentials:
                                </p>
                                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                    <p>Consumer: consumer@test.com / Password123!</p>
                                    <p>Contractor: contractor@test.com / Password123!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
