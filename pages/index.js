import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import TripCard from '../components/TripCard'

export default function Home() {
  const [trips, setTrips] = useState([])

  useEffect(() => {
    async function fetchTrips() {
      const { data, error } = await supabase.from('trips').select('*').order('travel_date')
      if (error) console.log(error)
      else setTrips(data)
    }
    fetchTrips()
  }, [])

  return (
    <div>
      <Navbar />
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Available Trips</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
      </div>
    </div>
  )
}
