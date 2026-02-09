'use client'

import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

export default function SignOutPage() {
    const [loading, setLoading] = useState(false)

    async function handleSignOut() {
        setLoading(true)
        await signOut({ callbackUrl: '/login' })
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

                        <div className="relative flex flex-col items-center text-center md:items-start md:text-left gap-10">
                            <div className="flex items-center gap-5 justify-center md:justify-start w-full">
                                <Image src="/logo.svg" alt="ClaimHarmony" width={64} height={64} priority />
                                <div className="text-[28px] font-bold tracking-tight">
                                    Claim<span style={{ color: '#D4AF37' }}>Harmony</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-[clamp(28px,3.5vw,40px)] font-semibold leading-tight">
                                    Thanks for using
                                    <br />
                                    ClaimHarmony.
                                </h2>
                                <p className="mt-5 text-[15px] text-slate-300/90 max-w-[30ch] leading-relaxed mx-auto md:mx-0">
                                    Your session will be safely ended.
                                </p>
                            </div>
                        </div>

                        <div className="relative text-xs text-slate-400 mt-10 text-center md:text-left w-full">
                            © 2026 ClaimHarmony
                        </div>
                    </div>

                    <div className="md:w-1/2 p-8 sm:p-10 md:p-12 flex items-center">
                        <div className="w-full max-w-sm mx-auto">
                            <div className="flex items-center justify-center md:justify-start mb-4">
                                <div className="w-16 h-16 rounded-full bg-[#EEF2F6] flex items-center justify-center">
                                    <svg
                                        width="32"
                                        height="32"
                                        fill="none"
                                        stroke="#1E3A8A"
                                        strokeWidth="1.5"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-2xl font-semibold text-slate-900 text-center md:text-left">
                                Sign out of your account
                            </h2>
                            <p className="text-sm text-slate-500 text-center md:text-left mt-2">
                                Are you sure you want to sign out?
                            </p>

                            <div className="mt-8 space-y-3">
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    disabled={loading}
                                    className="w-full rounded-lg bg-[#1E3A8A] text-white py-3 text-sm font-semibold shadow-[0_10px_20px_-12px_rgba(30,58,138,0.7)] hover:bg-[#1E40AF] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Signing out...' : 'Yes, sign me out'}
                                </button>

                                <Link
                                    href="/"
                                    className="w-full rounded-lg bg-white border border-slate-300 text-slate-900 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center"
                                >
                                    Cancel
                                </Link>
                            </div>

                            <div className="mt-8 p-4 rounded-lg bg-[#EEF2F6] border border-slate-200">
                                <div className="flex items-start gap-3">
                                    <svg
                                        width="20"
                                        height="20"
                                        fill="none"
                                        stroke="#1E3A8A"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        className="flex-shrink-0 mt-0.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-900 mb-1">
                                            Signing out will end your session
                                        </p>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            You&apos;ll need to log in again to access your claims and workspace.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
