import { supabaseAdmin } from '../../lib/supabaseAdmin'

// Safe debug endpoint to check server-side Supabase connectivity and how many trips exist.
// This endpoint does NOT return any secret keys. It returns counts and up to 5 sample ids.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('supabase-debug: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
    return res.status(500).json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL missing' })
  }

  try {
    // Get up to 5 trip ids and try to get a count (count support depends on client version)
    const { data, error, count } = await supabaseAdmin.from('trips').select('id', { count: 'exact' }).limit(5)
    if (error) {
      console.error('supabase-debug: select error', error)
      return res.status(500).json({ error: error.message })
    }

    const ids = (data || []).map(r => r.id).filter(Boolean)
    return res.status(200).json({ ok: true, count: typeof count === 'number' ? count : ids.length, sampleIds: ids })
  } catch (err) {
    console.error('supabase-debug unexpected error', err)
    return res.status(500).json({ error: err.message })
  }
}
