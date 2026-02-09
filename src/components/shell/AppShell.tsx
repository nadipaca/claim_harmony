import Link from "next/link"
import type { ReactNode } from "react"

export type NavItem = {
    href: string
    label: string
    icon: ReactNode
}

interface AppShellProps {
    children: ReactNode
    navItems: NavItem[]
    userName: string
    roleLabel: string
    badgeColor: string
    roleColor: string
}

export function AppShell({ children, navItems, userName, roleLabel, badgeColor, roleColor }: AppShellProps) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>
            <aside
                style={{
                    width: "220px",
                    background: "#233665",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                }}
            >
                <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                        style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            background: "#D4AF37",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                        </svg>
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>ClaimHarmony</span>
                </div>

                <nav style={{ flex: 1, padding: "8px 12px" }}>
                    {navItems.map((item) => (
                        <Link
                            key={`${item.href}:${item.label}`}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 12px",
                                borderRadius: "6px",
                                color: "rgba(255,255,255,0.7)",
                                textDecoration: "none",
                                fontSize: "14px",
                                marginBottom: "4px",
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: badgeColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "13px",
                                fontWeight: "600",
                            }}
                        >
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ color: "white", fontSize: "13px", fontWeight: "500", margin: 0 }}>{userName}</p>
                            <p
                                style={{
                                    color: roleColor,
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    margin: 0,
                                    textTransform: "uppercase",
                                }}
                            >
                                {roleLabel}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/api/auth/signout"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "12px",
                            textDecoration: "none",
                        }}
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                        Sign Out
                    </Link>
                </div>
            </aside>

            <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</main>
        </div>
    )
}
