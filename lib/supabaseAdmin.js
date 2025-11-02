import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  // It's okay to not throw here during local dev if keys are missing; the API will surface errors.
  console.warn('Supabase admin client not fully configured. Ensure SUPABASE_SERVICE_ROLE_KEY is set in the environment for server-side RPC calls.')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
