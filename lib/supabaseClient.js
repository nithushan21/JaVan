import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
	// This will run on the server at build time or in Node env; provide a helpful console message.
	// The client bundle will also include these values when built; missing values usually cause runtime network errors.
	console.warn('Supabase client not configured: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
