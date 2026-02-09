import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { AppShell } from "@/components/shell/AppShell"
import { ClaimsIcon, DashboardIcon, UsersIcon } from "@/components/shell/icons"
import { getUserDisplayName } from "@/lib/user"

export default async function ConsumerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== Role.CONSUMER) {
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
                { href: "/consumer/claims", label: "Dashboard", icon: <DashboardIcon /> },
                { href: "/consumer/claims", label: "All Claims", icon: <ClaimsIcon /> },
                { href: "/consumer/claims", label: "Find Pros", icon: <UsersIcon /> },
            ]}
        >
            {children}
        </AppShell>
    )
}
