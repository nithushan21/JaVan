import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id, route, date } = req.query

  try {
    // Ensure admin client is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('trips-server: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
      return res.status(500).json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL missing' })
    }
    // If an 'id' is provided ensure it's a valid UUID; otherwise return a friendly error
    if (id) {
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
      if (!uuidRegex.test(String(id))) {
        return res.status(400).json({ error: "Invalid 'id' format. Provide a valid trip UUID or call this endpoint without 'id' to list trips." })
      }
    }
    let query = supabaseAdmin.from('trips').select('*')
    if (id) query = query.eq('id', id)
    if (route) query = query.ilike('route', `%${route}%`)
    if (date) query = query.eq('date', date)

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  } catch (err) {
    console.error('trips-server error:', err)
    return res.status(500).json({ error: err.message })
  }
}
