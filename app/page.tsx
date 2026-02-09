import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role) {
    redirect("/login")
  }

  const roleRedirects: Record<string, string> = {
    CONSUMER: "/consumer/claims",
    CONTRACTOR: "/contractor/claims",
    ADMIN: "/admin/claims",
  }

  redirect(roleRedirects[session.user.role] || "/login")
}
