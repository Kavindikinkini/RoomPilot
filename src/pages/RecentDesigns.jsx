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
    const mine = all.filter(d => d.userId === user.id)
    setDesigns(mine)
  }, [])

  const handleDelete = (id) => {
    const all = JSON.parse(localStorage.getItem('designs') || '[]')
    const updated = all.filter(d => d.id !== id)
    localStorage.setItem('designs', JSON.stringify(updated))
    setDesigns(prev => prev.filter(d => d.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const handleView = (design) => {
    setSelected(design)
  }

  const handleEdit = () => {
    if (selected) navigate('/editor', { state: { design: selected } })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Jost:wght@300;400;500&display=swap');

        .rd-page {
          min-height: 100vh;
          background: #F5F2EC;
          font-family: 'Jost', sans-serif;
        }

        .rd-body {
          padding: 36px 48px;
        }

        .rd-table-wrap {
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #E8E3DC;
          margin-bottom: 24px;
        }

        .rd-table {
          width: 100%;
          border-collapse: collapse;
        }

        .rd-th {
          text-align: left;
          padding: 14px 24px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #4E4034;
          background: #F5F2EC;
          border-bottom: 1px solid #E8E3DC;
        }

        .rd-tr {
          border-bottom: 1px solid #F0EBE4;
          transition: background 0.15s;
          cursor: pointer;
        }
        .rd-tr:last-child { border-bottom: none; }
        .rd-tr:hover { background: #FAF8F5; }
        .rd-tr.selected { background: #F0EBE4; }

        .rd-td {
          padding: 14px 24px;
          font-size: 13px;
          color: #4E4034;
        }

        .rd-td-code {
          color: #8C7864;
          font-size: 12.5px;
        }

        .rd-actions {
          display: flex;
          gap: 8px;
        }

        .rd-btn-view {
          padding: 6px 18px;
          border-radius: 50px;
          border: 1px solid #D9D2C6;
          background: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          color: #4E4034;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rd-btn-view:hover {
          background: #F5F2EC;
          border-color: #8C7864;
        }

        .rd-btn-delete {
          padding: 6px 18px;
          border-radius: 50px;
          border: 1px solid #D9D2C6;
          background: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          color: #c0392b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rd-btn-delete:hover {
          background: #fff0ee;
          border-color: #c0392b;
        }

        /* Preview Panel */
        .rd-preview {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #E8E3DC;
          padding: 20px 24px;
          min-height: 260px;
        }

        .rd-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .rd-preview-title {
          font-family: 'Jost', sans-serif;
          font-size: 13.5px;
          color: #4E4034;
          font-weight: 400;
        }

        .rd-btn-edit {
          padding: 7px 22px;
          border-radius: 50px;
          border: 1px solid #D9D2C6;
          background: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          color: #4E4034;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rd-btn-edit:hover {
          background: #4E4034;
          color: #fff;
          border-color: #4E4034;
        }

        .rd-preview-canvas {
          width: 100%;
          height: 200px;
          background: #F5F2EC;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #B7A996;
          font-size: 13px;
        }

        .rd-empty {
          text-align: center;
          padding: 60px 0;
          color: #B7A996;
          font-size: 13.5px;
        }

        .rd-empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }
      `}</style>

      <div className="rd-page">
        <Navbar />

        <div className="rd-body">

          {/* Table */}
          <div className="rd-table-wrap">
            {designs.length === 0 ? (
              <div className="rd-empty">
                <div className="rd-empty-icon">🗂️</div>
                <p>No saved designs yet.</p>
                <p style={{ marginTop: 6, fontSize: 12 }}>Go to File → Create a new design to get started.</p>
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
                  {designs.map(d => (
                    <tr
                      key={d.id}
                      className={`rd-tr${selected?.id === d.id ? ' selected' : ''}`}
                      onClick={() => handleView(d)}
                    >
                      <td className="rd-td rd-td-code">{d.code}</td>
                      <td className="rd-td">{d.name}</td>
                      <td className="rd-td">{d.date}</td>
                      <td className="rd-td">
                        <div className="rd-actions">
                          <button className="rd-btn-view" onClick={e => { e.stopPropagation(); handleView(d) }}>View</button>
                          <button className="rd-btn-delete" onClick={e => { e.stopPropagation(); handleDelete(d.id) }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Preview Panel */}
          <div className="rd-preview">
            <div className="rd-preview-header">
              <span className="rd-preview-title">
                {selected ? `Design : ${selected.code}` : 'Select a design to preview'}
              </span>
              {selected && (
                <button className="rd-btn-edit" onClick={handleEdit}>Edit</button>
              )}
            </div>
            <div className="rd-preview-canvas">
              {selected
                ? `${selected.name} — ${selected.width}m × ${selected.length}m × ${selected.height}m`
                : 'Preview will appear here'}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
