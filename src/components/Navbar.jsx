import { Link, useLocation } from 'react-router-dom'

// Inline SVG logo — no external file dependency
const RoomPilotLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 48" fill="none" height="36" style={{ display:'block' }}>
    {/* Isometric room icon */}
    <g transform="translate(2,4)">
      {/* Left wall */}
      <polygon points="20,6 20,32 0,20 0,0" fill="#8B6A50" opacity="0.3"/>
      {/* Right wall */}
      <polygon points="20,6 40,0 40,20 20,32" fill="#6B4F3A" opacity="0.5"/>
      {/* Floor */}
      <polygon points="20,32 0,20 20,14 40,20" fill="#C8A870" opacity="0.35"/>
      {/* Crisp outline */}
      <polygon points="20,6 40,0 40,20 20,32 0,20 0,0" fill="none" stroke="#6B4F3A" strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="20" y1="6" x2="20" y2="32" stroke="#6B4F3A" strokeWidth="1" opacity="0.35"/>
      <line x1="0" y1="20" x2="40" y2="20" stroke="#6B4F3A" strokeWidth="1" opacity="0.35"/>
      {/* Compass dot */}
      <circle cx="20" cy="20" r="3.8" fill="white" stroke="#6B4F3A" strokeWidth="1.3"/>
      <circle cx="20" cy="20" r="1.5" fill="#C8A870"/>
    </g>
    {/* Room - bold */}
    <text x="56" y="31"
      fontFamily="Cormorant Garamond, Georgia, serif"
      fontSize="22" fontWeight="600"
      fill="#3A2E24" letterSpacing="0.2">Room</text>
    {/* Pilot - light */}
    <text x="115" y="31"
      fontFamily="Cormorant Garamond, Georgia, serif"
      fontSize="22" fontWeight="300"
      fill="#8B6A50" letterSpacing="1.5">Pilot</text>
  </svg>
)

export default function Navbar() {
  const location = useLocation()
  const path = location.pathname

  const navLinks = [
    { to: '/',               label: 'Home'           },
    { to: '/editor',         label: 'File'           },
    { to: '/templates',      label: 'Templates'      },
    { to: '/recent-designs', label: 'Recent Designs' },
    { to: '/help',           label: 'Help'           },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Jost:wght@300;400;500&display=swap');
        .rp-nav {
          height: 56px;
          background: #F7F4EE;
          border-bottom: 1px solid #E8E0D8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .rp-nav-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .rp-nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .rp-nav-link {
          text-decoration: none;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: #7A6A5A;
          letter-spacing: 0.3px;
          position: relative;
          padding-bottom: 2px;
          transition: color 0.2s;
        }
        .rp-nav-link:hover {
          color: #3A2E24;
        }
        .rp-nav-link.active {
          color: #3A2E24;
          font-weight: 500;
        }
        .rp-nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 1.5px;
          background: #6B4F3A;
          border-radius: 1px;
        }
        .rp-nav-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid #D8D0C4;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: transparent;
          color: #7A6A5A;
        }
        .rp-nav-icon:hover {
          border-color: #6B4F3A;
          background: #EDE9E3;
          color: #3A2E24;
        }
      `}</style>

      <nav className="rp-nav">
        {/* Logo */}
        <Link to="/" className="rp-nav-logo">
          <RoomPilotLogo />
        </Link>

        {/* Nav links */}
        <ul className="rp-nav-links">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`rp-nav-link${path === to ? ' active' : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* User icon */}
        <button className="rp-nav-icon" aria-label="Account">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </button>
      </nav>
    </>
  )
}