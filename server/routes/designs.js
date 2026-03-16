const express = require('express')
const router  = express.Router()
const db      = require('../db')

router.get('/:userId', (req, res) => {
  const designs = db.prepare(
    'SELECT * FROM designs WHERE user_id = ? ORDER BY id DESC'
  ).all(req.params.userId)
  const parsed = designs.map(d => ({ ...d, items: d.items ? JSON.parse(d.items) : [] }))
  res.json(parsed)
})

router.post('/', (req, res) => {
  const { userId, code, name, width, length, height, wallColor, floorColor, items } = req.body
  if (!userId || !name)
    return res.status(400).json({ message: 'userId and name are required' })

  const result = db.prepare(`
    INSERT INTO designs (user_id, code, name, width, length, height, wall_color, floor_color, items)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, code, name, width, length, height, wallColor, floorColor, JSON.stringify(items || []))

  const design = db.prepare('SELECT * FROM designs WHERE id = ?').get(result.lastInsertRowid)
  res.json({ message: 'Design saved', design })
})

router.put('/:id', (req, res) => {
  const { name, width, length, height, wallColor, floorColor, items } = req.body
  db.prepare(`
    UPDATE designs SET name=?, width=?, length=?, height=?, wall_color=?, floor_color=?, items=?
    WHERE id=?
  `).run(name, width, length, height, wallColor, floorColor, JSON.stringify(items || []), req.params.id)
  res.json({ message: 'Design updated' })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM designs WHERE id = ?').run(req.params.id)
  res.json({ message: 'Design deleted' })
})

module.exports = router
