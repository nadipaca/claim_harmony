import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallback for build time
const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const getSupabaseServiceKey = () => process.env.SUPABASE_SERVICE_KEY || ''

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createClient> | null = null
let _supabaseAdmin: ReturnType<typeof createClient> | null = null

// Client-side Supabase client (for browser use)
export const getSupabase = () => {
    if (!_supabase) {
        const url = getSupabaseUrl()
        const key = getSupabaseAnonKey()
        if (!url || !key) {
            throw new Error('Supabase environment variables are not configured')
        }
        _supabase = createClient(url, key)
    }
    return _supabase
}

// Server-side Supabase client with admin privileges (for API routes)
export const getSupabaseAdmin = () => {
    if (!_supabaseAdmin) {
        const url = getSupabaseUrl()
        const key = getSupabaseServiceKey()
        if (!url || !key) {
            throw new Error('Supabase admin environment variables are not configured')
        }
        _supabaseAdmin = createClient(url, key)
    }
    return _supabaseAdmin
}

// Legacy exports for backward compatibility
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
    get: (target, prop) => {
        return getSupabase()[prop as keyof ReturnType<typeof createClient>]
    }
})

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
    get: (target, prop) => {
        return getSupabaseAdmin()[prop as keyof ReturnType<typeof createClient>]
    }
})
