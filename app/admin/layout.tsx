import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { AppShell } from "@/components/shell/AppShell"
import { ClaimsIcon, DashboardIcon, UsersIcon } from "@/components/shell/icons"
import { getUserDisplayName } from "@/lib/user"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    // RBAC: Only admins can access admin routes
    if (session.user.role !== Role.ADMIN) {
        redirect("/unauthorized")
    }

    const userName = getUserDisplayName(session.user, "Admin")

    return (
        <AppShell
            userName={userName}
            roleLabel={session.user.role}
            badgeColor="#DC2626"
            roleColor="#DC2626"
            navItems={[
                { href: "/admin/claims", label: "Dashboard", icon: <DashboardIcon /> },
                { href: "/admin/claims", label: "All Claims", icon: <ClaimsIcon /> },
                { href: "/admin/claims", label: "Users", icon: <UsersIcon /> },
            ]}
        >
            {children}
        </AppShell>
    )
}

