import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const images = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=800&q=80',
]

const EyeIcon = ({ open }) => open ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function SignIn() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const handleSignIn = (e) => {
    e.preventDefault()
    setError('')
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.username === username && u.password === password)
    if (!user) {
      setError('Invalid username or password')
      return
    }
    localStorage.setItem('currentUser', JSON.stringify(user))
    navigate('/home')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Jost:wght@300;400;500&display=swap');
        .auth-page { min-height:100vh; background-color:#F5F2EC; display:flex; align-items:center; justify-content:center; font-family:'Jost',sans-serif; }
        .auth-card { display:flex; width:800px; height:480px; border-radius:20px; overflow:hidden; box-shadow:0 6px 40px rgba(78,64,52,0.14); background:#F5F2EC; }
        .auth-img { width:400px; flex-shrink:0; position:relative; border-radius:20px; overflow:hidden; }
        .auth-slide { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:opacity 0.9s ease; }
        .auth-dots { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); display:flex; gap:6px; z-index:5; }
        .auth-dot { width:7px; height:7px; border-radius:50%; border:none; cursor:pointer; background:rgba(255,255,255,0.45); transition:all 0.3s; }
        .auth-dot.active { background:#ffffff; transform:scale(1.3); }
        .auth-form-side { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 44px; background:#F5F2EC; }
        .auth-brand-name { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:700; color:#4E4034; text-align:center; }
        .auth-brand-tag { font-size:11.5px; color:#8C7864; font-weight:300; text-align:center; margin-top:3px; letter-spacing:0.3px; }
        .auth-hr { width:100%; border:none; border-top:1px solid #D9D2C6; margin:16px 0; }
        .auth-title { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:600; color:#3a2e26; align-self:flex-start; margin-bottom:16px; }
        .auth-form { width:100%; display:flex; flex-direction:column; gap:11px; }
        .auth-input { width:100%; padding:12px 20px; border-radius:50px; border:1.5px solid #D9D2C6; background:#FFFFFF; font-family:'Jost',sans-serif; font-size:13px; color:#4E4034; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
        .auth-input::placeholder { color:#B7A996; }
        .auth-input:focus { border-color:#8C7864; }

        .auth-pw-wrap { position:relative; width:100%; }
        .auth-pw-wrap .auth-input { padding-right:44px; }
        .auth-eye-btn {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; padding:4px;
          color:#B7A996; display:flex; align-items:center; justify-content:center;
          transition:color 0.2s; line-height:0;
        }
        .auth-eye-btn:hover { color:#4E4034; }

        .auth-forgot-row { display:flex; justify-content:flex-end; margin-top:-4px; }
        .auth-forgot { background:none; border:none; font-family:'Jost',sans-serif; font-size:12px; color:#8C7864; cursor:pointer; }
        .auth-error { color:#c0392b; font-size:12px; text-align:center; }
        .auth-btn { width:100%; padding:13px; border-radius:50px; border:none; background:#4E4034; color:#fff; font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:600; letter-spacing:1.5px; cursor:pointer; transition:background 0.2s; margin-top:2px; }
        .auth-btn:hover { background:#3a2e26; }
        .auth-bottom { text-align:center; margin-top:12px; font-size:12.5px; color:#8C7864; }
        .auth-bottom button { background:none; border:none; font-family:'Jost',sans-serif; font-size:12.5px; color:#4E4034; font-weight:500; text-decoration:underline; cursor:pointer; padding:0; }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-img">
            {images.map((src, i) => (
              <img key={i} src={src} alt="room" className="auth-slide" style={{ opacity: i === current ? 1 : 0 }} />
            ))}
            <div className="auth-dots">
              {images.map((_, i) => (
                <button key={i} className={`auth-dot${i === current ? ' active' : ''}`} onClick={() => setCurrent(i)} />
              ))}
            </div>
          </div>

          <div className="auth-form-side">
            <div className="auth-brand-name">Modern Furniture</div>
            <div className="auth-brand-tag">Where Modern Living Begins.</div>
            <hr className="auth-hr" />
            <div className="auth-title">Sign In</div>

            <form className="auth-form" onSubmit={handleSignIn}>
              <input className="auth-input" type="text" placeholder="Username"
                value={username} onChange={e => setUsername(e.target.value)} required />

              <div className="auth-pw-wrap">
                <input className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="Password"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              <div className="auth-forgot-row">
                <button type="button" className="auth-forgot">Forgot Password?</button>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-btn">Sign In</button>
              <p className="auth-bottom">
                Don't have an account?{' '}
                <button type="button" onClick={() => navigate('/signup')}>Sign Up!</button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}