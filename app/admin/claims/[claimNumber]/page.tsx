import { requireRole } from "@/lib/rbac"
import { notFound } from "next/navigation"
import { Role } from "@prisma/client"
import { ClaimDetailView } from "@/components/claim"
import { getClaimDetailByNumber, normalizeClaimNumber } from "@/lib/claim-details"

export default async function AdminClaimDetailPage({
    params
}: {
    params: Promise<{ claimNumber: string }>
}) {
    await requireRole([Role.ADMIN])
    const { claimNumber } = await params

    const fullClaimNumber = normalizeClaimNumber(claimNumber)
    const claim = await getClaimDetailByNumber(fullClaimNumber)

    if (!claim) {
        notFound()
    }

    return <ClaimDetailView claim={claim} backHref="/admin/claims" />
}
