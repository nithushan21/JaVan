import Link from 'next/link'

export default function Navbar() {
  return (
    <nav style={{ padding: '10px', backgroundColor: '#800000', color: 'white' }}>
      <Link href="/" style={{ marginRight: '20px', color: 'white', textDecoration: 'none' }}>
        Home
      </Link>
      <Link href="/trips" style={{ marginRight: '20px', color: 'white', textDecoration: 'none' }}>
        Trips
      </Link>
      <Link href="/admin" style={{ color: 'white', textDecoration: 'none' }}>
        Admin
      </Link>
    </nav>
  )
}
