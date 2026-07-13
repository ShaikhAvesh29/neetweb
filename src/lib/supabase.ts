import { createClient } from '@supabase/supabase-js'

const supabaseUrl = typeof window !== "undefined" 
  ? window.location.origin + "/supabase-api" 
  : process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser/client-side client (use in Client Components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Alias for clarity
export const supabaseBrowser = supabase
