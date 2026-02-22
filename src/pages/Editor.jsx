import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'

const FURNITURE_LIST = [
  { id: 'sofa',      label: 'Sofa',         emoji: '🛋️', w: 100, h: 50 },
  { id: 'chair',     label: 'Chair',        emoji: '🪑', w:  48, h: 48 },
  { id: 'dining',    label: 'Dining Table', emoji: '🍽️', w:  95, h: 65 },
  { id: 'sidetable', label: 'Side Table',   emoji: '🪵', w:  48, h: 48 },
  { id: 'bed',       label: 'Bed',          emoji: '🛏️', w: 110, h: 80 },
  { id: 'wardrobe',  label: 'Wardrobe',     emoji: '🚪', w:  80, h: 42 },
  { id: 'desk',      label: 'Desk',         emoji: '🖥️', w:  85, h: 48 },
  { id: 'bookshelf', label: 'Bookshelf',    emoji: '📚', w:  58, h: 32 },
  { id: 'tv',        label: 'TV Stand',     emoji: '📺', w:  85, h: 38 },
  { id: 'lamp',      label: 'Floor Lamp',   emoji: '💡', w:  32, h: 32 },
]

const ROOM_TEMPLATES = {
  'Living Room':  { width:'4.0', length:'5.0', height:'2.8', wallColor:'#F0EAE0', floorColor:'#C8A882' },
  'Bed Room':     { width:'3.5', length:'4.5', height:'2.8', wallColor:'#E8E0F0', floorColor:'#C4B49A' },
  'Office':       { width:'3.0', length:'4.0', height:'2.8', wallColor:'#E0EAF0', floorColor:'#B0C0C8' },
  'Dining Area':  { width:'3.5', length:'4.0', height:'2.8', wallColor:'#F0E8DC', floorColor:'#C0A070' },
  'Kitchen Area': { width:'3.0', length:'3.5', height:'2.8', wallColor:'#F0F0E4', floorColor:'#C8C0A0' },
}

const FURNITURE_PRESETS = {
  'Living Room Set':  ['sofa','chair','tv','lamp','sidetable'],
  'Bed Room Set':     ['bed','wardrobe','lamp','sidetable'],
  'Office Set':       ['desk','chair','bookshelf','lamp'],
  'Dining Set':       ['dining','chair','chair','lamp'],
  'Kitchen Set':      ['sidetable','chair','lamp'],
}

let uidCounter = 1

