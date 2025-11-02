import Link from 'next/link'

export default function TripCard({ trip }) {
  const imgUrl = trip.image_url || 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=60'
  return (
    <div className="trip-card">
      <div className="trip-thumb">
        <img src={imgUrl} alt={trip.route} />
      </div>
      <div className="trip-body">
        <h4 className="trip-route">{trip.route}</h4>
        <div className="trip-meta">Date: <strong>{trip.travel_date}</strong> &nbsp; | &nbsp; Time: <strong>{trip.departure_time}</strong></div>
        <div className="trip-meta">Fare: <strong>{trip.fare_per_seat}</strong> &nbsp; | &nbsp; Driver: <strong>{trip.driver_phone}</strong></div>
        <div className="trip-actions">
          <Link href={`/seat-selection?id=${trip.id}`}>
            <button className="btn btn-primary">Select Seats</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
