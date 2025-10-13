import Link from 'next/link'

export default function TripCard({ trip }) {
  return (
    <div className="card" style={{ border: '1px solid #ccc', padding: '15px', margin: '10px', borderRadius: '8px' }}>
      <h3>{trip.route}</h3>
      <p>Date: {trip.travel_date}</p>
      <p>Time: {trip.departure_time}</p>
      <p>Fare: {trip.fare_per_seat}</p>
      <p>Driver Contact: {trip.driver_phone}</p>
      <Link href={`/seat-selection?id=${trip.id}`}>
        <button style={{ marginTop: '10px', backgroundColor: '#800000', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px' }}>Book Seats</button>
      </Link>
    </div>
  )
}
