import Link from 'next/link'

export default function WideTripCard({ trip }) {
  const imgUrl = trip.image_url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=60'
  return (
    <div className="wide-trip-card">
      <div className="wide-left">
        <div className="trip-time">{trip.departure_time || '10:00 AM'}</div>
        <h3 className="wide-route">{trip.route}</h3>
        <div className="wide-sub">Departure: <strong>{trip.route?.split('to')?.[0]?.trim() || 'Colombo'}</strong>, Arrival: <strong>{trip.route?.split('to')?.[1]?.trim() || 'Jaffna'}</strong></div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ color: '#6b6b6b', fontSize: 13 }}>
              Seats: <strong>{typeof trip.availableSeats !== 'undefined' ? trip.availableSeats : (trip.total_seats || '—')}</strong>
            </div>
            <Link href={`/seat-selection?id=${trip.id}`}>
              <button className="btn btn-primary wide-cta" disabled={trip.availableSeats === 0}>Book Now</button>
            </Link>
          </div>
        </div>
      </div>

      <div className="wide-right">
        <div className="van-illustration">
          <img src={imgUrl} alt="van" />
        </div>
      </div>
    </div>
  )
}