export default function Editor() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const canvasRef = useRef(null)
  const dragInfo  = useRef(null)

  const [width,       setWidth]       = useState('3.5')
  const [length,      setLength]      = useState('4.0')
  const [height,      setHeight]      = useState('2.8')
  const [wallColor,   setWallColor]   = useState('#F0EAE0')
  const [floorColor,  setFloorColor]  = useState('#C8A882')
  const [roomCreated, setRoomCreated] = useState(false)
  const [roomType,    setRoomType]    = useState('')

  const [selFurniture, setSelFurniture] = useState(FURNITURE_LIST[0].id)
  const [furColor,     setFurColor]     = useState('#A08060')
  const [placedItems,  setPlacedItems]  = useState([])
  const [selectedUid,  setSelectedUid]  = useState(null)

  const [view,       setView]       = useState('3D')
  const [zoom,       setZoom]       = useState(1)
  const [rotX,       setRotX]       = useState(28)
  const [rotY,       setRotY]       = useState(-20)
  const [designName, setDesignName] = useState('')

  const roomPxW = Math.round(parseFloat(width)  * 90) || 315
  const roomPxH = Math.round(parseFloat(length) * 90) || 360

  // Handle template from Navbar
  useEffect(() => {
    if (!location.state) return
    const { template, preset } = location.state

    if (template && ROOM_TEMPLATES[template]) {
      const t = ROOM_TEMPLATES[template]
      setWidth(t.width)
      setLength(t.length)
      setHeight(t.height)
      setWallColor(t.wallColor)
      setFloorColor(t.floorColor)
      setRoomType(template)
      setRoomCreated(true)
      setDesignName(template)
      setPlacedItems([])
      setView('3D')
    }

    if (preset && FURNITURE_PRESETS[preset]) {
      const ids = FURNITURE_PRESETS[preset]
      const items = ids.map((id, i) => {
        const meta = FURNITURE_LIST.find(f => f.id === id)
        return {
          uid: uidCounter++, ...meta,
          x: 20 + (i % 3) * 120,
          y: 20 + Math.floor(i / 3) * 100,
          color: '#A08060',
        }
      })
      setPlacedItems(items)
      setRoomCreated(true)
    }
  }, [location.state])

  // Drag
  const onItemMouseDown = useCallback((e, uid) => {
    e.preventDefault(); e.stopPropagation()
    const rect = canvasRef.current.getBoundingClientRect()
    const item = placedItems.find(i => i.uid === uid)
    dragInfo.current = {
      uid,
      offsetX: e.clientX - rect.left - item.x,
      offsetY: e.clientY - rect.top  - item.y,
    }
    setSelectedUid(uid)
  }, [placedItems])

  const onMouseMove = useCallback((e) => {
    if (!dragInfo.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const { uid, offsetX, offsetY } = dragInfo.current
    const item = placedItems.find(i => i.uid === uid)
    if (!item) return
    setPlacedItems(prev => prev.map(i => i.uid === uid ? {
      ...i,
      x: Math.max(0, Math.min(e.clientX - rect.left - offsetX, roomPxW - item.w)),
      y: Math.max(0, Math.min(e.clientY - rect.top  - offsetY, roomPxH - item.h)),
    } : i))
  }, [placedItems, roomPxW, roomPxH])

  const onMouseUp = useCallback(() => { dragInfo.current = null }, [])

  const handleAddFurniture = () => {
    const meta = FURNITURE_LIST.find(f => f.id === selFurniture)
    setPlacedItems(prev => [...prev, {
      uid: uidCounter++, ...meta,
      x: 20 + Math.random() * Math.max(10, roomPxW - meta.w - 40),
      y: 20 + Math.random() * Math.max(10, roomPxH - meta.h - 40),
      color: furColor,
    }])
  }

  const handleCreateRoom = () => {
    setRoomCreated(true)
    setRoomType('')
  }

  const handleSave = () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (!user) { navigate('/signin'); return }
    const name = designName.trim() || 'My Design'
    const code = 'DR' + Math.floor(100 + Math.random() * 900)
    const design = {
      id: Date.now(), userId: user.id, code, name,
      date: new Date().toLocaleDateString('en-GB'),
      width, length, height, wallColor, floorColor, items: placedItems,
    }
    const all = JSON.parse(localStorage.getItem('designs') || '[]')
    localStorage.setItem('designs', JSON.stringify([...all, design]))
    alert(`✅ Design "${name}" saved!\nCode: ${code}`)
  }

  // 3D room dimensions
  const sceneW = 440
  const sceneH = 340
  const floorW = 380
  const floorD = 300
  const wallH  = 220

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }

        .ed-page { min-height:100vh; background:#F5F2EC; font-family:'Jost',sans-serif; display:flex; flex-direction:column; }
        .ed-body { display:flex; flex:1; overflow:hidden; height:calc(100vh - 56px); }

        /* ── LEFT ── */
        .ed-left {
          width:240px; flex-shrink:0; background:#E8E3DC;
          padding:16px 14px; overflow-y:auto;
          border-right:1px solid #D9D2C6;
        }
        .ed-sec { font-family:'Cormorant Garamond',serif; font-size:15px; font-weight:700; color:#4E4034; margin:14px 0 6px; }
        .ed-sec:first-child { margin-top:0; }
        .ed-sub  { font-size:12px; color:#4E4034; font-weight:500; margin-bottom:3px; }
        .ed-hint { font-size:11px; color:#8C7864; margin-bottom:10px; font-weight:300; }
        .ed-hr   { border:none; border-top:1px solid #D9D2C6; margin:14px 0; }

        .ed-dims { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:10px; }
        .ed-dim  { display:flex; flex-direction:column; gap:3px; }
        .ed-dim span { font-size:10px; color:#6b5c50; }
        .ed-dim input {
          padding:8px 4px; border-radius:8px; border:1px solid #D9D2C6;
          background:#fff; font-family:'Jost',sans-serif; font-size:13px;
          color:#4E4034; outline:none; text-align:center; width:100%;
        }

        .ed-btn {
          width:100%; padding:11px; border-radius:8px; border:none;
          background:#4E4034; color:#fff; font-family:'Jost',sans-serif;
          font-size:11px; font-weight:500; letter-spacing:.8px;
          cursor:pointer; transition:background .2s; margin-bottom:4px;
        }
        .ed-btn:hover { background:#3a2e26; }

        .ed-colors { display:flex; gap:8px; margin-bottom:4px; }
        .ed-color-col { flex:1; }
        .ed-color-col > span { font-size:11px; color:#6b5c50; display:block; margin-bottom:4px; }
        .ed-color-row {
          display:flex; align-items:center; gap:5px;
          background:#fff; border:1px solid #D9D2C6;
          border-radius:8px; padding:5px 7px;
        }
        .ed-swatch { width:14px; height:14px; border-radius:3px; border:1px solid #ccc; flex-shrink:0; }
        .ed-color-row input[type=color] { border:none; background:transparent; cursor:pointer; width:20px; height:18px; padding:0; }
        .ed-color-row span { font-size:9px; color:#8C7864; }

        .ed-select {
          width:100%; padding:9px 10px; border-radius:8px;
          border:1px solid #D9D2C6; background:#fff;
          font-family:'Jost',sans-serif; font-size:12.5px; color:#4E4034;
          outline:none; margin-bottom:8px; cursor:pointer;
        }
        .ed-fur-color {
          display:flex; align-items:center; gap:8px;
          background:#fff; border:1px solid #D9D2C6;
          border-radius:8px; padding:7px 10px; margin-bottom:10px;
        }
        .ed-fur-color input[type=color] { border:none; background:transparent; cursor:pointer; width:26px; height:20px; padding:0; }
        .ed-fur-color span { font-size:11px; color:#6b5c50; }

        .ed-name-input {
          width:100%; padding:9px 10px; border-radius:8px;
          border:1px solid #D9D2C6; background:#fff;
          font-family:'Jost',sans-serif; font-size:12px; color:#4E4034;
          outline:none; margin-bottom:6px;
        }
        .ed-name-input::placeholder { color:#B7A996; }
        .ed-btn-save {
          width:100%; padding:11px; border-radius:8px; border:none;
          background:#8C7864; color:#fff; font-family:'Jost',sans-serif;
          font-size:11px; font-weight:500; cursor:pointer; transition:background .2s;
        }
        .ed-btn-save:hover { background:#7a6757; }

        /* ── CANVAS ── */
        .ed-canvas-area {
          flex:1; display:flex; align-items:center; justify-content:center;
          background:#EDEAE4; position:relative; overflow:hidden; user-select:none;
        }

        /* 2D */
        .ed-room-2d {
          position:relative; border:3px solid #4E4034;
          overflow:hidden; border-radius:2px;
        }
        .ed-item {
          position:absolute; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          border-radius:8px; border:2px solid transparent;
          cursor:grab; user-select:none;
          transition:border-color .15s, box-shadow .15s;
        }
        .ed-item:active { cursor:grabbing; }
        .ed-item.sel { border-color:#4E4034; box-shadow:0 0 0 3px rgba(78,64,52,0.25); }
        .ed-item-lbl { font-size:9px; color:#4E4034; font-weight:500; margin-top:2px; pointer-events:none; }

        /* 3D CSS room */
        .ed-3d-outer {
          perspective: 1200px;
          display:flex; align-items:center; justify-content:center;
        }
        .ed-3d-scene {
          position:relative;
          transform-style: preserve-3d;
          transform-origin: center center;
        }
        .ed-face {
          position:absolute;
          backface-visibility: hidden;
        }

        /* furniture in 3D */
        .ed-3d-item {
          position:absolute;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          border-radius:6px; cursor:pointer;
          transition:box-shadow .15s;
          font-size:20px;
          border:2px solid transparent;
        }
        .ed-3d-item.sel { border-color:#4E4034; box-shadow:0 0 0 3px rgba(78,64,52,0.3); }
        .ed-3d-item-lbl { font-size:8px; color:#4E4034; font-weight:500; margin-top:1px; }

        /* empty */
        .ed-empty {
          display:flex; flex-direction:column; align-items:center;
          gap:14px; color:#B7A996; font-size:14px; text-align:center;
        }
        .ed-empty-icon { font-size:56px; }

        /* hint */
        .drag-hint {
          position:absolute; bottom:14px; left:50%; transform:translateX(-50%);
          background:rgba(78,64,52,0.8); color:#fff;
          font-family:'Jost',sans-serif; font-size:11px;
          padding:5px 16px; border-radius:20px; pointer-events:none; white-space:nowrap;
        }

        /* room type badge */
        .room-badge {
          position:absolute; top:16px; left:16px;
          background:rgba(78,64,52,0.75); color:#fff;
          font-family:'Jost',sans-serif; font-size:11px;
          padding:4px 12px; border-radius:20px; pointer-events:none;
        }

        /* ── RIGHT ── */
        .ed-right {
          width:115px; flex-shrink:0; background:#E8E3DC;
          padding:16px 10px; border-left:1px solid #D9D2C6;
          display:flex; flex-direction:column; gap:14px; overflow-y:auto;
        }
        .ed-r-title { font-family:'Cormorant Garamond',serif; font-size:13.5px; font-weight:700; color:#4E4034; margin-bottom:8px; }
        .ed-r-hr { border:none; border-top:1px solid #D9D2C6; }
        .ed-zoom-row { display:flex; gap:6px; }
        .ed-icon-btn {
          flex:1; height:42px; border-radius:8px;
          border:1px solid #D9D2C6; background:#fff;
          font-size:18px; color:#4E4034; cursor:pointer;
          transition:background .15s; display:flex; align-items:center; justify-content:center;
        }
        .ed-icon-btn:hover { background:#F5F2EC; }
        .ed-rot-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
        .ed-view-btn {
          width:100%; padding:10px 4px; border-radius:8px;
          border:1px solid #D9D2C6; background:#fff;
          font-family:'Jost',sans-serif; font-size:12px; color:#4E4034;
          cursor:pointer; transition:all .2s; margin-bottom:6px;
        }
        .ed-view-btn.active { background:#4E4034; color:#fff; border-color:#4E4034; }
        .ed-del-btn {
          width:100%; padding:9px 4px; border-radius:8px;
          border:1px solid #D9D2C6; background:#fff;
          font-family:'Jost',sans-serif; font-size:10.5px; color:#c0392b;
          cursor:pointer; transition:all .2s;
        }
        .ed-del-btn:hover { background:#fff0ee; border-color:#c0392b; }
      `}</style>

      <div className="ed-page">
        <Navbar />
        <div className="ed-body">

          {/* ── LEFT PANEL ── */}
          <div className="ed-left">
            <div className="ed-sec">Room Settings</div>
            <div className="ed-sub">Room Dimensions</div>
            <div className="ed-hint">You can update dimensions at any time</div>

            <div className="ed-dims">
              <div className="ed-dim"><span>Width (m)</span>
                <input value={width} onChange={e=>setWidth(e.target.value)}/></div>
              <div className="ed-dim"><span>Length (m)</span>
                <input value={length} onChange={e=>setLength(e.target.value)}/></div>
              <div className="ed-dim"><span>Height (m)</span>
                <input value={height} onChange={e=>setHeight(e.target.value)}/></div>
            </div>
            <button className="ed-btn" onClick={handleCreateRoom}>CREATE / UPDATE ROOM</button>

            <hr className="ed-hr"/>
            <div className="ed-sec">Materials & Colours</div>
            <div className="ed-colors">
              <div className="ed-color-col">
                <span>Wall Colour</span>
                <div className="ed-color-row">
                  <div className="ed-swatch" style={{background:wallColor}}/>
                  <input type="color" value={wallColor} onChange={e=>setWallColor(e.target.value)}/>
                  <span>{wallColor.replace('#','').toUpperCase()}</span>
                </div>
              </div>
              <div className="ed-color-col">
                <span>Floor Colour</span>
                <div className="ed-color-row">
                  <div className="ed-swatch" style={{background:floorColor}}/>
                  <input type="color" value={floorColor} onChange={e=>setFloorColor(e.target.value)}/>
                  <span>{floorColor.replace('#','').toUpperCase()}</span>
                </div>
              </div>
            </div>

            <hr className="ed-hr"/>
            <div className="ed-sec">Add Furniture</div>
            <select className="ed-select" value={selFurniture}
              onChange={e=>setSelFurniture(e.target.value)}>
              {FURNITURE_LIST.map(f=>(
                <option key={f.id} value={f.id}>{f.emoji} {f.label}</option>
              ))}
            </select>
            <div className="ed-sub" style={{marginBottom:4}}>Furniture Colour</div>
            <div className="ed-fur-color">
              <div className="ed-swatch" style={{background:furColor}}/>
              <input type="color" value={furColor} onChange={e=>setFurColor(e.target.value)}/>
              <span>{furColor.replace('#','').toUpperCase()}</span>
            </div>
            <button className="ed-btn" onClick={handleAddFurniture}>ADD TO ROOM</button>

            <hr className="ed-hr"/>
            <div className="ed-sec">Save Design</div>
            <input className="ed-name-input" placeholder="Design name..."
              value={designName} onChange={e=>setDesignName(e.target.value)}/>
            <button className="ed-btn-save" onClick={handleSave}>SAVE DESIGN</button>
          </div>

          {/* ── CANVAS ── */}
          <div className="ed-canvas-area">
            {!roomCreated ? (
              <div className="ed-empty">
                <div className="ed-empty-icon">🏠</div>
                <p>Enter dimensions and click</p>
                <p><strong>CREATE / UPDATE ROOM</strong></p>
                <p style={{fontSize:12,marginTop:4,color:'#B7A996'}}>
                  Or pick a template from the navbar
                </p>
              </div>

            ) : view === '2D' ? (
              /* ── 2D VIEW ── */
              <>
                <div
                  ref={canvasRef}
                  className="ed-room-2d"
                  style={{
                    width:roomPxW, height:roomPxH,
                    background:floorColor+'44',
                    transform:`scale(${zoom})`,
                  }}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                  onClick={()=>setSelectedUid(null)}
                >
                  <div style={{
                    position:'absolute', inset:0,
                    border:`18px solid ${wallColor}bb`,
                    pointerEvents:'none',
                  }}/>
                  {placedItems.map(item=>(
                    <div
                      key={item.uid}
                      className={`ed-item${selectedUid===item.uid?' sel':''}`}
                      style={{
                        left:item.x, top:item.y,
                        width:item.w, height:item.h,
                        background:item.color+'cc',
                      }}
                      onMouseDown={e=>{e.stopPropagation();onItemMouseDown(e,item.uid)}}
                      onClick={e=>{e.stopPropagation();setSelectedUid(item.uid)}}
                    >
                      <span style={{fontSize:22,pointerEvents:'none'}}>{item.emoji}</span>
                      <span className="ed-item-lbl">{item.label}</span>
                    </div>
                  ))}
                </div>
                {placedItems.length > 0 && (
                  <div className="drag-hint">🖱️ Drag furniture to reposition</div>
                )}
              </>

            ) : (
              /* ── 3D CSS VIEW ── */
              <div
                className="ed-3d-outer"
                style={{width:'100%', height:'100%', transform:`scale(${zoom})`}}
              >
                <div
                  className="ed-3d-scene"
                  style={{
                    width: sceneW,
                    height: sceneH,
                    transform:`rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                  }}
                >
                  {/* FLOOR */}
                  <div className="ed-face" style={{
                    width: floorW,
                    height: floorD,
                    background: `linear-gradient(135deg, ${floorColor}ff, ${floorColor}cc)`,
                    transform: `rotateX(90deg) translateZ(${wallH/2}px)`,
                    left: (sceneW - floorW)/2,
                    top:  (sceneH - floorD)/2,
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.15)',
                    position:'absolute',
                  }}>
                    {/* Furniture on floor */}
                    {placedItems.map(item => {
                      const fx = (item.x / roomPxW) * (floorW - item.w*0.6)
                      const fy = (item.y / roomPxH) * (floorD - item.h*0.6)
                      return (
                        <div
                          key={item.uid}
                          className={`ed-3d-item${selectedUid===item.uid?' sel':''}`}
                          style={{
                            left: fx, top: fy,
                            width: item.w * 0.6,
                            height: item.h * 0.6,
                            background: item.color + 'ee',
                          }}
                          onClick={()=>setSelectedUid(
                            selectedUid===item.uid ? null : item.uid
                          )}
                        >
                          <span style={{pointerEvents:'none'}}>{item.emoji}</span>
                          <span className="ed-3d-item-lbl">{item.label}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* BACK WALL */}
                  <div className="ed-face" style={{
                    width: floorW,
                    height: wallH,
                    background: `linear-gradient(180deg, ${wallColor}ff 0%, ${wallColor}dd 100%)`,
                    transform: `translateZ(-${floorD/2}px) translateY(-${wallH/2 - sceneH/2}px)`,
                    left: (sceneW - floorW)/2,
                    top: 0,
                    borderTop: `3px solid ${wallColor}88`,
                    boxShadow: 'inset 0 0 60px rgba(0,0,0,0.08)',
                    position:'absolute',
                  }}/>

                  {/* LEFT WALL */}
                  <div className="ed-face" style={{
                    width: floorD,
                    height: wallH,
                    background: `linear-gradient(90deg, ${wallColor}cc 0%, ${wallColor}99 100%)`,
                    transform: `rotateY(90deg) translateZ(${floorW/2}px) translateY(-${wallH/2 - sceneH/2}px)`,
                    left: (sceneW - floorD)/2,
                    top: 0,
                    boxShadow: 'inset 0 0 60px rgba(0,0,0,0.12)',
                    position:'absolute',
                  }}/>
                </div>
              </div>
            )}

            {roomType && (
              <div className="room-badge">📐 {roomType}</div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="ed-right">
            <div>
              <div className="ed-r-title">Zoom</div>
              <div className="ed-zoom-row">
                <button className="ed-icon-btn"
                  onClick={()=>setZoom(z=>Math.min(z+0.15,2.5))}>+</button>
                <button className="ed-icon-btn"
                  onClick={()=>setZoom(z=>Math.max(z-0.15,0.3))}>−</button>
              </div>
            </div>

            <hr className="ed-r-hr"/>

            <div>
              <div className="ed-r-title">Rotation</div>
              <div className="ed-rot-grid">
                <button className="ed-icon-btn" onClick={()=>setRotX(r=>r-8)}>↑</button>
                <button className="ed-icon-btn" onClick={()=>setRotX(r=>r+8)}>↓</button>
                <button className="ed-icon-btn" onClick={()=>setRotY(r=>r-8)}>←</button>
                <button className="ed-icon-btn" onClick={()=>setRotY(r=>r+8)}>→</button>
              </div>
            </div>

            <hr className="ed-r-hr"/>

            <div>
              <div className="ed-r-title">View</div>
              <button className={`ed-view-btn${view==='3D'?' active':''}`}
                onClick={()=>setView('3D')}>3D View</button>
              <button className={`ed-view-btn${view==='2D'?' active':''}`}
                onClick={()=>setView('2D')}>2D View</button>
            </div>

            {selectedUid && (
              <>
                <hr className="ed-r-hr"/>
                <button className="ed-del-btn"
                  onClick={()=>{
                    setPlacedItems(p=>p.filter(i=>i.uid!==selectedUid))
                    setSelectedUid(null)
                  }}>
                  🗑 Remove
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  )
}