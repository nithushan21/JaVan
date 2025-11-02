import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import WideTripCard from '../components/WideTripCard'

const sampleTrips = [
  { id: 't1', route: 'Colombo to Jaffna', travel_date: '2025-11-01', departure_time: '10:00 AM', total_seats: 12, image_url: 'https://images.unsplash.com/photo-1517148815978-75f6acaaffaa?auto=format&fit=crop&w=800&q=60' }
]

export default function Trips() {
  const [routeOptions, setRouteOptions] = useState([])
  const [selectedRoute, setSelectedRoute] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [trips, setTrips] = useState(sampleTrips)

  useEffect(() => { fetchRoutes() }, [])

  useEffect(() => { fetchTrips() }, [selectedRoute, selectedDate])

  const fetchTrips = async () => {
    try {
      let q = supabase.from('trips').select('*, bookings(seat_numbers, id)')
      if (selectedRoute) q = q.eq('route', selectedRoute)
      if (selectedDate) {
        const now = new Date()
        let target = now
        if (selectedDate === 'tomorrow') target = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const yyyy = target.getFullYear()
        const mm = String(target.getMonth() + 1).padStart(2, '0')
        const dd = String(target.getDate()).padStart(2, '0')
        const dateStr = `${yyyy}-${mm}-${dd}`
        q = q.eq('travel_date', dateStr)
      }
      const { data, error } = await q
      if (error) return console.log(error)
      if (data && data.length > 0) {
        const mapped = data.map(t => {
          const total = t.total_seats || 12
          const booked = (t.bookings || []).flatMap(b => b.seat_numbers ? b.seat_numbers.split(',').map(s => s.trim()).filter(Boolean) : []).length
          return { ...t, availableSeats: Math.max(0, total - booked) }
        })
        setTrips(mapped)
      } else {
        setTrips(sampleTrips)
      }
    } catch (err) { console.log(err) }
  }

  async function fetchRoutes() {
    try {
      const { data, error } = await supabase.from('trips').select('route')
      if (error) return console.log(error)
      const routes = Array.from(new Set((data || []).map(r => r.route))).filter(Boolean)
      setRouteOptions(routes)
      if (!selectedRoute && routes.length) setSelectedRoute(routes[0])
    } catch (err) { console.log(err) }
  }

  return (
    <div>
      <Navbar />
  <main id="main" className="container">
        <h2 style={{ marginTop: 24 }}>Available Trip</h2>

        <div className="filters-row" style={{ marginTop: 18 }}>
          <select className="filter-select" value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)}>
            <option value="">All routes</option>
            {routeOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="filter-select" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
            <option value="">Any date</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
          </select>
        </div>

        <div style={{ marginTop: 22 }}>
          {trips.map(trip => (
            <div key={trip.id} style={{ marginBottom: 16 }}>
              <WideTripCard trip={trip} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
