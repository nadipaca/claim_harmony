import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import NewClaimForm from "./NewClaimForm"

export default async function NewClaimPage() {
    // RBAC: Require CONSUMER role
    await requireRole(["CONSUMER"])

    // Fetch insurance companies for dropdown
    const insuranceCompanies = await prisma.insuranceCompany.findMany({
        select: {
            id: true,
            name: true
        },
        orderBy: { name: 'asc' }
    })

    return <NewClaimForm insuranceCompanies={insuranceCompanies} />
}

