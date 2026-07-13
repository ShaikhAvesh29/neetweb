import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fallback.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-key'

// Browser/client-side client (use in Client Components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Alias for clarity
export const supabaseBrowser = supabase
