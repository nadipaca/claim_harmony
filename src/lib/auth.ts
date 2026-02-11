import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { generateRefreshToken, storeRefreshToken, revokeAllUserTokens } from "./refresh-token"

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

                // Return user object with refresh token for cookie setting
                const refreshToken = generateRefreshToken()
                await storeRefreshToken(user.id, refreshToken)

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    refreshToken // Will be used to set cookie
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
                // Add explicit expiry timestamp (15 minutes from now)
                token.exp = Math.floor(Date.now() / 1000) + (15 * 60)
                // Store refresh token temporarily for cookie setting
                if (user.refreshToken) {
                    token.refreshToken = user.refreshToken
                }
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
        strategy: "jwt",
        maxAge: 15 * 60, // 15 minutes
    },
    jwt: {
        maxAge: 15 * 60, // 15 minutes
    },
    events: {
        async signOut({ token }) {
            // Revoke all refresh tokens for user on signout
            if (token?.id) {
                await revokeAllUserTokens(token.id as string)
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Auth] Revoked all tokens for user: ${token.id}`)
                }
            }
        }
    },
    pages: {
        signIn: "/login",
        signOut: "/signout"
    }
}
