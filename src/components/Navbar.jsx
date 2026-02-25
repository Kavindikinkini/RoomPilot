import { Link, useLocation, useNavigate } from 'react-router-dom'

const RoomPilotLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 52" fill="none" height="42" style={{ display:'block' }}>
    <g transform="translate(2,5)">
      <polygon points="22,6 22,34 0,21 0,0" fill="#8B6A50" opacity="0.25"/>
      <polygon points="22,6 44,0 44,21 22,34" fill="#6B4F3A" opacity="0.45"/>
      <polygon points="22,34 0,21 22,15 44,21" fill="#C8A870" opacity="0.3"/>
      <polygon points="22,6 44,0 44,21 22,34 0,21 0,0" fill="none" stroke="#6B4F3A" strokeWidth="1.6" strokeLinejoin="round"/>
      <line x1="22" y1="6" x2="22" y2="34" stroke="#6B4F3A" strokeWidth="1" opacity="0.3"/>
      <line x1="0" y1="21" x2="44" y2="21" stroke="#6B4F3A" strokeWidth="1" opacity="0.3"/>
      <circle cx="22" cy="21" r="4.2" fill="white" stroke="#6B4F3A" strokeWidth="1.4"/>
      <circle cx="22" cy="21" r="1.8" fill="#C8A870"/>
    </g>
    <text x="60" y="34"
      fontFamily="Cormorant Garamond, Georgia, serif"
      fontSize="26" fontWeight="700"
      fill="#3A2E24" letterSpacing="0.3">Room</text>
    <text x="127" y="34"
      fontFamily="Cormorant Garamond, Georgia, serif"
      fontSize="26" fontWeight="300"
      fill="#8B6A50" letterSpacing="2">Pilot</text>
  </svg>
)

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  const navLinks = [
    { to: '/home',           label: 'Home'           },
    { to: '/editor',         label: 'File'           },
    { to: '/templates',      label: 'Templates'      },
    { to: '/recent-designs', label: 'Recent Designs' },
    { to: '/help',           label: 'Help'           },
  ]

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Jost:wght@300;400;500;600&display=swap');

        .rp-nav {
          height: 68px;
          background: #F7F4EE;
          border-bottom: 1px solid #E2D9CF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 12px rgba(58, 46, 36, 0.07);
        }

        .rp-nav-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          transition: opacity 0.2s;
        }
        .rp-nav-logo:hover { opacity: 0.82; }

        .rp-nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .rp-nav-link {
          text-decoration: none;
          font-family: 'Jost', sans-serif;
          font-size: 14.5px;
          font-weight: 400;
          color: #8A7A6A;
          letter-spacing: 0.4px;
          position: relative;
          padding: 6px 14px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }

        .rp-nav-link:hover {
          color: #3A2E24;
          background: rgba(107, 79, 58, 0.07);
        }

        .rp-nav-link.active {
          color: #3A2E24;
          font-weight: 600;
          background: rgba(107, 79, 58, 0.09);
        }

        .rp-nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 14px;
          right: 14px;
          height: 2px;
          background: linear-gradient(90deg, #6B4F3A, #C8A870);
          border-radius: 2px;
        }

        .rp-nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rp-nav-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid #D0C8BC;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
          background: transparent;
          color: #8A7A6A;
        }
        .rp-nav-icon:hover {
          border-color: #6B4F3A;
          background: #EDE9E3;
          color: #3A2E24;
          transform: scale(1.05);
        }

        .rp-nav-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          font-style: italic;
          color: #B8A898;
          letter-spacing: 0.5px;
          margin-left: 2px;
          margin-top: 2px;
        }

        .rp-logo-wrap {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
      `}</style>

      <nav className="rp-nav">
        {/* Logo + tagline */}
        <Link to="/home" className="rp-nav-logo">
          <div className="rp-logo-wrap">
            <RoomPilotLogo />
            <span className="rp-nav-tagline">design your space</span>
          </div>
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

        {/* Right side */}
        <div className="rp-nav-right">
          <button className="rp-nav-icon" aria-label="Account" onClick={handleProfileClick}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>
        </div>
      </nav>
    </>
  )
}