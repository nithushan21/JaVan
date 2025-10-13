import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  const { trip_id, passenger_name, passenger_phone, seat_numbers } = req.body

  // Check if seats are available
  const { data: trip } = await supabase
    .from('trips')
    .select('total_seats')
    .eq('id', trip_id)
    .single()

  // Insert booking
  const { data, error } = await supabase
    .from('bookings')
    .insert([{ trip_id, passenger_name, passenger_phone, seat_numbers, status: 'confirmed' }])

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ message: 'Booking confirmed', data })
}
