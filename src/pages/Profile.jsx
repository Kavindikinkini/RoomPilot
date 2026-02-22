import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [editingUsername, setEditingUsername] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (!u) { navigate('/signin'); return }
    setUser(u)
    setUsername(u.username)
    setEmail(u.email)
    setPassword(u.password)
  }, [])

  const handleSave = () => {
    const updated = { ...user, username, email, password }
    const all = JSON.parse(localStorage.getItem('users') || '[]')
    const updatedAll = all.map(u => u.id === updated.id ? updated : u)
    localStorage.setItem('users', JSON.stringify(updatedAll))
    localStorage.setItem('currentUser', JSON.stringify(updated))
    setUser(updated)
    setEditingUsername(false)
    setEditingPassword(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/signin')
  }

  if (!user) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Jost:wght@300;400;500&display=swap');

        .pf-page {
          min-height: 100vh;
          background: #F5F2EC;
          font-family: 'Jost', sans-serif;
        }

        .pf-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 24px;
        }

        .pf-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 2px solid #D9D2C6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          background: #fff;
        }

        .pf-avatar svg {
          width: 52px;
          height: 52px;
          stroke: #4E4034;
          fill: none;
          stroke-width: 1.2;
        }

        .pf-welcome {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 600;
          color: #4E4034;
          margin-bottom: 32px;
        }

        .pf-fields {
          width: 100%;
          max-width: 700px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 40px;
        }

        .pf-field-row {
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #E8E3DC;
          overflow: hidden;
          padding: 0 20px;
          height: 52px;
        }

        .pf-label {
          font-size: 13px;
          color: #4E4034;
          font-weight: 500;
          min-width: 120px;
        }

        .pf-value {
          flex: 1;
          font-size: 13px;
          color: #6b5c50;
          font-weight: 300;
        }

        .pf-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          color: #4E4034;
        }

        .pf-edit-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #B7A996;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .pf-edit-btn:hover { color: #4E4034; }
        .pf-edit-btn svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.8;
        }

        .pf-buttons {
          display: flex;
          gap: 20px;
          width: 100%;
          max-width: 700px;
        }

        .pf-save-btn {
          flex: 1;
          padding: 14px;
          border-radius: 50px;
          border: 1px solid #D9D2C6;
          background: #D9D2C6;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          color: #4E4034;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 400;
        }
        .pf-save-btn:hover {
          background: #C8BFB5;
        }

        .pf-logout-btn {
          flex: 1;
          padding: 14px;
          border-radius: 50px;
          border: 1.5px solid #4E4034;
          background: transparent;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          color: #4E4034;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 400;
        }
        .pf-logout-btn:hover {
          background: #4E4034;
          color: #fff;
        }

        .pf-saved-msg {
          color: #4E4034;
          font-size: 12px;
          margin-top: 10px;
          text-align: center;
        }
      `}</style>

      <div className="pf-page">
        <Navbar />
        <div className="pf-body">

          {/* Avatar */}
          <div className="pf-avatar">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>

          <div className="pf-welcome">Welcome, {user.username}</div>

          {/* Fields */}
          <div className="pf-fields">

            {/* Username */}
            <div className="pf-field-row">
              <span className="pf-label">Username :</span>
              {editingUsername ? (
                <input
                  className="pf-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoFocus
                />
              ) : (
                <span className="pf-value">{username}</span>
              )}
              <button className="pf-edit-btn" onClick={() => setEditingUsername(v => !v)}>
                <svg viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

            {/* Email — read only */}
            <div className="pf-field-row">
              <span className="pf-label">Email :</span>
              <span className="pf-value">{email}</span>
            </div>

            {/* Password */}
            <div className="pf-field-row">
              <span className="pf-label">Password :</span>
              {editingPassword ? (
                <input
                  className="pf-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                />
              ) : (
                <span className="pf-value">{'•'.repeat(password.length)}</span>
              )}
              <button className="pf-edit-btn" onClick={() => setEditingPassword(v => !v)}>
                <svg viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>

          </div>

          {/* Buttons */}
          <div className="pf-buttons">
            <button className="pf-save-btn" onClick={handleSave}>Save Changes</button>
            <button className="pf-logout-btn" onClick={handleLogout}>Log Out</button>
          </div>

          {saved && <p className="pf-saved-msg">✓ Changes saved successfully</p>}

        </div>
      </div>
    </>
  )
}
