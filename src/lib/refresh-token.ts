import { prisma } from "./prisma"
import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"

const REFRESH_TOKEN_EXPIRY_DAYS = 7

/**
 * Generates a cryptographically secure random refresh token
 * @returns Base64 encoded random token string
 */
export function generateRefreshToken(): string {
    return randomBytes(32).toString('base64url')
}

/**
 * Hashes a refresh token for secure database storage
 * @param token - Plain text token to hash
 * @returns Hashed token
 */
export async function hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10)
}

/**
 * Stores a hashed refresh token in the database
 * @param userId - User ID associated with the token
 * @param token - Plain text token to hash and store
 * @returns Created refresh token record
 */
export async function storeRefreshToken(userId: string, token: string) {
    const hashedToken = await hashRefreshToken(token)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

    return prisma.refreshToken.create({
        data: {
            userId,
            token: hashedToken,
            expiresAt
        }
    })
}

/**
 * Validates a refresh token and retrieves associated user
 * @param token - Plain text token to validate
 * @returns User data if token is valid, null otherwise
 */
export async function validateRefreshToken(token: string) {
    try {
        // Get all refresh tokens for all users (we need to compare hashes)
        const refreshTokens = await prisma.refreshToken.findMany({
            where: {
                expiresAt: {
                    gt: new Date() // Only get non-expired tokens
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true
                    }
                }
            }
        })

        // Find the matching token by comparing hashes
        for (const record of refreshTokens) {
            const isValid = await bcrypt.compare(token, record.token)
            if (isValid) {
                return {
                    user: record.user,
                    tokenId: record.id
                }
            }
        }

        return null
    } catch (error) {
        console.error('[RefreshToken] Validation error:', error)
        return null
    }
}

/**
 * Revokes a specific refresh token
 * @param tokenId - Token ID to revoke
 */
export async function revokeRefreshToken(tokenId: string) {
    try {
        await prisma.refreshToken.delete({
            where: { id: tokenId }
        })
        return true
    } catch (error) {
        console.error('[RefreshToken] Revocation error:', error)
        return false
    }
}

/**
 * Revokes all refresh tokens for a specific user
 * @param userId - User ID whose tokens should be revoked
 */
export async function revokeAllUserTokens(userId: string) {
    try {
        await prisma.refreshToken.deleteMany({
            where: { userId }
        })
        return true
    } catch (error) {
        console.error('[RefreshToken] Revoke all error:', error)
        return false
    }
}

/**
 * Removes expired refresh tokens from the database
 * @returns Number of tokens deleted
 */
export async function cleanupExpiredTokens() {
    try {
        const result = await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        })
        if (process.env.NODE_ENV === 'development') {
            console.log(`[RefreshToken] Cleaned up ${result.count} expired tokens`)
        }
        return result.count
    } catch (error) {
        console.error('[RefreshToken] Cleanup error:', error)
        return 0
    }
}
