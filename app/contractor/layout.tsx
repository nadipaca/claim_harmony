import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { AppShell } from "@/components/shell/AppShell"
import { DashboardIcon, JobBoardIcon } from "@/components/shell/icons"
import { getUserDisplayName } from "@/lib/user"

export default async function ContractorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    // RBAC: Only contractors can access contractor routes
    if (session.user.role !== Role.CONTRACTOR) {
        redirect("/unauthorized")
    }

    const userName = getUserDisplayName(session.user, "User")

    return (
        <AppShell
            userName={userName}
            roleLabel={session.user.role}
            badgeColor="#1E3A8A"
            roleColor="#D4AF37"
            navItems={[
                { href: "/contractor/claims", label: "Dashboard", icon: <DashboardIcon /> },
                { href: "/contractor/claims", label: "Job Board", icon: <JobBoardIcon /> },
            ]}
        >
            {children}
        </AppShell>
    )
}
