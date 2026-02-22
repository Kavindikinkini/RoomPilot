import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const images = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=800&q=80',
]

export default function SignUp() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const handleSignUp = (e) => {
    e.preventDefault()
    setError('')
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const exists = users.find(u => u.username === username || u.email === email)
    if (exists) {
      setError('Username or email already exists')
      return
    }
    const newUser = { id: Date.now(), username, email, password, role: 'user' }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    navigate('/home')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Jost:wght@300;400;500&display=swap');

        .auth-page {
          min-height: 100vh;
          background-color: #F5F2EC;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Jost', sans-serif;
        }

        .auth-card {
          display: flex;
          width: 800px;
          height: 480px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 6px 40px rgba(78,64,52,0.14);
          background: #F5F2EC;
        }

        .auth-img {
          width: 400px;
          flex-shrink: 0;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
        }
        .auth-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.9s ease;
        }
        .auth-dots {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 5;
        }
        .auth-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          background: rgba(255,255,255,0.45);
          transition: all 0.3s;
        }
        .auth-dot.active {
          background: #ffffff;
          transform: scale(1.3);
        }

        .auth-form-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 44px;
          background: #F5F2EC;
        }

        .auth-brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          font-weight: 700;
          color: #4E4034;
          text-align: center;
        }
        .auth-brand-tag {
          font-size: 11.5px;
          color: #8C7864;
          font-weight: 300;
          text-align: center;
          margin-top: 3px;
          letter-spacing: 0.3px;
        }
        .auth-hr {
          width: 100%;
          border: none;
          border-top: 1px solid #D9D2C6;
          margin: 16px 0;
        }
        .auth-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: #3a2e26;
          align-self: flex-start;
          margin-bottom: 16px;
        }
        .auth-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }
        .auth-input {
          width: 100%;
          padding: 12px 20px;
          border-radius: 50px;
          border: 1.5px solid #D9D2C6;
          background: #FFFFFF;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          color: #4E4034;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .auth-input::placeholder { color: #B7A996; }
        .auth-input:focus { border-color: #8C7864; }

        .auth-error {
          color: #c0392b;
          font-size: 12px;
          text-align: center;
        }
        .auth-btn {
          width: 100%;
          padding: 13px;
          border-radius: 50px;
          border: none;
          background: #4E4034;
          color: #fff;
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 2px;
        }
        .auth-btn:hover { background: #3a2e26; }

        .auth-bottom {
          text-align: center;
          margin-top: 12px;
          font-size: 12.5px;
          color: #8C7864;
        }
        .auth-bottom button {
          background: none;
          border: none;
          font-family: 'Jost', sans-serif;
          font-size: 12.5px;
          color: #4E4034;
          font-weight: 500;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">

          <div className="auth-img">
            {images.map((src, i) => (
              <img key={i} src={src} alt="furniture" className="auth-slide"
                style={{ opacity: i === current ? 1 : 0 }} />
            ))}
            <div className="auth-dots">
              {images.map((_, i) => (
                <button key={i}
                  className={`auth-dot${i === current ? ' active' : ''}`}
                  onClick={() => setCurrent(i)} />
              ))}
            </div>
          </div>

          <div className="auth-form-side">
            <div className="auth-brand-name">Modern Furniture</div>
            <div className="auth-brand-tag">Where Modern Living Begins.</div>
            <hr className="auth-hr" />
            <div className="auth-title">Sign Up</div>

            <form className="auth-form" onSubmit={handleSignUp}>
              <input className="auth-input" type="text" placeholder="Username"
                value={username} onChange={e => setUsername(e.target.value)} required />

              <input className="auth-input" type="email" placeholder="Email"
                value={email} onChange={e => setEmail(e.target.value)} required />

              <input className="auth-input" type="password" placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)} required />

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-btn">Sign Up</button>

              <p className="auth-bottom">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/signin')}>Sign In!</button>
              </p>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}