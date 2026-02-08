import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ContractorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    // RBAC: Only contractors can access contractor routes
    if (session.user.role !== "CONTRACTOR") {
        redirect("/unauthorized")
    }

    const userName = session.user.name || session.user.email?.split('@')[0] || 'User'

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Sidebar - Dark Blue */}
            <aside style={{
                width: '220px',
                background: '#233665',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}>
                {/* Logo */}
                <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#D4AF37',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>ClaimHarmony</span>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '8px 12px' }}>
                    <Link
                        href="/contractor/claims"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            color: 'rgba(255,255,255,0.7)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            marginBottom: '4px'
                        }}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link
                        href="/contractor/claims"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            color: 'rgba(255,255,255,0.7)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            marginBottom: '4px'
                        }}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Job Board
                    </Link>
                </nav>

                {/* User Profile */}
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#1E3A8A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ color: 'white', fontSize: '13px', fontWeight: '500', margin: 0 }}>{userName}</p>
                            <p style={{ color: '#D4AF37', fontSize: '10px', fontWeight: '600', margin: 0, textTransform: 'uppercase' }}>
                                {session.user.role}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/api/auth/signout"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '12px',
                            textDecoration: 'none'
                        }}
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </main>
        </div>
    )
}
