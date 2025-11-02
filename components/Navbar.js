import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-nav">
      {/* skip link for keyboard users */}
      <a className="skip-link sr-only" href="#main">Skip to content</a>
      <div className="nav-container">
        <div className="brand">
          <div className="brand-logo" aria-hidden>◈</div>
          <Link href="/">VanGo</Link>
        </div>

        <button
          className="nav-toggle"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="primary-navigation"
        >
          <span className="hamburger" />
        </button>

        <nav id="primary-navigation" className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)} role="navigation" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/trips">Trips</Link>
          <Link href="/admin">Admin</Link>
        </nav>

        <div className="nav-actions">
          <button className="btn btn-outline">Login</button>
        </div>
      </div>
    </header>
  )
}
