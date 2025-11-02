import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'

export default function ViewBookings() {
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [bookings, setBookings] = useState([])

  useEffect(() => { fetchTrips() }, [])

  async function fetchTrips() {
    const { data, error } = await supabase.from('trips').select('id,route,travel_date').order('travel_date', { ascending: true })
    if (error) console.log(error)
    else setTrips(data)
  }

  async function fetchBookings(tripId) {
    setSelectedTrip(tripId)
    const { data, error } = await supabase.from('bookings').select('id,passenger_name,passenger_phone,seat_numbers,status,created_at').eq('trip_id', tripId).order('created_at', { ascending: true })
    if (error) console.log(error)
    else setBookings(data)
  }

  return (
    <div>
      <Navbar />
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>View Bookings</h1>
      <div style={{ maxWidth: 900, margin: '20px auto' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <select onChange={e => fetchBookings(e.target.value)} defaultValue="" style={{ padding: 8 }}>
            <option value="">Select a trip to view bookings</option>
            {trips.map(t => (
              <option key={t.id} value={t.id}>{t.route} - {t.travel_date}</option>
            ))}
          </select>
        </div>

        {selectedTrip && (
          <div>
            <h2>Bookings for trip #{selectedTrip}</h2>
            {bookings.length === 0 ? <p>No bookings yet.</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Name</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Phone</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Seats</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Status</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{b.passenger_name}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{b.passenger_phone}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{b.seat_numbers}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{b.status}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{new Date(b.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
