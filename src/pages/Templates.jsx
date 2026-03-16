import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const TEMPLATES = [
  {
    id: 'living-modern',
    name: 'Modern Living Room',
    category: 'Living Room',
    width: 5, depth: 6, height: 2.8,
    wallColor: '#EDE9E3',
    floorColor: '#C4A882',
    items: [
      { id: 'sofa',      label: 'Sofa',       x: 0.4, y: 0.4, w: 2.2, d: 0.9, color: '#8B6A50', rotY: 0 },
      { id: 'tv',        label: 'TV Unit',     x: 1.5, y: 4.8, w: 2.0, d: 0.5, color: '#5A4A3A', rotY: 0 },
      { id: 'sidetable', label: 'Side Table',  x: 3.0, y: 0.4, w: 0.6, d: 0.6, color: '#A08060', rotY: 0 },
      { id: 'plant',     label: 'Plant',       x: 4.2, y: 0.3, w: 0.5, d: 0.5, color: '#5A7A50', rotY: 0 },
      { id: 'rug',       label: 'Rug',         x: 0.8, y: 1.5, w: 3.0, d: 2.5, color: '#B89878', rotY: 0 },
      { id: 'lamp',      label: 'Floor Lamp',  x: 0.2, y: 1.6, w: 0.4, d: 0.4, color: '#C8A870', rotY: 0 },
    ],
  },
  {
    id: 'bedroom-cozy',
    name: 'Cozy Bedroom',
    category: 'Bedroom',
    width: 4, depth: 5, height: 2.6,
    wallColor: '#DDD5CB',
    floorColor: '#B8986A',
    items: [
      { id: 'bed',       label: 'Double Bed',  x: 0.8, y: 0.3, w: 2.0, d: 2.2, color: '#8B6A50', rotY: 0 },
      { id: 'wardrobe',  label: 'Wardrobe',    x: 0.2, y: 3.8, w: 1.8, d: 0.7, color: '#6B4F3A', rotY: 0 },
      { id: 'desk',      label: 'Desk',        x: 2.8, y: 0.3, w: 1.0, d: 0.6, color: '#9A7A5A', rotY: 0 },
      { id: 'sidetable', label: 'Nightstand',  x: 0.2, y: 0.5, w: 0.5, d: 0.5, color: '#A08060', rotY: 0 },
      { id: 'sidetable', label: 'Nightstand',  x: 3.0, y: 0.5, w: 0.5, d: 0.5, color: '#A08060', rotY: 0 },
      { id: 'lamp',      label: 'Lamp',        x: 3.2, y: 1.4, w: 0.3, d: 0.3, color: '#C8A870', rotY: 0 },
    ],
  },
  {
    id: 'dining-classic',
    name: 'Classic Dining Room',
    category: 'Dining Room',
    width: 4.5, depth: 5, height: 2.8,
    wallColor: '#E8E0D8',
    floorColor: '#C8A870',
    items: [
      { id: 'dining',    label: 'Dining Table', x: 1.0, y: 1.5, w: 2.5, d: 1.4, color: '#7A5A3A', rotY: 0 },
      { id: 'chair',     label: 'Chair',        x: 0.5, y: 1.6, w: 0.6, d: 0.6, color: '#9A7A5A', rotY: 0 },
      { id: 'chair',     label: 'Chair',        x: 3.4, y: 1.6, w: 0.6, d: 0.6, color: '#9A7A5A', rotY: 0 },
      { id: 'chair',     label: 'Chair',        x: 1.3, y: 0.8, w: 0.6, d: 0.6, color: '#9A7A5A', rotY: 0 },
      { id: 'chair',     label: 'Chair',        x: 2.3, y: 0.8, w: 0.6, d: 0.6, color: '#9A7A5A', rotY: 0 },
      { id: 'chair',     label: 'Chair',        x: 1.3, y: 3.0, w: 0.6, d: 0.6, color: '#9A7A5A', rotY: 0 },
      { id: 'chair',     label: 'Chair',        x: 2.3, y: 3.0, w: 0.6, d: 0.6, color: '#9A7A5A', rotY: 0 },
      { id: 'plant',     label: 'Plant',        x: 4.0, y: 4.3, w: 0.4, d: 0.4, color: '#5A7A50', rotY: 0 },
    ],
  },
  {
    id: 'home-office',
    name: 'Home Office',
    category: 'Office',
    width: 3.5, depth: 4, height: 2.6,
    wallColor: '#E4DED6',
    floorColor: '#BAA07A',
    items: [
      { id: 'desk',      label: 'L-Desk',      x: 0.2, y: 0.2, w: 2.2, d: 0.7, color: '#8B6A50', rotY: 0 },
      { id: 'desk',      label: 'Side Desk',   x: 0.2, y: 0.9, w: 0.7, d: 1.0, color: '#8B6A50', rotY: 0 },
      { id: 'chair',     label: 'Office Chair',x: 0.8, y: 1.0, w: 0.7, d: 0.7, color: '#5A4A3A', rotY: 0 },
      { id: 'bookshelf', label: 'Bookshelf',   x: 2.8, y: 0.2, w: 0.6, d: 2.0, color: '#7A5A3A', rotY: 0 },
      { id: 'plant',     label: 'Plant',       x: 0.2, y: 3.4, w: 0.5, d: 0.5, color: '#5A7A50', rotY: 0 },
      { id: 'lamp',      label: 'Desk Lamp',   x: 1.8, y: 0.3, w: 0.3, d: 0.3, color: '#C8A870', rotY: 0 },
    ],
  },
  {
    id: 'studio-open',
    name: 'Studio Apartment',
    category: 'Studio',
    width: 6, depth: 7, height: 2.8,
    wallColor: '#EAE4DC',
    floorColor: '#C0A07A',
    items: [
      { id: 'sofa',      label: 'Sofa',        x: 0.3, y: 0.3, w: 2.5, d: 0.9, color: '#8B6A50', rotY: 0 },
      { id: 'tv',        label: 'TV Unit',     x: 0.5, y: 5.8, w: 2.0, d: 0.5, color: '#5A4A3A', rotY: 0 },
      { id: 'dining',    label: 'Dining Table',x: 3.5, y: 0.4, w: 2.0, d: 1.2, color: '#7A5A3A', rotY: 0 },
      { id: 'chair',     label: 'Chair',       x: 3.3, y: 1.8, w: 0.6, d: 0.6, color: '#9A7A5A', rotY: 0 },
      { id: 'chair',     label: 'Chair',       x: 4.9, y: 1.8, w: 0.6, d: 0.6, color: '#9A7A5A', rotY: 0 },
      { id: 'bed',       label: 'Bed',         x: 3.5, y: 3.5, w: 2.0, d: 2.2, color: '#9A7A5A', rotY: 0 },
      { id: 'plant',     label: 'Plant',       x: 5.3, y: 6.3, w: 0.5, d: 0.5, color: '#5A7A50', rotY: 0 },
      { id: 'rug',       label: 'Rug',         x: 0.2, y: 1.4, w: 3.0, d: 2.5, color: '#B89878', rotY: 0 },
    ],
  },
  {
    id: 'kids-bedroom',
    name: 'Kids Bedroom',
    category: 'Bedroom',
    width: 4, depth: 4.5, height: 2.5,
    wallColor: '#E8E4DC',
    floorColor: '#C8B890',
    items: [
      { id: 'bed',       label: 'Single Bed',  x: 0.2, y: 0.2, w: 1.0, d: 2.0, color: '#7A9ABF', rotY: 0 },
      { id: 'desk',      label: 'Study Desk',  x: 2.5, y: 0.2, w: 1.3, d: 0.6, color: '#8B9A6A', rotY: 0 },
      { id: 'chair',     label: 'Chair',       x: 2.7, y: 1.0, w: 0.6, d: 0.6, color: '#9AAA7A', rotY: 0 },
      { id: 'wardrobe',  label: 'Wardrobe',    x: 0.2, y: 3.6, w: 1.6, d: 0.6, color: '#7A9ABF', rotY: 0 },
      { id: 'bookshelf', label: 'Bookshelf',   x: 2.2, y: 3.6, w: 1.5, d: 0.5, color: '#8B9A6A', rotY: 0 },
      { id: 'plant',     label: 'Plant',       x: 3.4, y: 3.8, w: 0.4, d: 0.4, color: '#5A7A50', rotY: 0 },
    ],
  },
]

