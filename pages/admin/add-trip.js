import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { useRouter } from 'next/router'

export default function AddTrip() {
  const [route, setRoute] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [time, setTime] = useState('')
  const [seats, setSeats] = useState(12)
  const [fare, setFare] = useState(0)
  const [driverPhone, setDriverPhone] = useState('')
  const router = useRouter()

  const handleAddTrip = async () => {
    const { data, error } = await supabase.from('trips').insert([
      { route, travel_date: travelDate, departure_time: time, total_seats: seats, fare_per_seat: fare, driver_phone: driverPhone }
    ])
    if (error) alert(error.message)
    else {
      alert('Trip added!')
      router.push('/admin')
    }
  }

  return (
    <div>
      <Navbar />
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Add New Trip</h1>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', margin: '20px auto' }}>
        <input placeholder="Route" value={route} onChange={e => setRoute(e.target.value)} style={{ margin: '5px', padding: '8px' }}/>
        <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} style={{ margin: '5px', padding: '8px' }}/>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ margin: '5px', padding: '8px' }}/>
        <input type="number" value={seats} onChange={e => setSeats(e.target.value)} style={{ margin: '5px', padding: '8px' }}/>
        <input type="number" placeholder="Fare per seat" value={fare} onChange={e => setFare(e.target.value)} style={{ margin: '5px', padding: '8px' }}/>
        <input placeholder="Driver phone" value={driverPhone} onChange={e => setDriverPhone(e.target.value)} style={{ margin: '5px', padding: '8px' }}/>
        <button onClick={handleAddTrip} style={{ margin: '10px', backgroundColor: '#800000', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px' }}>Add Trip</button>
      </div>
    </div>
  )
}
