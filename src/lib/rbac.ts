import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { Role } from "@prisma/client"

/**
 * Server-side authentication check
 * @throws Error if not authenticated
 * @returns User session data
 */
export async function requireAuth() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        throw new Error("Unauthorized: You must be logged in to access this resource")
    }

    return session.user
}

/**
 * Server-side role-based authorization check
 * @param allowedRoles - Array of roles that are allowed to access
 * @throws Error if not authenticated or role not authorized
 * @returns User session data
 */
export async function requireRole(allowedRoles: Role[]) {
    const user = await requireAuth()

    if (!allowedRoles.includes(user.role as Role)) {
        throw new Error(`Forbidden: Your role (${user.role}) is not authorized to access this resource`)
    }

    return user
}

/**
 * Check if a user can access a specific claim
 * @param user - Current user session
 * @param claim - Claim object with consumerId and acceptedByContractorId
 * @returns Boolean indicating if user can access the claim
 */
export function canAccessClaim(
    user: { id: string; role: string },
    claim: { consumerId: string; acceptedByContractorId?: string | null; status: string }
): boolean {
    // ADMIN can access all claims
    if (user.role === "ADMIN") {
        return true
    }

    // CONSUMER can only access their own claims
    if (user.role === "CONSUMER") {
        return claim.consumerId === user.id
    }

    // CONTRACTOR can access NEW claims or claims they accepted
    if (user.role === "CONTRACTOR") {
        return (
            claim.status === "NEW" ||
            claim.acceptedByContractorId === user.id
        )
    }

    return false
}
