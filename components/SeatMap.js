import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SeatMap({ totalSeats, bookedSeats, tripId }) {
  const [selectedSeats, setSelectedSeats] = useState([])

  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1)

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat.toString())) return
    setSelectedSeats(prev => prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat])
  }

  const handleBooking = async () => {
    const passenger_name = prompt('Enter your name')
    const passenger_phone = prompt('Enter your phone')

    if (!passenger_name || !passenger_phone) return alert('Name and phone required!')

    const { data, error } = await supabase.from('bookings').insert([
      { trip_id: tripId, passenger_name, passenger_phone, seat_numbers: selectedSeats.join(','), status: 'confirmed' }
    ])

    if (error) alert(error.message)
    else alert('Booking Confirmed!')
  }

  return (
    <div>
      <div className="seat-map">
        {seats.map(seat => (
          <button
            key={seat}
            className={`seat ${bookedSeats.includes(seat.toString()) ? 'booked' : selectedSeats.includes(seat) ? 'selected' : 'available'}`}
            onClick={() => toggleSeat(seat)}
            disabled={bookedSeats.includes(seat.toString())}
          >
            {seat}
          </button>
        ))}
      </div>
      <button onClick={handleBooking} disabled={selectedSeats.length === 0} style={{ marginTop: '15px', backgroundColor: '#800000', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px' }}>Confirm Booking</button>
    </div>
  )
}
