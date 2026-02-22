import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

// Furniture catalogue
const FURNITURE_LIST = [
  { id: 'sofa',        label: 'Sofa',          emoji: '🛋️', w: 80, h: 40 },
  { id: 'chair',       label: 'Chair',         emoji: '🪑', w: 40, h: 40 },
  { id: 'dining',      label: 'Dining Table',  emoji: '🍽️', w: 80, h: 60 },
  { id: 'side-table',  label: 'Side Table',    emoji: '🪵', w: 40, h: 40 },
  { id: 'bed',         label: 'Bed',           emoji: '🛏️', w: 90, h: 70 },
  { id: 'wardrobe',    label: 'Wardrobe',      emoji: '🚪', w: 70, h: 40 },
  { id: 'desk',        label: 'Desk',          emoji: '🖥️', w: 70, h: 40 },
  { id: 'bookshelf',   label: 'Bookshelf',     emoji: '📚', w: 50, h: 30 },
]

let idCounter = 1

export default function Editor() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  // Room settings
  const [width, setWidth]   = useState('3.5')
  const [length, setLength] = useState('4.0')
  const [height, setHeight] = useState('2.8')
  const [wallColor,  setWallColor]  = useState('#EB5D5D')
  const [floorColor, setFloorColor] = useState('#2868F1')
  const [roomCreated, setRoomCreated] = useState(false)

  // Furniture
  const [selectedFurniture, setSelectedFurniture] = useState(FURNITURE_LIST[0].id)
  const [furnitureColor, setFurnitureColor] = useState('#808080')
  const [placedItems, setPlacedItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // View
  const [view, setView] = useState('3D')

  // Zoom & Rotation
  const [zoom, setZoom] = useState(1)
  const [rotX, setRotX] = useState(0)
  const [rotY, setRotY] = useState(0)

  // Design name
  const [designName, setDesignName] = useState('')

  const handleCreateRoom = () => setRoomCreated(true)

  const handleAddFurniture = () => {
    const meta = FURNITURE_LIST.find(f => f.id === selectedFurniture)
    const newItem = {
      uid: idCounter++,
      ...meta,
      x: 40,
      y: 40,
      color: furnitureColor,
    }
    setPlacedItems(prev => [...prev, newItem])
  }

  // Drag handlers
  const onMouseDown = (e, uid) => {
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const item = placedItems.find(i => i.uid === uid)
    setDragging(uid)
    setSelectedItem(uid)
    setDragOffset({
      x: e.clientX - rect.left - item.x,
      y: e.clientY - rect.top  - item.y,
    })
  }

  const onMouseMove = (e) => {
    if (!dragging) return
    const rect = canvasRef.current.getBoundingClientRect()
    setPlacedItems(prev => prev.map(i =>
      i.uid === dragging
        ? { ...i, x: e.clientX - rect.left - dragOffset.x,
                   y: e.clientY - rect.top  - dragOffset.y }
        : i
    ))
  }

  const onMouseUp = () => setDragging(null)

  const handleDeleteSelected = () => {
    setPlacedItems(prev => prev.filter(i => i.uid !== selectedItem))
    setSelectedItem(null)
  }

  const handleSave = () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (!user) { navigate('/signin'); return }
    const name = designName.trim() || 'My Design'
    const code = 'DR' + Math.floor(100 + Math.random() * 900)
    const design = {
      id: Date.now(),
      userId: user.id,
      code,
      name,
      date: new Date().toLocaleDateString('en-GB'),
      width, length, height,
      wallColor, floorColor,
      items: placedItems,
    }
    const all = JSON.parse(localStorage.getItem('designs') || '[]')
    all.push(design)
    localStorage.setItem('designs', JSON.stringify(all))
    alert(`Design "${name}" saved successfully! Code: ${code}`)
  }

  const roomPxW = Math.round(parseFloat(width)  * 80) || 280
  const roomPxH = Math.round(parseFloat(length) * 80) || 320

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Jost:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .ed-page {
          min-height: 100vh;
          background: #F5F2EC;
          font-family: 'Jost', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .ed-body {
          display: flex;
          flex: 1;
          gap: 0;
        }

        /* ── LEFT PANEL ── */
        .ed-left {
          width: 240px;
          flex-shrink: 0;
          background: #E8E3DC;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 0;
          border-right: 1px solid #D9D2C6;
          overflow-y: auto;
        }

        .ed-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 700;
          color: #4E4034;
          margin-bottom: 12px;
          margin-top: 16px;
        }
        .ed-section-title:first-child { margin-top: 0; }

        .ed-divider {
          border: none;
          border-top: 1px solid #D9D2C6;
          margin: 16px 0;
        }

        .ed-sub-label {
          font-size: 12px;
          color: #6b5c50;
          margin-bottom: 6px;
          font-weight: 400;
        }

        .ed-hint {
          font-size: 11px;
          color: #8C7864;
          margin-bottom: 12px;
          font-weight: 300;
        }

        .ed-dims {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }

        .ed-dim-box {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .ed-dim-label {
          font-size: 10px;
          color: #8C7864;
        }
        .ed-dim-input {
          width: 100%;
          padding: 7px 8px;
          border-radius: 8px;
          border: 1px solid #D9D2C6;
          background: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 12.5px;
          color: #4E4034;
          outline: none;
          text-align: center;
        }

        .ed-create-btn {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: #4E4034;
          color: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.8px;
          cursor: pointer;
          transition: background 0.2s;
          margin-bottom: 4px;
        }
        .ed-create-btn:hover { background: #3a2e26; }

        .ed-colors {
          display: flex;
          gap: 10px;
          margin-bottom: 4px;
        }

        .ed-color-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .ed-color-row {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1px solid #D9D2C6;
          border-radius: 8px;
          padding: 5px 8px;
        }

        .ed-color-swatch {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          border: 1px solid #ccc;
          flex-shrink: 0;
        }

        .ed-color-input {
          border: none;
          background: transparent;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          color: #4E4034;
          outline: none;
          width: 52px;
          cursor: pointer;
        }

        .ed-select {
          width: 100%;
          padding: 9px 10px;
          border-radius: 8px;
          border: 1px solid #D9D2C6;
          background: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 12.5px;
          color: #4E4034;
          outline: none;
          margin-bottom: 10px;
          cursor: pointer;
        }

        .ed-furniture-color {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid #D9D2C6;
          border-radius: 8px;
          padding: 7px 10px;
          margin-bottom: 10px;
        }

        .ed-add-btn {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: #4E4034;
          color: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ed-add-btn:hover { background: #3a2e26; }

        /* Save row */
        .ed-save-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
        }

        .ed-name-input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #D9D2C6;
          background: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          color: #4E4034;
          outline: none;
        }
        .ed-name-input::placeholder { color: #B7A996; }

        .ed-save-btn {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: #8C7864;
          color: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ed-save-btn:hover { background: #7a6757; }

        /* ── CANVAS AREA ── */
        .ed-canvas-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #EDEAE4;
          border: 1px solid #D9D2C6;
          border-top: none;
          border-bottom: none;
          overflow: hidden;
          position: relative;
          min-height: calc(100vh - 56px);
        }

        .ed-canvas-wrap {
          position: relative;
          transition: transform 0.2s;
        }

        /* 2D room */
        .ed-room-2d {
          position: relative;
          border: 2px solid #4E4034;
          overflow: hidden;
        }

        .ed-furniture-item {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: grab;
          user-select: none;
          font-size: 20px;
          transition: border-color 0.15s;
        }
        .ed-furniture-item:active { cursor: grabbing; }
        .ed-furniture-item.selected { border-color: #4E4034; }

        /* 3D room */
        .ed-room-3d {
          position: relative;
          width: 560px;
          height: 420px;
          perspective: 900px;
        }

        .ed-room-3d-inner {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transform: rotateX(30deg) rotateY(-20deg);
          transition: transform 0.3s;
          position: relative;
        }

        .ed-floor {
          position: absolute;
          width: 340px;
          height: 280px;
          bottom: 20px;
          left: 80px;
          transform: rotateX(90deg) translateZ(0px);
          transform-origin: bottom center;
        }

        .ed-wall-back {
          position: absolute;
          width: 340px;
          height: 220px;
          top: 20px;
          left: 80px;
          transform: translateZ(0px);
        }

        .ed-wall-left {
          position: absolute;
          width: 200px;
          height: 220px;
          top: 20px;
          left: 80px;
          transform: rotateY(90deg) translateZ(0px);
          transform-origin: left center;
        }

        .ed-empty-canvas {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #B7A996;
          font-size: 13px;
        }

        .ed-empty-icon { font-size: 48px; }

        /* ── RIGHT PANEL ── */
        .ed-right {
          width: 120px;
          flex-shrink: 0;
          background: #E8E3DC;
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-left: 1px solid #D9D2C6;
        }

        .ed-right-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 700;
          color: #4E4034;
          margin-bottom: 6px;
        }

        .ed-zoom-btn {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          border: 1px solid #D9D2C6;
          background: #fff;
          font-size: 18px;
          color: #4E4034;
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ed-zoom-btn:hover { background: #F5F2EC; }

        .ed-zoom-row {
          display: flex;
          gap: 6px;
        }

        .ed-rot-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .ed-rot-btn {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          border: 1px solid #D9D2C6;
          background: #fff;
          font-size: 16px;
          color: #4E4034;
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ed-rot-btn:hover { background: #F5F2EC; }

        .ed-view-btn {
          width: 100%;
          padding: 10px 6px;
          border-radius: 8px;
          border: 1px solid #D9D2C6;
          background: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          color: #4E4034;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 6px;
        }
        .ed-view-btn.active {
          background: #4E4034;
          color: #fff;
          border-color: #4E4034;
        }

        .ed-delete-btn {
          width: 100%;
          padding: 9px 6px;
          border-radius: 8px;
          border: 1px solid #D9D2C6;
          background: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          color: #c0392b;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .ed-delete-btn:hover {
          background: #fff0ee;
          border-color: #c0392b;
        }
      `}</style>

      <div className="ed-page">
        <Navbar />

        <div className="ed-body">

          {/* ── LEFT PANEL ── */}
          <div className="ed-left">

            {/* Room Settings */}
            <div className="ed-section-title">Room Settings</div>
            <div className="ed-sub-label">Room Dimensions</div>
            <div className="ed-hint">You can update dimensions at any time</div>

            <div className="ed-dims">
              <div className="ed-dim-box">
                <span className="ed-dim-label">Width (m)</span>
                <input className="ed-dim-input" value={width}
                  onChange={e => setWidth(e.target.value)} />
              </div>
              <div className="ed-dim-box">
                <span className="ed-dim-label">Length (m)</span>
                <input className="ed-dim-input" value={length}
                  onChange={e => setLength(e.target.value)} />
              </div>
              <div className="ed-dim-box">
                <span className="ed-dim-label">Height (m)</span>
                <input className="ed-dim-input" value={height}
                  onChange={e => setHeight(e.target.value)} />
              </div>
            </div>

            <button className="ed-create-btn" onClick={handleCreateRoom}>
              CREATE / UPDATE ROOM
            </button>

            <hr className="ed-divider" />

            {/* Materials */}
            <div className="ed-section-title">Materials & Colours</div>
            <div className="ed-colors">
              <div className="ed-color-box">
                <span className="ed-sub-label">Wall Colour</span>
                <div className="ed-color-row">
                  <div className="ed-color-swatch" style={{ background: wallColor }} />
                  <input
                    className="ed-color-input"
                    type="color"
                    value={wallColor}
                    onChange={e => setWallColor(e.target.value)}
                    title="Wall colour"
                  />
                  <span style={{ fontSize: 10, color: '#8C7864' }}>
                    {wallColor.replace('#','').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ed-color-box">
                <span className="ed-sub-label">Floor Colour</span>
                <div className="ed-color-row">
                  <div className="ed-color-swatch" style={{ background: floorColor }} />
                  <input
                    className="ed-color-input"
                    type="color"
                    value={floorColor}
                    onChange={e => setFloorColor(e.target.value)}
                    title="Floor colour"
                  />
                  <span style={{ fontSize: 10, color: '#8C7864' }}>
                    {floorColor.replace('#','').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <hr className="ed-divider" />

            {/* Add Furniture */}
            <div className="ed-section-title">Add Furniture</div>
            <select
              className="ed-select"
              value={selectedFurniture}
              onChange={e => setSelectedFurniture(e.target.value)}
            >
              {FURNITURE_LIST.map(f => (
                <option key={f.id} value={f.id}>{f.emoji} {f.label}</option>
              ))}
            </select>

            <div className="ed-sub-label">Furniture Colour</div>
            <div className="ed-furniture-color">
              <div className="ed-color-swatch" style={{ background: furnitureColor }} />
              <input
                type="color"
                value={furnitureColor}
                onChange={e => setFurnitureColor(e.target.value)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: 28 }}
              />
              <span style={{ fontSize: 11, color: '#8C7864' }}>
                {furnitureColor.replace('#','').charAt(0).toUpperCase() +
                  ['Gray','Beige','Brown','White','Black','Blue','Green','Red']
                  [FURNITURE_LIST.findIndex(f=>f.id===selectedFurniture) % 8]}
              </span>
            </div>

            <button className="ed-add-btn" onClick={handleAddFurniture}>
              ADD TO ROOM
            </button>

            <hr className="ed-divider" />

            {/* Save */}
            <div className="ed-section-title">Save Design</div>
            <div className="ed-save-row">
              <input
                className="ed-name-input"
                placeholder="Design name..."
                value={designName}
                onChange={e => setDesignName(e.target.value)}
              />
              <button className="ed-save-btn" onClick={handleSave}>
                SAVE DESIGN
              </button>
            </div>

          </div>

          {/* ── CANVAS ── */}
          <div
            className="ed-canvas-area"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
          >
            {!roomCreated ? (
              <div className="ed-empty-canvas">
                <div className="ed-empty-icon">🏠</div>
                <p>Enter room dimensions and click</p>
                <p><strong>CREATE / UPDATE ROOM</strong> to start</p>
              </div>
            ) : view === '2D' ? (
              /* 2D VIEW */
              <div
                ref={canvasRef}
                className="ed-room-2d"
                style={{
                  width: roomPxW,
                  height: roomPxH,
                  background: floorColor + '33',
                  borderColor: '#4E4034',
                  transform: `scale(${zoom})`,
                }}
              >
                {/* Wall colour overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  border: `16px solid ${wallColor}55`,
                  pointerEvents: 'none',
                }} />

                {placedItems.map(item => (
                  <div
                    key={item.uid}
                    className={`ed-furniture-item${selectedItem === item.uid ? ' selected' : ''}`}
                    style={{
                      left: item.x,
                      top: item.y,
                      width: item.w,
                      height: item.h,
                      background: item.color + 'cc',
                    }}
                    onMouseDown={e => onMouseDown(e, item.uid)}
                    onClick={() => setSelectedItem(item.uid)}
                    title={item.label}
                  >
                    {item.emoji}
                  </div>
                ))}
              </div>
            ) : (
              /* 3D VIEW */
              <div
                className="ed-room-3d"
                style={{ transform: `scale(${zoom})` }}
              >
                <div
                  className="ed-room-3d-inner"
                  style={{
                    transform: `rotateX(${30 + rotX}deg) rotateY(${-20 + rotY}deg)`
                  }}
                >
                  {/* Floor */}
                  <div className="ed-floor" style={{
                    background: `linear-gradient(135deg, ${floorColor}99, ${floorColor}55)`,
                    border: `2px solid ${floorColor}`,
                    transform: `rotateX(90deg) translateZ(-10px)`,
                  }} />

                  {/* Back wall */}
                  <div className="ed-wall-back" style={{
                    background: `linear-gradient(180deg, ${wallColor}66, ${wallColor}33)`,
                    border: `1px solid ${wallColor}`,
                    transform: `translateZ(-100px)`,
                  }} />

                  {/* Left wall */}
                  <div className="ed-wall-left" style={{
                    background: `linear-gradient(90deg, ${wallColor}44, ${wallColor}22)`,
                    border: `1px solid ${wallColor}`,
                    transform: `rotateY(90deg) translateZ(-100px)`,
                  }} />

                  {/* Furniture in 3D */}
                  {placedItems.map((item, idx) => (
                    <div key={item.uid} style={{
                      position: 'absolute',
                      bottom: 20 + (idx * 2),
                      left: 80 + (item.x * 0.4),
                      width: item.w * 0.6,
                      height: item.h * 0.6,
                      background: item.color + 'dd',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      border: selectedItem === item.uid ? '2px solid #4E4034' : '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                    }}
                      onClick={() => setSelectedItem(item.uid)}
                    >
                      {item.emoji}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="ed-right">

            {/* Zoom */}
            <div>
              <div className="ed-right-title">Zoom</div>
              <div className="ed-zoom-row">
                <button className="ed-zoom-btn"
                  onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>+</button>
                <button className="ed-zoom-btn"
                  onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))}>−</button>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #D9D2C6' }} />

            {/* Rotation */}
            <div>
              <div className="ed-right-title">Rotation</div>
              <div className="ed-rot-grid">
                <button className="ed-rot-btn"
                  onClick={() => setRotX(r => r - 10)}>↑</button>
                <button className="ed-rot-btn"
                  onClick={() => setRotX(r => r + 10)}>↓</button>
                <button className="ed-rot-btn"
                  onClick={() => setRotY(r => r - 10)}>←</button>
                <button className="ed-rot-btn"
                  onClick={() => setRotY(r => r + 10)}>→</button>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #D9D2C6' }} />

            {/* View */}
            <div>
              <div className="ed-right-title">View</div>
              <button
                className={`ed-view-btn${view === '3D' ? ' active' : ''}`}
                onClick={() => setView('3D')}
              >3D View</button>
              <button
                className={`ed-view-btn${view === '2D' ? ' active' : ''}`}
                onClick={() => setView('2D')}
              >2D View</button>
            </div>

            {/* Delete selected */}
            {selectedItem && (
              <button className="ed-delete-btn" onClick={handleDeleteSelected}>
                🗑 Remove
              </button>
            )}

          </div>

        </div>
      </div>
    </>
  )
}