const EMOJI = {
  sofa:'🛋️', chair:'🪑', dining:'🍽️', sidetable:'🪵',
  bed:'🛏️', wardrobe:'🚪', desk:'🖥️', bookshelf:'📚',
  tv:'📺', lamp:'💡', plant:'🪴', rug:'🟫',
}

const CATEGORIES = ['All', ...new Set(TEMPLATES.map(t => t.category))]

const TemplatePreview = ({ template, size = 160 }) => {
  const roomW = template.width
  const roomD = template.depth
  const scale = Math.min(size / roomW, size / roomD)
  const W = roomW * scale
  const H = roomD * scale

  return (
    <div style={{
      width: W, height: H, position: 'relative',
      border: `2px solid ${template.wallColor}`,
      background: template.floorColor + '44',
      borderRadius: 4, overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        border: `7px solid ${template.wallColor}CC`,
        pointerEvents: 'none', borderRadius: 2,
      }}/>
      {template.items.map((item, idx) => {
        const ix = item.x * scale
        const iy = item.y * scale
        const iw = item.w * scale
        const ih = item.d * scale
        return (
          <div key={idx} style={{
            position: 'absolute',
            left: ix, top: iy,
            width: Math.max(iw, 8), height: Math.max(ih, 8),
            background: (item.color || '#A08060') + 'BB',
            borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: Math.min(Math.max(iw, 8), Math.max(ih, 8)) * 0.5,
            overflow: 'hidden',
          }}>
            {EMOJI[item.id] || ''}
          </div>
        )
      })}
    </div>
  )
}

