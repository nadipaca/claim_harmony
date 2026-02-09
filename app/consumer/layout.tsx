import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { AppShell } from "@/components/shell/AppShell"
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
            badgeColor="#0943c9"
            roleColor="#D4AF37"
            navItems={[
                { href: "/consumer/claims", label: "Dashboard", icon: "dashboard" },
                // { href: "/consumer/claims", label: "All Claims", icon: "claims" },
                // { href: "/consumer/claims", label: "Find Pros", icon: "users" },
            ]}
        >
            {children}
        </AppShell>
    )
}
