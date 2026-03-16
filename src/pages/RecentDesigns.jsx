import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const EMOJI = {
  sofa:'🛋️', chair:'🪑', dining:'🍽️', sidetable:'🪵',
  bed:'🛏️', wardrobe:'🚪', desk:'🖥️', bookshelf:'📚',
  tv:'📺', lamp:'💡', plant:'🪴', rug:'🟫',
}

export default function RecentDesigns() {
  const navigate = useNavigate()
  const [designs, setDesigns] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (!user) { navigate('/signin'); return }
    const all = JSON.parse(localStorage.getItem('designs') || '[]')
    setDesigns(all.filter(d => d.userId === user.id))
  }, [])

  const handleDelete = (id) => {
    if (!window.confirm('Delete this design?')) return
    const all = JSON.parse(localStorage.getItem('designs') || '[]')
    localStorage.setItem('designs', JSON.stringify(all.filter(d => d.id !== id)))
    const updated = designs.filter(d => d.id !== id)
    setDesigns(updated)
    if (selected?.id === id) setSelected(null)
  }

  // ← KEY FIX: include ts (timestamp) so each click is a unique navigation state
  const handleEdit = (design) => {
    navigate('/editor', { state: { editDesign: design, ts: Date.now() } })
  }

  // ── Mini floor-plan preview ───────────────────────────────────────────────
  const DesignPreview = ({ design }) => {
    const roomW = parseFloat(design.width) || 5
    const roomD = parseFloat(design.depth || design.length) || 6
    const maxW = 200, maxH = 170
    const scale = Math.min(maxW / roomW, maxH / roomD)
    const W = roomW * scale, H = roomD * scale
    const items = design.items || []
    const needsConversion = items.length > 0 && (items[0].w > 10 || (items[0].h > 10 && !items[0].d))
    const PX_PER_M = 90

    return (
      <div style={{
        width: W, height: H, position: 'relative', flexShrink: 0,
        border: `2.5px solid ${design.wallColor || '#C8B89A'}`,
        background: (design.floorColor || '#C4A882') + '33',
        borderRadius: 4, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: `8px solid ${design.wallColor || '#EDE9E3'}CC`,
          pointerEvents: 'none', borderRadius: 2,
        }}/>
        {Array.from({ length: Math.ceil(roomW / 0.3) }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: i * (0.3 * scale), top: 0,
            width: 1, height: '100%',
            background: (design.floorColor || '#C4A882') + '44',
          }}/>
        ))}
        {items.map((item, idx) => {
          let ix, iy, iw, ih
          if (needsConversion) {
            ix = (item.x / PX_PER_M) * scale
            iy = (item.y / PX_PER_M) * scale
            iw = (item.w / PX_PER_M) * scale
            ih = (item.h / PX_PER_M) * scale
          } else {
            ix = item.x * scale
            iy = item.y * scale
            iw = item.w * scale
            ih = (item.d || item.h) * scale
          }
          return (
            <div key={idx} style={{
              position: 'absolute',
              left: ix, top: iy, width: Math.max(iw, 8), height: Math.max(ih, 8),
              background: (item.color || '#A08060') + 'BB',
              borderRadius: 3, border: '1px solid rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: Math.min(Math.max(iw, 8), Math.max(ih, 8)) * 0.55,
              transform: `rotate(${item.rotY || 0}deg)`,
              transformOrigin: 'center center', overflow: 'hidden',
            }}>
              {EMOJI[item.id] || ''}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500&display=swap');
        :root { --bg:#F7F4EE; --panel:#EFEBE4; --border:#DDD5CB; --text:#3A2E24; --accent:#6B4F3A; --muted:#9B8878; --white:#FEFCFA; }
        * { box-sizing:border-box; margin:0; padding:0 }
        .rd-page { min-height:100vh; background:var(--bg); font-family:'Jost',sans-serif; color:var(--text) }
        .rd-body { padding:32px 44px }
        .rd-heading { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:600; color:var(--accent); margin-bottom:24px; display:flex; align-items:center; gap:12px }
        .rd-heading::after { content:''; flex:1; height:1px; background:var(--border) }
        .rd-table-wrap { background:var(--white); border-radius:14px; overflow:hidden; border:1px solid var(--border); margin-bottom:24px; box-shadow:0 2px 16px rgba(58,46,36,0.06) }
        .rd-table { width:100%; border-collapse:collapse }
        .rd-th { text-align:left; padding:13px 22px; font-size:10px; font-weight:600; color:var(--muted); background:var(--bg); border-bottom:1px solid var(--border); letter-spacing:1.2px; text-transform:uppercase }
        .rd-tr { border-bottom:1px solid #F0EBE4; transition:background .15s; cursor:pointer }
        .rd-tr:last-child { border-bottom:none }
        .rd-tr:hover { background:#FAF8F5 }
        .rd-tr.sel { background:#F2EDE6 }
        .rd-td { padding:13px 22px; font-size:13px; color:var(--text); vertical-align:middle }
        .rd-td-code { color:var(--muted); font-size:11.5px; font-weight:500; font-family:'Courier New',monospace; letter-spacing:0.5px }
        .rd-actions { display:flex; gap:7px }
        .rd-btn { padding:5px 14px; border-radius:50px; border:1px solid var(--border); background:var(--white); font-family:'Jost',sans-serif; font-size:11.5px; cursor:pointer; transition:all .2s; font-weight:500 }
        .rd-btn-view { color:var(--accent) }
        .rd-btn-view:hover { background:var(--panel); border-color:var(--muted) }
        .rd-btn-edit { color:#2C6B4F; border-color:#A8CEB8 }
        .rd-btn-edit:hover { background:#F0FFF8; border-color:#2C6B4F }
        .rd-btn-delete { color:#c0392b }
        .rd-btn-delete:hover { background:#fff0ee; border-color:#c0392b }
        .rd-preview { background:var(--white); border-radius:14px; border:1px solid var(--border); overflow:hidden; box-shadow:0 2px 16px rgba(58,46,36,0.06) }
        .rd-preview-header { display:flex; align-items:center; justify-content:space-between; padding:16px 24px; border-bottom:1px solid var(--border); background:var(--bg) }
        .rd-preview-title { font-family:'Cormorant Garamond',serif; font-size:16px; font-weight:600; color:var(--accent) }
        .rd-btn-open { padding:9px 22px; border-radius:50px; border:none; background:var(--accent); color:#FFF8F0; font-family:'Jost',sans-serif; font-size:11.5px; font-weight:500; cursor:pointer; transition:background .2s; letter-spacing:0.5px }
        .rd-btn-open:hover { background:#5A3E2C }
        .rd-preview-content { display:flex; align-items:flex-start; gap:32px; padding:24px; background:var(--panel); min-height:220px }
        .rd-preview-map { flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:8px }
        .rd-map-label { font-size:9px; letter-spacing:1px; color:var(--muted); text-transform:uppercase; font-weight:500 }
        .rd-info { flex:1; display:flex; flex-direction:column; gap:10px }
        .rd-info-row { display:flex; align-items:baseline; gap:8px; padding-bottom:8px; border-bottom:1px solid var(--border) }
        .rd-info-row:last-child { border-bottom:none; padding-bottom:0 }
        .rd-info-key { font-size:9px; letter-spacing:1px; color:var(--muted); text-transform:uppercase; font-weight:600; min-width:80px; flex-shrink:0 }
        .rd-info-val { font-size:13px; color:var(--text) }
        .rd-colors-row { display:flex; gap:8px; align-items:center }
        .rd-color-chip { display:flex; align-items:center; gap:5px; padding:3px 9px; border-radius:20px; background:var(--white); border:1px solid var(--border); font-size:11px; color:var(--muted) }
        .rd-color-dot { display:inline-block; width:12px; height:12px; border-radius:50%; border:1px solid rgba(0,0,0,0.1); flex-shrink:0 }
        .rd-fur-tags { display:flex; flex-wrap:wrap; gap:5px; margin-top:2px }
        .rd-fur-tag { padding:2px 9px; border-radius:20px; background:var(--white); border:1px solid var(--border); font-size:11px; color:var(--text) }
        .rd-empty { text-align:center; padding:60px 0; color:var(--muted) }
        .rd-empty-icon { font-size:42px; margin-bottom:12px }
        .rd-no-sel { display:flex; align-items:center; justify-content:center; min-height:220px; color:var(--muted); font-family:'Cormorant Garamond',serif; font-size:16px; font-style:italic }
      `}</style>

      <div className="rd-page">
        <Navbar/>
        <div className="rd-body">
          <div className="rd-heading">Saved Designs</div>

          <div className="rd-table-wrap">
            {designs.length === 0 ? (
              <div className="rd-empty">
                <div className="rd-empty-icon">🗂️</div>
                <p style={{fontSize:13.5}}>No saved designs yet.</p>
                <p style={{marginTop:6,fontSize:12}}>Go to File → Create a room and save your design.</p>
              </div>
            ) : (
              <table className="rd-table">
                <thead>
                  <tr>
                    <th className="rd-th">Code</th>
                    <th className="rd-th">Name</th>
                    <th className="rd-th">Dimensions</th>
                    <th className="rd-th">Colours</th>
                    <th className="rd-th">Date</th>
                    <th className="rd-th">Items</th>
                    <th className="rd-th"></th>
                  </tr>
                </thead>
                <tbody>
                  {designs.map(d => (
                    <tr key={d.id}
                      className={`rd-tr${selected?.id===d.id?' sel':''}`}
                      onClick={() => setSelected(d)}>
                      <td className="rd-td rd-td-code">{d.code}</td>
                      <td className="rd-td" style={{fontWeight:500}}>{d.name}</td>
                      <td className="rd-td" style={{color:'var(--muted)',fontSize:12}}>
                        {d.width}m × {d.depth||d.length}m × {d.height}m
                      </td>
                      <td className="rd-td">
                        <div style={{display:'flex',gap:5}}>
                          <span title="Wall" style={{display:'inline-block',width:14,height:14,borderRadius:3,background:d.wallColor,border:'1px solid rgba(0,0,0,0.12)'}}/>
                          <span title="Floor" style={{display:'inline-block',width:14,height:14,borderRadius:3,background:d.floorColor,border:'1px solid rgba(0,0,0,0.12)'}}/>
                        </div>
                      </td>
                      <td className="rd-td" style={{color:'var(--muted)',fontSize:12}}>{d.date}</td>
                      <td className="rd-td" style={{color:'var(--muted)',fontSize:12}}>
                        {(d.items||[]).length} item{(d.items||[]).length!==1?'s':''}
                      </td>
                      <td className="rd-td">
                        <div className="rd-actions">
                          <button className="rd-btn rd-btn-view"
                            onClick={e=>{e.stopPropagation();setSelected(d)}}>Preview</button>
                          <button className="rd-btn rd-btn-edit"
                            onClick={e=>{e.stopPropagation();handleEdit(d)}}>✏️ Edit</button>
                          <button className="rd-btn rd-btn-delete"
                            onClick={e=>{e.stopPropagation();handleDelete(d.id)}}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="rd-preview">
            <div className="rd-preview-header">
              <span className="rd-preview-title">
                {selected ? `${selected.name} · ${selected.code}` : 'Select a design to preview'}
              </span>
              {selected && (
                <button className="rd-btn-open" onClick={() => handleEdit(selected)}>
                  ✏️ Open in Editor
                </button>
              )}
            </div>

            {selected ? (
              <div className="rd-preview-content">
                <div className="rd-preview-map">
                  <div className="rd-map-label">Floor Plan</div>
                  <DesignPreview design={selected}/>
                </div>
                <div className="rd-info">
                  <div className="rd-info-row">
                    <span className="rd-info-key">Name</span>
                    <span className="rd-info-val" style={{fontWeight:500}}>{selected.name}</span>
                  </div>
                  <div className="rd-info-row">
                    <span className="rd-info-key">Code</span>
                    <span className="rd-info-val" style={{fontFamily:'Courier New',fontSize:12}}>{selected.code}</span>
                  </div>
                  <div className="rd-info-row">
                    <span className="rd-info-key">Date</span>
                    <span className="rd-info-val">{selected.date}</span>
                  </div>
                  <div className="rd-info-row">
                    <span className="rd-info-key">Room Size</span>
                    <span className="rd-info-val">
                      {selected.width}m wide × {selected.depth||selected.length}m deep × {selected.height}m high
                    </span>
                  </div>
                  <div className="rd-info-row">
                    <span className="rd-info-key">Colours</span>
                    <div className="rd-colors-row">
                      <div className="rd-color-chip">
                        <span className="rd-color-dot" style={{background:selected.wallColor}}/>
                        Wall
                      </div>
                      <div className="rd-color-chip">
                        <span className="rd-color-dot" style={{background:selected.floorColor}}/>
                        Floor
                      </div>
                    </div>
                  </div>
                  <div className="rd-info-row">
                    <span className="rd-info-key">Furniture</span>
                    <div>
                      <div style={{fontSize:12,color:'var(--muted)',marginBottom:6}}>
                        {(selected.items||[]).length} item{(selected.items||[]).length!==1?'s':''}
                      </div>
                      <div className="rd-fur-tags">
                        {[...new Map((selected.items||[]).map(i=>[i.label,i])).values()].map((it,i)=>(
                          <span key={i} className="rd-fur-tag">
                            {EMOJI[it.id]||''} {it.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rd-no-sel">Click any row to preview your saved design</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}