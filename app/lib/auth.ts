import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "../../src/lib/prisma"

// Generate a dummy hash at module load time for constant-time comparison
// This prevents timing attacks by ensuring we always perform bcrypt.compare
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('dummy-password-for-timing-protection', 10)

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

                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(credentials.email)) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('[Auth] Invalid email format')
                    }
                    return null
                }

                if (process.env.NODE_ENV === 'development') {
                    console.log(`\n[Auth] Login attempt for: ${credentials.email}`)
                }
                const start = Date.now();

                // 1. DB Lookup with minimal fields
                const dbStart = Date.now();
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email.toLowerCase() },
                    select: {
                        id: true,
                        email: true,
                        passwordHash: true,
                        role: true,
                        name: true,
                    }
                })
                const dbEnd = Date.now();

                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Auth] DB Lookup took: ${dbEnd - dbStart}ms`)
                }

                // 2. Password verification (ALWAYS run to prevent timing attacks)
                const bcryptStart = Date.now();
                const passwordToCheck = user?.passwordHash ?? DUMMY_PASSWORD_HASH

                const isValid = await bcrypt.compare(
                    credentials.password,
                    passwordToCheck
                )
                const bcryptEnd = Date.now();

                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Auth] Password verification took: ${bcryptEnd - bcryptStart}ms`)
                    console.log(`[Auth] Total auth processing: ${bcryptEnd - start}ms\n`)
                }

                if (!user || !isValid) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`[Auth] Authentication failed (user found: ${!!user}, password valid: ${isValid})`)
                    }
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
