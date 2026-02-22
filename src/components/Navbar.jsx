import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [roomTemplatesOpen, setRoomTemplatesOpen] = useState(false)
  const [furniturePresetsOpen, setFurniturePresetsOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const handleRoomTemplate = (type) => {
    setTemplatesOpen(false)
    setRoomTemplatesOpen(false)
    navigate('/editor', { state: { template: type } })
  }

  const handleFurniturePreset = (type) => {
    setTemplatesOpen(false)
    setFurniturePresetsOpen(false)
    navigate('/editor', { state: { preset: type } })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Jost:wght@300;400;500&display=swap');

        .navbar {
          width: 100%;
          background: #F5F2EC;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          height: 56px;
          border-bottom: 1px solid #E8E3DC;
          position: sticky;
          top: 0;
          z-index: 100;
          box-sizing: border-box;
          font-family: 'Jost', sans-serif;
        }

        .nav-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-weight: 700;
          color: #4E4034;
          cursor: pointer;
          white-space: nowrap;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          background: none;
          border: none;
          font-family: 'Jost', sans-serif;
          font-size: 13.5px;
          font-weight: 400;
          color: #4E4034;
          cursor: pointer;
          padding: 4px 0;
          letter-spacing: 0.2px;
          position: relative;
          transition: color 0.2s;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: #4E4034;
          border-radius: 2px;
        }

        .nav-link:hover { color: #8C7864; }

        /* DROPDOWN */
        .dropdown {
          position: absolute;
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          background: #F5F2EC;
          border: 1px solid #D9D2C6;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(78,64,52,0.12);
          min-width: 180px;
          padding: 6px 0;
          z-index: 200;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          color: #4E4034;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.15s;
          border-radius: 6px;
        }
        .dropdown-item:hover { background: #EDE8E1; }

        /* SUB DROPDOWN */
        .sub-dropdown {
          position: absolute;
          top: 0;
          left: 100%;
          margin-left: 4px;
          background: #F5F2EC;
          border: 1px solid #D9D2C6;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(78,64,52,0.12);
          min-width: 160px;
          padding: 6px 0;
          z-index: 300;
        }

        .sub-item {
          display: block;
          padding: 10px 18px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          color: #4E4034;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.15s;
          border-radius: 6px;
        }
        .sub-item:hover { background: #EDE8E1; }

        .nav-profile {
          background: none;
          border: none;
          cursor: pointer;
          color: #4E4034;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .nav-profile:hover { color: #8C7864; }

        .nav-profile svg {
          width: 26px;
          height: 26px;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.5;
        }
      `}</style>

      <nav className="navbar">
        {/* Brand */}
        <div className="nav-brand" onClick={() => navigate('/home')}>
          Modern Furniture
        </div>

        {/* Links */}
        <ul className="nav-links">

          {/* Home */}
          <li className="nav-item">
            <button
              className={`nav-link${isActive('/home') ? ' active' : ''}`}
              onClick={() => navigate('/home')}
            >
              Home
            </button>
          </li>

          {/* File */}
          <li className="nav-item">
            <button
              className={`nav-link${isActive('/editor') ? ' active' : ''}`}
              onClick={() => navigate('/editor')}
            >
              File
            </button>
          </li>

          {/* Templates */}
          <li className="nav-item">
            <button
              className={`nav-link${templatesOpen ? ' active' : ''}`}
              onClick={() => setTemplatesOpen(o => !o)}
            >
              Templates
            </button>

            {templatesOpen && (
              <div className="dropdown">

                {/* Room Templates */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="dropdown-item"
                    onMouseEnter={() => { setRoomTemplatesOpen(true); setFurniturePresetsOpen(false) }}
                  >
                    Room Templates <span>›</span>
                  </button>
                  {roomTemplatesOpen && (
                    <div className="sub-dropdown">
                      {['Living Room','Bed Room','Office','Dining Area','Kitchen Area'].map(t => (
                        <button key={t} className="sub-item" onClick={() => handleRoomTemplate(t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Furniture Presets */}
                <div style={{ position: 'relative' }}>
                  <button
                    className="dropdown-item"
                    onMouseEnter={() => { setFurniturePresetsOpen(true); setRoomTemplatesOpen(false) }}
                  >
                    Furniture Presets <span>›</span>
                  </button>
                  {furniturePresetsOpen && (
                    <div className="sub-dropdown">
                      {['Living Room Set','Bed Room Set','Office Set','Dining Set','Kitchen Set'].map(t => (
                        <button key={t} className="sub-item" onClick={() => handleFurniturePreset(t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </li>

          {/* Recent Designs */}
          <li className="nav-item">
            <button
              className={`nav-link${isActive('/designs') ? ' active' : ''}`}
              onClick={() => navigate('/designs')}
            >
              Recent Designs
            </button>
          </li>

          {/* Help */}
          <li className="nav-item">
            <button
              className={`nav-link${isActive('/help') ? ' active' : ''}`}
              onClick={() => navigate('/help')}
            >
              Help
            </button>
          </li>

        </ul>

        {/* Profile Icon */}
        <button className="nav-profile" onClick={() => navigate('/profile')}>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </button>

      </nav>
    </>
  )
}
