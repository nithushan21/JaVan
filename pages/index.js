import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import TripCard from '../components/TripCard'

const sampleTrips = [
  { id: 's1', route: 'Colombo → Jaffna', travel_date: '2025-11-01', departure_time: '08:00 AM', fare_per_seat: 'Rs. 1500', driver_phone: '077-1234567', image_url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=600&q=60' },
  { id: 's2', route: 'Jaffna → Colombo', travel_date: '2025-11-02', departure_time: '10:00 AM', fare_per_seat: 'Rs. 1500', driver_phone: '077-7654321', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=60' },
  { id: 's3', route: 'Colombo → Kandy', travel_date: '2025-11-03', departure_time: '09:30 AM', fare_per_seat: 'Rs. 900', driver_phone: '077-5551212', image_url: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=600&q=60' },
  { id: 's4', route: 'Kandy → Colombo', travel_date: '2025-11-04', departure_time: '02:00 PM', fare_per_seat: 'Rs. 900', driver_phone: '077-4441212', image_url: 'https://images.unsplash.com/photo-1517148815978-75f6acaaffaa?auto=format&fit=crop&w=600&q=60' }
]

export default function Home() {
  const [trips, setTrips] = useState(sampleTrips)

  useEffect(() => {
    async function fetchTrips() {
      const { data, error } = await supabase.from('trips').select('*').order('travel_date')
      if (error) console.log(error)
      else if (data && data.length > 0) setTrips(data)
    }
    fetchTrips()
  }, [])

  return (
    <div>
      <Navbar />

      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=60')` }} />
        <div className="hero-overlay">
          <h1>Book Your Seat from Colombo ↔ Jaffna</h1>
          <p className="lead">Fast and easy seat booking for your next trip.</p>
          <a href="/trips" className="btn btn-primary hero-cta">View Trips</a>
        </div>
      </section>

  <main id="main" className="container">
        <h2 style={{ textAlign: 'center', marginTop: 40 }}>Available Trips</h2>
        <div className="trips-grid">
          {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
        </div>
      </main>
    </div>
  )
}
