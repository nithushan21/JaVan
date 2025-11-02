import { useState, useEffect } from 'react'

export default function SeatMap({ totalSeats = 20, bookedSeats = [], tripId, onSelectionChange, resetSelectionKey, onOpenBookingForm }) {
  const [selectedSeats, setSelectedSeats] = useState([])

  // Notify parent when selection changes (if a callback was provided)
  useEffect(() => {
    if (typeof onSelectionChange === 'function') {
      onSelectionChange(selectedSeats)
    }
  }, [selectedSeats, onSelectionChange])

  // Allow parent to request a reset of the selection by changing resetSelectionKey
  useEffect(() => {
    if (typeof resetSelectionKey !== 'undefined') {
      setSelectedSeats([])
    }
  }, [resetSelectionKey])

  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1)

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat.toString())) return
    setSelectedSeats(prev => prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat])
  }

  const handleSeatKey = (e, seat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleSeat(seat)
    }
  }

  const handleBooking = async () => {
    // This function is now unused; booking happens via the form below.
  }

  // Booking UI is handled by the parent (page). SeatMap only manages selection.

  return (
    <div>
      <div className="seat-map" role="list" aria-label="Seat map">
        {seats.map(seat => {
          const isBooked = bookedSeats.includes(seat.toString())
          const isSelected = selectedSeats.includes(seat)
          return (
            <button
              key={seat}
              role="button"
              aria-pressed={isSelected}
              aria-label={`Seat ${seat} ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
              tabIndex={0}
              className={`seat ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
              onClick={() => toggleSeat(seat)}
              onKeyDown={(e) => handleSeatKey(e, seat)}
              disabled={isBooked}
            >
              {seat}
            </button>
          )
        })}
      </div>
      <div style={{ marginTop: 15 }}>
        <button onClick={() => typeof onOpenBookingForm === 'function' ? onOpenBookingForm() : null} disabled={selectedSeats.length === 0} aria-label="Confirm Booking" style={{ backgroundColor: '#800000', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px' }}>Confirm Booking</button>
      </div>
    </div>
  )
}