export default function Templates() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = React.useState('All')
  const [hovered, setHovered] = React.useState(null)

  const filtered = activeCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory)

  const handleUseTemplate = (template) => {
    navigate('/editor', {
      state: {
        // Use templateDesign (NOT editDesign) so Editor never sets a fake editId.
        // This ensures saving always creates a NEW design in localStorage.
        templateDesign: {
          ...template,
          name: template.name,
          length: template.depth,
        },
        ts: Date.now(),
      }
    })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500&display=swap');
        :root {
          --bg: #F7F4EE; --panel: #EFEBE4; --border: #DDD5CB;
          --text: #3A2E24; --accent: #6B4F3A; --muted: #9B8878;
          --white: #FEFCFA;
        }
        * { box-sizing: border-box; margin: 0; padding: 0 }
        .tp-page { min-height: 100vh; background: var(--bg); font-family: 'Jost', sans-serif; color: var(--text) }
        .tp-body { padding: 32px 44px }
        .tp-heading {
          font-family: 'Cormorant Garamond', serif; font-size: 26px;
          font-weight: 600; color: var(--accent); margin-bottom: 8px;
          display: flex; align-items: center; gap: 12px;
        }
        .tp-heading::after { content: ''; flex: 1; height: 1px; background: var(--border) }
        .tp-subtitle { font-size: 13px; color: var(--muted); margin-bottom: 24px }
        .tp-filters { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap }
        .tp-filter-btn {
          padding: 6px 16px; border-radius: 50px; border: 1px solid var(--border);
          background: var(--white); font-family: 'Jost', sans-serif;
          font-size: 12px; font-weight: 400; color: var(--muted);
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;
        }
        .tp-filter-btn:hover { border-color: var(--muted); color: var(--text) }
        .tp-filter-btn.active {
          background: var(--accent); border-color: var(--accent);
          color: #FFF8F0; font-weight: 500;
        }
        .tp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .tp-card {
          background: var(--white); border-radius: 14px;
          border: 1px solid var(--border);
          overflow: hidden; transition: box-shadow 0.2s, transform 0.2s;
          box-shadow: 0 2px 12px rgba(58,46,36,0.05);
        }
        .tp-card:hover {
          box-shadow: 0 6px 24px rgba(58,46,36,0.12);
          transform: translateY(-2px);
        }
        .tp-card-preview {
          background: var(--panel); padding: 24px;
          display: flex; align-items: center; justify-content: center;
          min-height: 190px; position: relative;
        }
        .tp-card-body { padding: 16px 18px }
        .tp-card-category {
          font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase;
          color: var(--muted); font-weight: 600; margin-bottom: 4px;
        }
        .tp-card-name {
          font-family: 'Cormorant Garamond', serif; font-size: 17px;
          font-weight: 600; color: var(--text); margin-bottom: 10px;
        }
        .tp-card-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }
        .tp-card-dims { font-size: 11.5px; color: var(--muted) }
        .tp-card-colors { display: flex; gap: 4px }
        .tp-color-dot {
          width: 12px; height: 12px; border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .tp-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 10px; border-top: 1px solid var(--border);
        }
        .tp-item-count { font-size: 11px; color: var(--muted) }
        .tp-use-btn {
          padding: 7px 18px; border-radius: 50px; border: none;
          background: var(--accent); color: #FFF8F0;
          font-family: 'Jost', sans-serif; font-size: 11.5px;
          font-weight: 500; cursor: pointer; transition: background 0.2s;
          letter-spacing: 0.4px;
        }
        .tp-use-btn:hover { background: #5A3E2C }
      `}</style>

      <div className="tp-page">
        <Navbar />
        <div className="tp-body">
          <div className="tp-heading">Room Templates</div>
          <p className="tp-subtitle">
            Choose a pre-furnished layout to get started — open it in the editor and customise to your taste.
          </p>

          {/* Category filters */}
          <div className="tp-filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`tp-filter-btn${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="tp-grid">
            {filtered.map(template => (
              <div
                key={template.id}
                className="tp-card"
                onMouseEnter={() => setHovered(template.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="tp-card-preview">
                  <TemplatePreview template={template} size={160} />
                </div>
                <div className="tp-card-body">
                  <div className="tp-card-category">{template.category}</div>
                  <div className="tp-card-name">{template.name}</div>
                  <div className="tp-card-meta">
                    <span className="tp-card-dims">
                      {template.width}m × {template.depth}m × {template.height}m
                    </span>
                    <div className="tp-card-colors">
                      <div className="tp-color-dot" style={{ background: template.wallColor }} title="Wall colour" />
                      <div className="tp-color-dot" style={{ background: template.floorColor }} title="Floor colour" />
                    </div>
                  </div>
                  <div className="tp-card-footer">
                    <span className="tp-item-count">
                      {template.items.length} furniture item{template.items.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      className="tp-use-btn"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}