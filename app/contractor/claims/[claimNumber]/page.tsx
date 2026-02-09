import { requireRole, canAccessClaim } from "@/lib/rbac"
import { notFound } from "next/navigation"
import { Role } from "@prisma/client"
import { AcceptClaimButton } from "./AcceptClaimButton"
import { ClaimDetailView } from "@/components/claim"
import { getClaimDetailByNumber, normalizeClaimNumber } from "@/lib/claim-details"

export default async function ContractorClaimDetailPage({
    params,
}: {
    params: Promise<{ claimNumber: string }>
}) {
    const user = await requireRole([Role.CONTRACTOR])
    const { claimNumber } = await params

    const fullClaimNumber = normalizeClaimNumber(claimNumber)
    const claim = await getClaimDetailByNumber(fullClaimNumber)

    if (!claim) {
        notFound()
    }

    if (!canAccessClaim(user, claim)) {
        notFound()
    }

    const isAcceptedByCurrentUser = claim.status === "ACCEPTED" && claim.acceptedByContractorId === user.id
    const isAcceptedByOther = claim.status === "ACCEPTED" && claim.acceptedByContractorId !== user.id
    const canAccept = claim.status === "NEW"

    return (
        <ClaimDetailView
            claim={claim}
            backHref="/contractor/claims"
            pageBackground="#bababaff"
            headerRight={
                <>
                    {canAccept && <AcceptClaimButton claimId={claim.id} />}
                    {isAcceptedByCurrentUser && (
                        <span
                            style={{
                                background: "#D1FAE5",
                                color: "#065F46",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "600",
                            }}
                        >
                            ✓ Accepted by you
                        </span>
                    )}
                    {isAcceptedByOther && (
                        <span
                            style={{
                                background: "#FEE2E2",
                                color: "#991B1B",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "600",
                            }}
                        >
                            Already accepted
                        </span>
                    )}
                </>
            }
        />
    )
}
