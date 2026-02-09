"use client"

import type { ReactNode } from "react"
import { useCallback, useSyncExternalStore } from "react"
import Link from "next/link"
import Image from "next/image"
import { ClaimsIcon, DashboardIcon, JobBoardIcon, UsersIcon } from "./icons"

export type ShellIconKey = "dashboard" | "claims" | "users" | "jobBoard"

export type NavItem = {
    href: string
    label: string
    icon: ShellIconKey
}

interface ShellFrameProps {
    children: ReactNode
    navItems: NavItem[]
    userName: string
    roleLabel: string
    badgeColor: string
    roleColor: string
}

function Icon({ icon }: { icon: ShellIconKey }) {
    switch (icon) {
        case "dashboard":
            return <DashboardIcon />
        case "claims":
            return <ClaimsIcon />
        case "users":
            return <UsersIcon />
        case "jobBoard":
            return <JobBoardIcon />
    }
}

const STORAGE_KEY = "claimHarmony.sidebarCollapsed"

export function ShellFrame({ children, navItems, userName, roleLabel, badgeColor, roleColor }: ShellFrameProps) {
    const [collapsed, setCollapsed] = useLocalStorageBoolean(STORAGE_KEY, false)

    return (
        <div
            className={collapsed ? "chShell chShell--collapsed" : "chShell"}
            style={{ display: "flex", height: "100dvh", minHeight: "100vh", background: "#F8FAFC", overflow: "hidden" }}
        >
            <aside
                style={{
                    width: collapsed ? "72px" : "220px",
                    transition: "width 160ms ease",
                    background: "#0E1A3A",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                    overflow: "hidden",
                }}
            >
                <div style={{ padding: "16px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "rgba(212, 175, 55, 0.12)",
                            border: "1px solid rgba(212, 175, 55, 0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Image src="/logo.svg" alt="ClaimHarmony" width={22} height={22} />
                    </div>
                    <span
                        className="chShell__brand"
                        style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "white",
                            // letterSpacing: "-0.02em",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            opacity: collapsed ? 0 : 1,
                            transition: "opacity 120ms ease",
                        }}
                    >
                        Claim<span style={{ color: "#D4AF37" }}>Harmony</span>
                    </span>

                    <button
                        type="button"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        onClick={() => setCollapsed((prev) => !prev)}
                        style={{
                            marginLeft: "auto",
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.18)",
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.9)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                        </svg>
                    </button>
                </div>

                <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
                    {navItems.map((item) => (
                        <Link
                            key={`${item.href}:${item.label}`}
                            href={item.href}
                            title={item.label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                color: "rgba(255,255,255,0.75)",
                                textDecoration: "none",
                                fontSize: "14px",
                                marginBottom: "4px",
                                justifyContent: "flex-start",
                            }}
                        >
                            <Icon icon={item.icon} />
                            <span
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    opacity: collapsed ? 0 : 1,
                                    width: collapsed ? 0 : "auto",
                                    transition: "opacity 120ms ease",
                                }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
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
                                flexShrink: 0,
                            }}
                        >
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div style={{ minWidth: 0 }}>
                                <p
                                    style={{
                                        color: "white",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        margin: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {userName}
                                </p>
                                <p
                                    style={{
                                        color: roleColor,
                                        fontSize: "10px",
                                        fontWeight: "600",
                                        margin: 0,
                                        textTransform: "uppercase",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {roleLabel}
                                </p>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/signout"
                        title="Sign Out"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "rgba(255,255,255,0.55)",
                            fontSize: "12px",
                            textDecoration: "none",
                            justifyContent: "flex-start",
                            paddingLeft: collapsed ?  "10px" :"20px",
                        }}
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                        {!collapsed && <span>Sign Out</span>}
                    </Link>
                </div>
            </aside>

            <main style={{ flex: 1, minWidth: 0, overflowY: "auto", overflowX: "hidden" }}>{children}</main>
        </div>
    )
}

const LOCAL_STORAGE_EVENT = "claimHarmony:localStorage"

function useLocalStorageBoolean(key: string, defaultValue: boolean) {
    const getSnapshot = useCallback(() => {
        try {
            const raw = window.localStorage.getItem(key)
            if (raw === null) return defaultValue
            return raw === "true"
        } catch {
            return defaultValue
        }
    }, [key, defaultValue])

    const getServerSnapshot = useCallback(() => defaultValue, [defaultValue])

    const subscribe = useCallback((onStoreChange: () => void) => {
        const handler = () => onStoreChange()
        window.addEventListener("storage", handler)
        window.addEventListener(LOCAL_STORAGE_EVENT, handler)
        return () => {
            window.removeEventListener("storage", handler)
            window.removeEventListener(LOCAL_STORAGE_EVENT, handler)
        }
    }, [])

    const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    const setValue = useCallback(
        (next: boolean | ((prev: boolean) => boolean)) => {
            const prev = getSnapshot()
            const nextValue = typeof next === "function" ? next(prev) : next
            try {
                window.localStorage.setItem(key, String(nextValue))
            } catch {
                // ignore
            }
            window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT))
        },
        [getSnapshot, key]
    )

    return [value, setValue] as const
}
