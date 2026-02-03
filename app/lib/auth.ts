import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "../../src/lib/prisma"

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                // Find user by email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user) {
                    return null
                }

                // Verify password
                const isValidPassword = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                )

                if (!isValidPassword) {
                    return null
                }

                // Return user object
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Persist user data in token on sign in
            if (user) {
                token.id = user.id
                token.role = user.role
                token.email = user.email
            }
            return token
        },
        async session({ session, token }) {
            // Add user data to session
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as "CONSUMER" | "CONTRACTOR" | "ADMIN"
                session.user.email = token.email as string
            }
            return session
        }
    },
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    }
}
