import type { ReactNode } from "react"
import type { NavItem } from "./ShellFrame"
import { ShellFrame } from "./ShellFrame"

interface AppShellProps {
    children: ReactNode
    navItems: NavItem[]
    userName: string
    roleLabel: string
    badgeColor: string
    roleColor: string
}

export function AppShell({ children, navItems, userName, roleLabel, badgeColor, roleColor }: AppShellProps) {
    return (
        <ShellFrame navItems={navItems} userName={userName} roleLabel={roleLabel} badgeColor={badgeColor} roleColor={roleColor}>
            {children}
        </ShellFrame>
    )
}
