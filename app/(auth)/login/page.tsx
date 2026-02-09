'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import type { FormEvent } from 'react'
import { useState } from 'react'

const TEST_CREDENTIALS = [
    { label: 'Consumer', email: 'consumer@test.com', password: 'Password123!' },
    { label: 'Contractor', email: 'contractor@test.com', password: 'Password123!' },
    { label: 'Admin', email: 'admin@test.com', password: 'Password123!' },
] as const

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
                redirect: false,
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
                    ADMIN: '/admin/claims',
                }

                const redirectUrl = roleRedirects[session.user.role] || '/'
                router.push(redirectUrl)
            } else {
                router.push('/')
            }
        } catch {
            setError('An error occurred during login')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EEF2F6] px-4 py-10">
            <div className="w-full max-w-[980px] rounded-2xl overflow-hidden shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)] bg-white border border-slate-300">
                <div className="flex flex-col md:flex-row min-h-[560px]">
                    <div
                        className="md:w-1/2 relative text-white p-8 sm:p-10 md:p-12 flex flex-col justify-between"
                        style={{
                            background: 'linear-gradient(135deg, #0B1220 0%, #0B132B 55%, #0E1A3A 100%)',
                        }}
                    >
                        <div
                            aria-hidden
                            className="absolute inset-0"
                            style={{
                                background:
                                    'radial-gradient(600px 300px at 20% 15%, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0) 60%), radial-gradient(500px 300px at 85% 70%, rgba(30,58,138,0.28) 0%, rgba(30,58,138,0) 60%)',
                            }}
                        />

                        <div className="relative flex flex-col items-start gap-10">
                            <div className="flex items-center gap-5">
                                <Image src="/logo.svg" alt="ClaimHarmony" width={64} height={64} priority />
                                <div className="text-[28px] font-bold tracking-tight">
                                    Claim<span style={{ color: '#D4AF37' }}>Harmony</span>
                                </div>
                            </div>
                            <div>
                            <h2 className="text-[clamp(28px,3.5vw,40px)] font-semibold leading-tight">
                                Simplify your property
                                <br />
                                claims.
                            </h2>
                            <p className="mt-5 text-[15px] text-slate-300/90 max-w-[30ch] leading-relaxed">
                                Connected, vetted, and resolved.
                            </p>
                            </div>
                        </div>

                        <div className="relative text-xs text-slate-400 mt-10">© 2026 ClaimHarmony</div>
                    </div>

                    <div className="md:w-1/2 p-8 sm:p-10 md:p-12 flex items-center">
                        <div className="w-full max-w-sm mx-auto">
                            <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
                            <p className="text-sm text-slate-500">Log in to your workspace.</p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Email address"
                                    autoComplete="email"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10"
                                />

                                {error && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-lg bg-[#1E3A8A] text-white py-3 text-sm font-semibold shadow-[0_10px_20px_-12px_rgba(30,58,138,0.7)] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>

                            <div className="mt-6 text-center text-sm text-slate-600">
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className="text-[#1E3A8A] font-semibold hover:underline">
                                    Sign up
                                </Link>
                            </div>

                            <div className="pt-6 border-t border-slate-200">
                                <div className="text-xs font-semibold text-slate-900 mb-3">Test credentials <span className="text-xs text-slate-400 mb-3 pl-3">[ click row to autofill credentials ]</span></div>
                                <div className="space-y-2">
                                    {TEST_CREDENTIALS.map((cred) => (
                                        <button
                                            key={cred.label}
                                            type="button"
                                            onClick={() => {
                                                setEmail(cred.email)
                                                setPassword(cred.password)
                                            }}
                                            className="w-full text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold text-slate-900">{cred.label}</div>
                                                
                                                </div>
                                                <div className="text-xs text-slate-600 truncate">{cred.email}</div>
                                                <div className="text-xs font-mono text-slate-500 flex-shrink-0">{cred.password}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

