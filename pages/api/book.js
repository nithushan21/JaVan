import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { trip_id, passenger_name, passenger_phone, seat_numbers } = req.body
    if (!trip_id || !passenger_name || !passenger_phone || !seat_numbers) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Normalize seat numbers to array of strings
    const requested = Array.isArray(seat_numbers) ? seat_numbers.map(String) : String(seat_numbers).split(',').map(s => s.trim())

    // Fetch existing bookings for the trip
    const { data: existingBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('seat_numbers')
      .eq('trip_id', trip_id)

    if (fetchError) return res.status(500).json({ error: fetchError.message })

    const alreadyBooked = new Set(existingBookings.flatMap(b => b.seat_numbers ? b.seat_numbers.split(',').map(s => s.trim()) : []))

    const overlap = requested.filter(s => alreadyBooked.has(s))
    if (overlap.length > 0) {
      return res.status(409).json({ error: 'Some seats are already booked', seats: overlap })
    }

    // Attempt to perform an atomic booking via a Postgres RPC (preferred)
    try {
      const rpcRes = await supabase.rpc('book_seats', { p_trip_id: trip_id, p_passenger_name: passenger_name, p_passenger_phone: passenger_phone, p_seat_numbers: requested.join(',') })
      if (rpcRes.error) {
        // If RPC isn't available or errors, fallthrough to client-side check/insert below
        console.log('RPC error or not available:', rpcRes.error.message)
      } else {
        const payload = rpcRes.data
        // Supabase returns rpc results as an array for some drivers
        const result = Array.isArray(payload) ? payload[0] : payload
        if (result.status === 'ok') return res.status(200).json({ message: 'Booking confirmed', id: result.id })
        if (result.status === 'conflict') return res.status(409).json({ error: 'Seats already booked', seats: result.seats })
        return res.status(500).json({ error: 'RPC booking error', detail: result })
      }
    } catch (rpcErr) {
      // ignore and fallback to manual check/insert
      console.log('RPC call failed, falling back:', rpcErr.message)
    }

    // Fallback: Insert booking (we've already checked for overlap above)
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ trip_id, passenger_name, passenger_phone, seat_numbers: requested.join(','), status: 'confirmed' }])

    if (error) return res.status(500).json({ error: error.message })
    res.status(200).json({ message: 'Booking confirmed', data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
