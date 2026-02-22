import { useState } from 'react'
import Navbar from '../components/Navbar'

const faqs = [
  {
    q: 'How do I create an account?',
    a: 'Click on the Sign Up button and enter your email and password. Once registered, you can create designs, save designs and preview furniture.'
  },
  {
    q: 'How can I browse furniture?',
    a: 'You can explore furniture through the File page. Use the Add Furniture dropdown to browse sofas, beds, tables, chairs, and more.'
  },
  {
    q: 'How do I design my room?',
    a: 'Go to the File page, enter your room dimensions, choose a layout, and drag preferred furniture items into your space.'
  },
  {
    q: 'How do I switch between 2D and 3D view?',
    a: 'In the editor, use the View panel on the right side. Click "3D View" or "2D View" to toggle between the two modes instantly.'
  },
  {
    q: 'How do I save my design?',
    a: 'Use the File menu and click Save Design. Your design will be stored and accessible from the Recent Designs page anytime.'
  },
  {
    q: 'Can I change furniture colours?',
    a: 'Yes! Select any furniture item and use the Furniture Colour picker in the left panel to change its colour to any shade you like.'
  },
  {
    q: 'How do I use room templates?',
    a: 'Click Templates in the navigation bar, then select Room Templates. Choose from Living Room, Bedroom, Office, Dining Area or Kitchen.'
  },
]

export default function Help() {
  const [open, setOpen] = useState(null)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Jost:wght@300;400;500&display=swap');

        .help-page {
          min-height: 100vh;
          background: #F5F2EC;
          font-family: 'Jost', sans-serif;
        }

        .help-body {
          padding: 48px;
          max-width: 860px;
        }

        .help-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .help-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 700;
          color: #4E4034;
        }

        .help-icon {
          font-size: 48px;
          opacity: 0.5;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .faq-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #E8E3DC;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .faq-card:hover {
          box-shadow: 0 2px 12px rgba(78,64,52,0.08);
        }

        .faq-question {
          width: 100%;
          text-align: left;
          padding: 18px 24px;
          background: none;
          border: none;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #3a2e26;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.15s;
        }
        .faq-question:hover { background: #FAF8F5; }

        .faq-chevron {
          font-size: 12px;
          color: #8C7864;
          transition: transform 0.25s;
        }
        .faq-chevron.open { transform: rotate(180deg); }

        .faq-answer {
          padding: 0 24px 18px;
          font-size: 13px;
          color: #6b5c50;
          line-height: 1.75;
          font-weight: 300;
          border-top: 1px solid #F0EBE4;
        }
      `}</style>

      <div className="help-page">
        <Navbar />
        <div className="help-body">

          <div className="help-header">
            <div className="help-title">Support & FAQs</div>
            <div className="help-icon">💡</div>
          </div>

          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-card">
                <button
                  className="faq-question"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {faq.q}
                  <span className={`faq-chevron${open === i ? ' open' : ''}`}>▼</span>
                </button>
                {open === i && (
                  <div className="faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
