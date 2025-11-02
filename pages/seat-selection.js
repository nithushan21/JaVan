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
  const [selectedSeats, setSelectedSeats] = useState([])
  const [resetKey, setResetKey] = useState(0)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [passengerName, setPassengerName] = useState('')
  const [passengerPhone, setPassengerPhone] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingMessage, setBookingMessage] = useState(null)
  // Modal state for nicer feedback (success/conflict/error)
  const [modal, setModal] = useState({ open: false, type: null, text: '' })
  const [loadingTrip, setLoadingTrip] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchTrip() {
      setLoadingTrip(true)
      setBookingMessage(null)
      try {
        // Use server-side proxy endpoints to avoid CORS/DNS issues
        const tripRes = await fetch(`/api/trips-server?id=${encodeURIComponent(id)}`)
        if (!tripRes.ok) {
          const err = await tripRes.json().catch(() => ({}))
          console.error('trips-server error', err)
          setBookingMessage({ type: 'error', text: 'Failed to load trip data from server endpoint.' })
          setLoadingTrip(false)
        } else {
          const payload = await tripRes.json()
          const data = payload.data
          // server returns array of trips
          const t = Array.isArray(data) ? data[0] : data
          if (!t) {
            setBookingMessage({ type: 'error', text: 'Trip not found' })
            setTrip(null)
            setLoadingTrip(false)
          } else {
            setTrip(t)
          }
        }

        const bookingsRes = await fetch(`/api/bookings-server?trip_id=${encodeURIComponent(id)}`)
        if (!bookingsRes.ok) {
          const err = await bookingsRes.json().catch(() => ({}))
          console.error('bookings-server error', err)
          setBookingMessage({ type: 'error', text: 'Failed to load bookings from server endpoint.' })
          setBookedSeats([])
          setLoadingTrip(false)
        } else {
          const payload = await bookingsRes.json()
          const bookings = payload.data || []
          const seats = (bookings || []).flatMap(b => b && b.seat_numbers ? b.seat_numbers.split(',') : [])
          setBookedSeats(seats)
        }
      } catch (err) {
        console.error('Unexpected error fetching trip/bookings:', err)
        setBookingMessage({ type: 'error', text: 'Unexpected error when fetching data. See console for details.' })
        setBookedSeats([])
      } finally {
        setLoadingTrip(false)
      }
    }
    fetchTrip()
  }, [id])

  // Render states:
  // - loadingTrip: show loading indicator
  // - not loading & no trip: show error message
  // - trip present: show seat map and booking UI
  if (loadingTrip) {
    return (
      <div>
        <Navbar />
        <main id="main" className="container">
          <p>Loading…</p>
        </main>
      </div>
    )
  }

  if (!trip) {
    return (
      <div>
        <Navbar />
        <main id="main" className="container">
          <h2>Trip not found</h2>
          {bookingMessage && <p style={{ color: 'crimson' }}>{bookingMessage.text}</p>}
        </main>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <main id="main" className="container">
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Book Seats for {trip.route}</h1>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: 20 }}>
          <div style={{ flex: 1 }}>
            <SeatMap totalSeats={trip?.total_seats || 20} bookedSeats={bookedSeats} tripId={id} onSelectionChange={setSelectedSeats} resetSelectionKey={resetKey} onOpenBookingForm={() => setShowBookingForm(true)} />
          </div>

          <aside style={{ width: 320, border: '1px solid #eee', padding: 16, borderRadius: 8 }} aria-labelledby="booking-summary">
            <h2 id="booking-summary">Booking summary</h2>
            <p><strong>Route:</strong> {trip.route}</p>
            <p><strong>Fare per seat:</strong> ₹{trip.fare_per_seat}</p>
            <p><strong>Selected seats:</strong> {selectedSeats.length ? selectedSeats.join(', ') : 'None'}</p>
            <p><strong>Total:</strong> ₹{selectedSeats.length * (trip.fare_per_seat || 0)}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setResetKey(k => k + 1)} style={{ padding: '8px 12px' }}>Clear selection</button>
              <button onClick={() => setShowBookingForm(true)} style={{ backgroundColor: '#0066cc', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4 }} disabled={selectedSeats.length === 0}>Book selected</button>
            </div>

            {showBookingForm && (
              <form onSubmit={async (e) => {
                e.preventDefault()
                setBookingMessage(null)
                if (!passengerName || !passengerPhone) {
                  setBookingMessage({ type: 'error', text: 'Name and phone required' })
                  return
                }
                setBookingLoading(true)
                try {
                  // Call server-side endpoint that uses the service role key and RPC
                  const res = await fetch('/api/book-server', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trip_id: id, passenger_name: passengerName, passenger_phone: passengerPhone, seat_numbers: selectedSeats })
                  })
                  const payload = await res.json()
                  if (!res.ok) {
                    if (res.status === 409) {
                      setBookingMessage({ type: 'conflict', text: `Seats already booked: ${payload.seats.join(', ')}` })
                      // show modal as well
                      setModal({ open: true, type: 'conflict', text: `Seats already booked: ${payload.seats.join(', ')}` })
                    } else {
                      setBookingMessage({ type: 'error', text: payload.error || 'Booking failed' })
                      setModal({ open: true, type: 'error', text: payload.error || 'Booking failed' })
                    }
                  } else {
                    setBookingMessage({ type: 'success', text: 'Booking confirmed!' })
                    setModal({ open: true, type: 'success', text: 'Booking confirmed!' })
                    // clear selection and form
                    setResetKey(k => k + 1)
                    setSelectedSeats([])
                    setPassengerName('')
                    setPassengerPhone('')
                    setShowBookingForm(false)
                    // refresh booked seats via server endpoint
                    try {
                      const bookingsRes2 = await fetch(`/api/bookings-server?trip_id=${encodeURIComponent(id)}`)
                      if (bookingsRes2.ok) {
                        const payload2 = await bookingsRes2.json()
                        const bookings2 = payload2.data || []
                        const seats2 = (bookings2 || []).flatMap(b => b && b.seat_numbers ? b.seat_numbers.split(',') : [])
                        setBookedSeats(seats2)
                      }
                    } catch (e) {
                      console.error('Failed to refresh bookings after booking:', e)
                    }
                  }
                } catch (err) {
                  setBookingMessage({ type: 'error', text: err.message })
                  setModal({ open: true, type: 'error', text: err.message })
                } finally {
                  setBookingLoading(false)
                }
              }} style={{ marginTop: 12 }}>
                <label className="sr-only" htmlFor="passenger-name">Name</label>
                <input id="passenger-name" placeholder="Your name" value={passengerName} onChange={e => setPassengerName(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
                <label className="sr-only" htmlFor="passenger-phone">Phone</label>
                <input id="passenger-phone" placeholder="Phone" value={passengerPhone} onChange={e => setPassengerPhone(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={bookingLoading} style={{ backgroundColor: '#0066cc', color: 'white', padding: '8px 12px', border: 'none', borderRadius: 4 }}>{bookingLoading ? 'Booking...' : 'Confirm & Pay'}</button>
                  <button type="button" onClick={() => setShowBookingForm(false)} style={{ padding: '8px 12px' }}>Cancel</button>
                </div>
                {bookingMessage && (
                  <div role="alert" style={{ marginTop: 8, color: bookingMessage.type === 'success' ? 'green' : 'crimson' }}>{bookingMessage.text}</div>
                )}
              </form>
            )}
            {/* Modal / Toast */}
            {typeof modal !== 'undefined' && modal.open && (
              <div role="dialog" aria-live="assertive" style={{ position: 'fixed', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
                <div style={{ background: 'rgba(0,0,0,0.6)', position: 'absolute', inset: 0 }} onClick={() => setModal({ open: false })} />
                <div style={{ position: 'relative', background: 'white', padding: 20, borderRadius: 8, width: 420, zIndex: 70 }}>
                  <h3 style={{ marginTop: 0 }}>{modal.type === 'success' ? 'Booking confirmed' : modal.type === 'conflict' ? 'Booking conflict' : 'Error'}</h3>
                  <p>{modal.text}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                    <button onClick={() => setModal({ open: false })} style={{ padding: '8px 12px' }}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
