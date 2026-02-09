'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptClaim } from './actions'

interface AcceptClaimButtonProps {
    claimId: string
}

export function AcceptClaimButton({ claimId }: AcceptClaimButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleAccept = () => {
        setError(null)
        startTransition(async () => {
            const result = await acceptClaim(claimId)
            if (result.error) {
                setError(result.error)
            } else {
                router.refresh()
            }
        })
    }

    return (
        <div>
            <button
                onClick={handleAccept}
                disabled={isPending}
                style={{
                    background: isPending ? '#94A3B8' : '#1E3A8A',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                {isPending ? (
                    <>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ animation: 'spin 1s linear infinite' }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Accepting...
                    </>
                ) : (
                    <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Accept Claim
                    </>
                )}
            </button>
            {error && (
                <p style={{
                    color: '#DC2626',
                    fontSize: '13px',
                    marginTop: '8px',
                    background: '#FEE2E2',
                    padding: '8px 12px',
                    borderRadius: '6px'
                }}>
                    {error}
                </p>
            )}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
