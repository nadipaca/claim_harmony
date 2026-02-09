import { requireRole, canAccessClaim } from "@/lib/rbac"
import { notFound } from "next/navigation"
import { ClaimDetailView } from "@/components/claim"
import { getClaimDetailByNumber, normalizeClaimNumber } from "@/lib/claim-details"

export default async function ConsumerClaimDetailPage({
    params,
}: {
    params: Promise<{ claimNumber: string }>
}) {
    const user = await requireRole(["CONSUMER"])
    const { claimNumber } = await params

    const fullClaimNumber = normalizeClaimNumber(claimNumber)
    const claim = await getClaimDetailByNumber(fullClaimNumber)

    if (!claim) {
        notFound()
    }

    if (!canAccessClaim(user, claim)) {
        notFound()
    }

    return <ClaimDetailView claim={claim} backHref="/consumer/claims" />
}

