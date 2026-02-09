export type UserLike =
    | {
          name?: string | null
          email?: string | null
      }
    | null
    | undefined

export function getUserDisplayName(user: UserLike, fallback: string): string {
    const trimmedName = user?.name?.trim()
    if (trimmedName) return trimmedName

    const trimmedEmail = user?.email?.trim()
    if (trimmedEmail) return trimmedEmail.split("@")[0] || fallback

    return fallback
}

