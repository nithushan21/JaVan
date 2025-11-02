import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { trip_id, passenger_name, passenger_phone, seat_numbers } = req.body || {}
  if (!trip_id || !passenger_name || !passenger_phone || !seat_numbers) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const requested = Array.isArray(seat_numbers) ? seat_numbers.map(String) : String(seat_numbers).split(',').map(s => s.trim())

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('book-server: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL')
      return res.status(500).json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL missing' })
    }
    // Call the Postgres RPC with the service role key (server-side)
    const rpcRes = await supabaseAdmin.rpc('book_seats', { p_trip_id: trip_id, p_passenger_name: passenger_name, p_passenger_phone: passenger_phone, p_seat_numbers: requested.join(',') })

    if (rpcRes.error) {
      console.error('RPC error:', rpcRes.error)
      return res.status(500).json({ error: rpcRes.error.message })
    }

    const payload = Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data
    if (!payload) return res.status(500).json({ error: 'Empty RPC response' })

    if (payload.status === 'ok') return res.status(200).json({ message: 'Booking confirmed', id: payload.id })
    if (payload.status === 'conflict') return res.status(409).json({ error: 'Seats already booked', seats: payload.seats })

    // Unknown status
    return res.status(500).json({ error: 'Unexpected RPC result', detail: payload })
  } catch (err) {
    console.error('Server RPC call failed:', err)
    return res.status(500).json({ error: err.message })
  }
}
