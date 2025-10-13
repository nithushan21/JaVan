import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import TripCard from '../components/TripCard'
import { supabase } from '../lib/supabaseClient'

export default function Trips() {
  const router = useRouter()
  const { route, date } = router.query
  const [trips, setTrips] = useState([])

  useEffect(() => {
    if (route && date) fetchTrips()
  }, [route, date])

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('route', route)
      .eq('travel_date', date)
    if (error) console.log(error)
    else setTrips(data)
  }

  return (
    <div className="container">
      <h2>Available Trips</h2>
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  )
}
