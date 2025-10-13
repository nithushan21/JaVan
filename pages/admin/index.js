import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import Link from 'next/link'

export default function AdminDashboard() {
  const [trips, setTrips] = useState([])

  useEffect(() => { fetchTrips() }, [])

  async function fetchTrips() {
    const { data, error } = await supabase.from('trips').select('*').order('travel_date', { ascending: true })
    if (error) console.log(error)
    else setTrips(data)
  }

  return (
    <div>
      <Navbar />
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Admin Dashboard</h1>
      <Link href="/admin/add-trip"><button style={{ margin: '10px', backgroundColor: '#800000', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px' }}>Add Trip</button></Link>
      <div>
        {trips.map(trip => (
          <div key={trip.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', borderRadius: '5px' }}>
            <p>{trip.route} - {trip.travel_date}</p>
            <p>Fare: {trip.fare_per_seat}</p>
            <p>Driver: {trip.driver_phone}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
