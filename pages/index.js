import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [route, setRoute] = useState('Colombo → Jaffna')
  const [date, setDate] = useState('')

  const handleSearch = () => {
    router.push(`/trips?route=${route}&date=${date}`)
  }

  return (
    <div className="container">
      <h1>Van Booking System</h1>
      <label>Route:</label>
      <select value={route} onChange={(e) => setRoute(e.target.value)}>
        <option>Colombo → Jaffna</option>
        <option>Jaffna → Colombo</option>
      </select>

      <label>Date:</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <button onClick={handleSearch}>Search Trips</button>
    </div>
  )
}
