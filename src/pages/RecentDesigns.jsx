import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

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
    const updated = designs.filter(d => d.id !== id)
    const all = JSON.parse(localStorage.getItem('designs') || '[]')
    localStorage.setItem('designs', JSON.stringify(all.filter(d => d.id !== id)))
    setDesigns(updated)
    if (selected?.id === id) setSelected(null)
  }

  const handleEdit = (design) => {
    // Pass the design to editor via state so it can be edited
    navigate('/editor', { state: { editDesign: design } })
  }

  const DesignPreview = ({ design }) => {
    const scale = 0.42
    const W = Math.round(parseFloat(design.width)  * 90 * scale) || 130
    const H = Math.round(parseFloat(design.length) * 90 * scale) || 150
    return (
      <div style={{
        width:W, height:H, position:'relative',
        border:'2px solid #4E4034',
        background:design.floorColor+'44',
        flexShrink:0, borderRadius:2,
      }}>
        <div style={{
          position:'absolute', inset:0,
          border:`7px solid ${design.wallColor}bb`,
          pointerEvents:'none',
        }}/>
        {(design.items||[]).map((item,i)=>(
          <div key={i} style={{
            position:'absolute',
            left:(item.x/(parseFloat(design.width)*90))*W,
            top: (item.y/(parseFloat(design.length)*90))*H,
            width:item.w*scale, height:item.h*scale,
            background:item.color+'cc',
            borderRadius:3,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:9,
          }}>
            {({sofa:'🛋️',chair:'🪑',dining:'🍽️',sidetable:'🪵',bed:'🛏️',wardrobe:'🚪',desk:'🖥️',bookshelf:'📚',tv:'📺',lamp:'💡'})[item.id]||''}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500&display=swap');
        .rd-page { min-height:100vh; background:#F5F2EC; font-family:'Jost',sans-serif; }
        .rd-body { padding:36px 48px; }
        .rd-table-wrap { background:#fff; border-radius:14px; overflow:hidden; border:1px solid #E8E3DC; margin-bottom:24px; }
        .rd-table { width:100%; border-collapse:collapse; }
        .rd-th { text-align:left; padding:14px 24px; font-size:13px; font-weight:500; color:#4E4034; background:#F5F2EC; border-bottom:1px solid #E8E3DC; }
        .rd-tr { border-bottom:1px solid #F0EBE4; transition:background .15s; cursor:pointer; }
        .rd-tr:last-child { border-bottom:none; }
        .rd-tr:hover { background:#FAF8F5; }
        .rd-tr.sel { background:#F0EBE4; }
        .rd-td { padding:14px 24px; font-size:13px; color:#4E4034; }
        .rd-td-code { color:#8C7864; font-size:12.5px; }
        .rd-actions { display:flex; gap:8px; }
        .rd-btn { padding:6px 16px; border-radius:50px; border:1px solid #D9D2C6; background:#fff; font-family:'Jost',sans-serif; font-size:12px; cursor:pointer; transition:all .2s; }
        .rd-btn-view { color:#4E4034; }
        .rd-btn-view:hover { background:#F5F2EC; border-color:#8C7864; }
        .rd-btn-delete { color:#c0392b; }
        .rd-btn-delete:hover { background:#fff0ee; border-color:#c0392b; }
        .rd-preview { background:#fff; border-radius:14px; border:1px solid #E8E3DC; padding:20px 24px; }
        .rd-preview-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .rd-preview-title { font-size:13.5px; color:#4E4034; }
        .rd-btn-edit { padding:8px 24px; border-radius:50px; border:none; background:#4E4034; color:#fff; font-family:'Jost',sans-serif; font-size:12px; cursor:pointer; transition:background .2s; }
        .rd-btn-edit:hover { background:#3a2e26; }
        .rd-preview-content { display:flex; align-items:flex-start; gap:28px; padding:16px; background:#F5F2EC; border-radius:10px; min-height:200px; }
        .rd-info { font-size:12.5px; color:#6b5c50; line-height:2; }
        .rd-info strong { color:#4E4034; font-size:13px; display:block; line-height:1.4; margin-top:8px; }
        .rd-info strong:first-child { margin-top:0; }
        .rd-empty { text-align:center; padding:60px 0; color:#B7A996; font-size:13.5px; }
        .rd-empty-icon { font-size:40px; margin-bottom:12px; }
        .rd-no-sel { display:flex; align-items:center; justify-content:center; min-height:200px; color:#B7A996; font-size:13px; background:#F5F2EC; border-radius:10px; }
      `}</style>

      <div className="rd-page">
        <Navbar/>
        <div className="rd-body">

          <div className="rd-table-wrap">
            {designs.length === 0 ? (
              <div className="rd-empty">
                <div className="rd-empty-icon">🗂️</div>
                <p>No saved designs yet.</p>
                <p style={{marginTop:6,fontSize:12}}>Go to File → Create a room and save a design.</p>
              </div>
            ) : (
              <table className="rd-table">
                <thead>
                  <tr>
                    <th className="rd-th">Design Code</th>
                    <th className="rd-th">Design Name</th>
                    <th className="rd-th">Date</th>
                    <th className="rd-th"></th>
                  </tr>
                </thead>
                <tbody>
                  {designs.map(d=>(
                    <tr key={d.id}
                      className={`rd-tr${selected?.id===d.id?' sel':''}`}
                      onClick={()=>setSelected(d)}
                    >
                      <td className="rd-td rd-td-code">{d.code}</td>
                      <td className="rd-td">{d.name}</td>
                      <td className="rd-td">{d.date}</td>
                      <td className="rd-td">
                        <div className="rd-actions">
                          <button className="rd-btn rd-btn-view"
                            onClick={e=>{e.stopPropagation();setSelected(d)}}>View</button>
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

          {/* Preview */}
          <div className="rd-preview">
            <div className="rd-preview-header">
              <span className="rd-preview-title">
                {selected ? `Design : ${selected.code}` : 'Select a design to preview'}
              </span>
              {selected && (
                <button className="rd-btn-edit" onClick={()=>handleEdit(selected)}>
                  ✏️ Edit Design
                </button>
              )}
            </div>

            {selected ? (
              <div className="rd-preview-content">
                <DesignPreview design={selected}/>
                <div className="rd-info">
                  <strong>Name</strong>{selected.name}
                  <strong>Code</strong>{selected.code}
                  <strong>Date</strong>{selected.date}
                  <strong>Dimensions</strong>{selected.width}m × {selected.length}m × {selected.height}m
                  <strong>Furniture items</strong>{(selected.items||[]).length} item{(selected.items||[]).length!==1?'s':''}
                  {(selected.items||[]).length > 0 && (
                    <><strong>Items</strong>{[...new Set((selected.items||[]).map(i=>i.label))].join(', ')}</>
                  )}
                </div>
              </div>
            ) : (
              <div className="rd-no-sel">
                Click a row or View button to preview your design here
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}