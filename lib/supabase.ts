import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — only created when Supabase env vars are present
// Prevents build-time crash when vars aren't set
let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 20
  )
}

// Keep backward compat — storage.ts uses `supabase` directly
// This is a proxy that returns null-safe calls
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    if (!client) {
      // Return a no-op chain so callers don't crash
      const noop: any = new Proxy(() => Promise.resolve({ data: null, error: new Error('Supabase not configured') }), {
        get: () => noop,
        apply: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      })
      return noop
    }
    const val = (client as any)[prop]
    return typeof val === 'function' ? val.bind(client) : val
  },
})