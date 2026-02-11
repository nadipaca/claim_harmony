'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook that automatically refreshes JWT tokens before they expire
 * Checks token expiry and triggers refresh 1 minute before expiration
 */
export function useTokenRefresh() {
    const { data: session, status, update } = useSession()
    const router = useRouter()
    const refreshTimeoutRef = useRef<NodeJS.Timeout>()

    const refreshToken = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include', // Include cookies
            })

            if (response.ok) {
                const data = await response.json()

                if (process.env.NODE_ENV === 'development') {
                    console.log('[TokenRefresh] Token refreshed successfully')
                }

                // Update the session with new data
                await update({
                    ...session,
                    user: data.user
                })

                return true
            } else {
                console.error('[TokenRefresh] Refresh failed:', response.status)
                // Redirect to login if refresh fails
                router.push('/login?sessionExpired=true')
                return false
            }
        } catch (error) {
            console.error('[TokenRefresh] Error refreshing token:', error)
            router.push('/login?sessionExpired=true')
            return false
        }
    }, [session, update, router])

    useEffect(() => {
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current)
        }

        // Only set up refresh if user is authenticated
        if (status === 'authenticated' && session) {
            // Calculate time until token expires
            // Tokens expire in 15 minutes, refresh 1 minute before (14 minutes)
            const REFRESH_BEFORE_EXPIRY = 60 * 1000 // 1 minute in milliseconds
            const TOKEN_LIFETIME = 15 * 60 * 1000 // 15 minutes in milliseconds
            const timeUntilRefresh = TOKEN_LIFETIME - REFRESH_BEFORE_EXPIRY

            if (process.env.NODE_ENV === 'development') {
                console.log(`[TokenRefresh] Setting up refresh in ${timeUntilRefresh / 1000} seconds`)
            }

            // Set timeout to refresh token
            refreshTimeoutRef.current = setTimeout(() => {
                refreshToken()
            }, timeUntilRefresh)
        }

        // Cleanup on unmount
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current)
            }
        }
    }, [status, session, refreshToken])

    return {
        refreshToken,
        isAuthenticated: status === 'authenticated'
    }
}
