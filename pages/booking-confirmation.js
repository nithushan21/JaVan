import Navbar from '../components/Navbar'

export default function BookingConfirmation() {
  return (
    <div>
      <Navbar />
      <h1 style={{ textAlign: 'center', marginTop: '20px', color: 'green' }}>Booking Confirmed!</h1>
      <p style={{ textAlign: 'center' }}>Please contact the driver to finalize or cancel your booking.</p>
    </div>
  )
}
