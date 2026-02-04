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
        <div className="min-h-screen flex" style={{ background: '#E5E7EB' }}>
            <div className="w-full max-w-6xl mx-auto flex rounded-2xl overflow-hidden shadow-xl my-8">
                {/* Left Panel - Branded */}
                <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: 'var(--ch-navy)' }}>
                    <div>
                        {/* Logo */}
                        <div className="flex items-center space-x-3 mb-16">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--ch-gold)' }}>
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-white">ClaimHarmony</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                            Simplify your<br />property claims.
                        </h1>
                        <p className="text-lg text-blue-100">
                            The trusted Florida network connecting<br />
                            homeowners with vetted restoration<br />
                            professionals.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="text-sm text-blue-200">
                        © 2026 ClaimHarmony Platform. All rights reserved.
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full lg:w-1/2 bg-white p-12 flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ch-text)' }}>
                                Welcome back
                            </h2>
                            <p className="text-gray-500">
                                Log in to your dashboard.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold uppercase mb-2" style={{ color: '#6B7280', letterSpacing: '0.05em' }}>
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="ch-input"
                                    placeholder="name@company.com"
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold uppercase mb-2" style={{ color: '#6B7280', letterSpacing: '0.05em' }}>
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="ch-input"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="ch-error rounded-lg px-4 py-3 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="primary-action w-full"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    href="/signup"
                                    className="font-semibold transition-colors hover:underline"
                                    style={{ color: 'var(--ch-navy)' }}
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        {/* Test Credentials - Development Only */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--ch-border)' }}>
                                <p className="text-xs font-medium mb-2" style={{ color: 'var(--ch-text)' }}>
                                    Test Credentials:
                                </p>
                                <div className="space-y-1 text-xs" style={{ color: '#6B7280' }}>
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
