import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Home() {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Jost:wght@300;400;500&display=swap');

        .home-page {
          min-height: 100vh;
          background-color: #F5F2EC;
          font-family: 'Jost', sans-serif;
        }

        .home-hero {
          margin: 32px 48px;
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          align-items: stretch;
          min-height: 540px;
          position: relative;
        }

        /* blob decorations */
        .blob1 {
          position: absolute;
          top: -60px;
          left: -60px;
          width: 280px;
          height: 280px;
          background: #EDE8E1;
          border-radius: 50%;
          opacity: 0.55;
          z-index: 0;
        }
        .blob2 {
          position: absolute;
          bottom: -80px;
          left: 60px;
          width: 200px;
          height: 200px;
          background: #D9D2C6;
          border-radius: 50%;
          opacity: 0.35;
          z-index: 0;
        }
        .blob3 {
          position: absolute;
          top: 40px;
          left: 220px;
          width: 120px;
          height: 120px;
          background: #B7A996;
          border-radius: 50%;
          opacity: 0.18;
          z-index: 0;
        }

        .home-text {
          flex: 1;
          padding: 64px 56px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .home-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          font-weight: 700;
          color: #3a2e26;
          line-height: 1.15;
          margin-bottom: 22px;
        }

        .home-desc {
          font-size: 13.5px;
          color: #6b5c50;
          line-height: 1.85;
          max-width: 440px;
          font-weight: 300;
        }

        .home-btn {
          margin-top: 36px;
          padding: 14px 38px;
          border-radius: 50px;
          border: none;
          background: #4E4034;
          color: #fff;
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 1px;
          cursor: pointer;
          transition: background 0.2s;
          align-self: flex-start;
        }
        .home-btn:hover { background: #3a2e26; }

        .home-image {
          width: 460px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        .home-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0 20px 20px 0;
        }

        /* Features */
        .home-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 0 48px 48px;
        }

        .feature-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 30px 26px;
          border: 1px solid #E8E3DC;
          transition: box-shadow 0.2s, transform 0.2s;
          cursor: default;
        }
        .feature-card:hover {
          box-shadow: 0 6px 24px rgba(78,64,52,0.1);
          transform: translateY(-2px);
        }

        .feature-icon {
          width: 46px;
          height: 46px;
          background: #F5F2EC;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          font-size: 22px;
        }

        .feature-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 600;
          color: #4E4034;
          margin-bottom: 8px;
        }

        .feature-desc {
          font-size: 12.5px;
          color: #8C7864;
          line-height: 1.75;
          font-weight: 300;
        }
      `}</style>

      <div className="home-page">
        <Navbar />

        {/* Hero */}
        <div className="home-hero">
          <div className="blob1" />
          <div className="blob2" />
          <div className="blob3" />

          <div className="home-text">
            <h1 className="home-title">Modern Furniture</h1>
            <p className="home-desc">
              The Modern Furniture Web Application is designed to help customers
              visualize and select furniture items easily. It allows users to view
              products, customize options, and see how furniture would look in their
              room space. The app improves the shopping experience by helping
              customers make better decisions before purchasing, saving time and
              reducing uncertainty.
            </p>
            <button className="home-btn" onClick={() => navigate('/editor')}>
              Start Designing
            </button>
          </div>

          <div className="home-image">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
              alt="Modern furniture room"
            />
          </div>
        </div>

        {/* Features */}
        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">🛋️</div>
            <div className="feature-title">Browse Furniture</div>
            <p className="feature-desc">
              Explore our curated catalogue of chairs, tables, sofas and more.
              Filter by room type to find exactly what you need.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <div className="feature-title">Customise & Visualise</div>
            <p className="feature-desc">
              Change colours, scale and shading. See your room in 2D layout
              or switch to a full 3D view instantly.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <div className="feature-title">Save Your Designs</div>
            <p className="feature-desc">
              Save your room designs, come back anytime to edit or share
              them with your designer in store.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}