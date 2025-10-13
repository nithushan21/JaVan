import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import SeatMap from '../components/SeatMap'
import Navbar from '../components/Navbar'

export default function SeatSelection() {
  const router = useRouter()
  const { id } = router.query
  const [trip, setTrip] = useState(null)
  const [bookedSeats, setBookedSeats] = useState([])

  useEffect(() => {
    if (!id) return
    async function fetchTrip() {
      const { data, error } = await supabase.from('trips').select('*').eq('id', id).single()
      if (error) console.log(error)
      else setTrip(data)

      const { data: bookings } = await supabase.from('bookings').select('seat_numbers').eq('trip_id', id)
      const seats = bookings.flatMap(b => b.seat_numbers.split(','))
      setBookedSeats(seats)
    }
    fetchTrip()
  }, [id])

  return trip ? (
    <div>
      <Navbar />
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Book Seats for {trip.route}</h1>
      <SeatMap totalSeats={trip.total_seats} bookedSeats={bookedSeats} tripId={id} />
    </div>
  ) : <p>Loading...</p>
}
