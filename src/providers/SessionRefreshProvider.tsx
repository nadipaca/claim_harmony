'use client'

import { SessionProvider } from 'next-auth/react'
import { useTokenRefresh } from '@/hooks/useTokenRefresh'

/**
 * Inner component that uses the token refresh hook
 * Must be inside SessionProvider to access session
 */
function TokenRefreshHandler({ children }: { children: React.ReactNode }) {
    useTokenRefresh()
    return <>{children}</>
}

/**
 * Provider component that wraps the app with NextAuth SessionProvider
 * and automatic token refresh functionality
 */
export function SessionRefreshProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider
            refetchInterval={14 * 60} // Refetch session every 14 minutes
            refetchOnWindowFocus={true} // Refetch when window regains focus
        >
            <TokenRefreshHandler>
                {children}
            </TokenRefreshHandler>
        </SessionProvider>
    )
}
