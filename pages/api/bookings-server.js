import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { trip_id } = req.query
  if (!trip_id) return res.status(400).json({ error: 'Missing trip_id query parameter' })

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('bookings-server: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
      return res.status(500).json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL missing' })
    }
    // Validate trip_id looks like a UUID to avoid DB type errors and return a helpful error
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
    if (!uuidRegex.test(String(trip_id))) {
      return res.status(400).json({ error: "Invalid 'trip_id' format. Provide a valid trip UUID (copy it from /api/trips-server output)." })
    }
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('id,seat_numbers,passenger_name,created_at')
      .eq('trip_id', trip_id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  } catch (err) {
    console.error('bookings-server error:', err)
    return res.status(500).json({ error: err.message })
  }
}
