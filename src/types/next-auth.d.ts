import "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            role: "CONSUMER" | "CONTRACTOR" | "ADMIN"
        }
    }

    interface User {
        id: string
        email: string
        name?: string | null
        role: "CONSUMER" | "CONTRACTOR" | "ADMIN"
        refreshToken?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: "CONSUMER" | "CONTRACTOR" | "ADMIN"
        email: string
        exp: number
        refreshToken?: string
    }
}
