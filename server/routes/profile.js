const express = require('express')
const router  = express.Router()
const db      = require('../db')

router.get('/:id', (req, res) => {
  const user = db.prepare(
    'SELECT id, username, email, role FROM users WHERE id = ?'
  ).get(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

router.put('/:id', (req, res) => {
  const { username, password } = req.body
  const exists = db.prepare(
    'SELECT id FROM users WHERE username = ? AND id != ?'
  ).get(username, req.params.id)
  if (exists) return res.status(400).json({ message: 'Username already taken' })

  db.prepare(
    'UPDATE users SET username = ?, password = ? WHERE id = ?'
  ).run(username, password, req.params.id)

  const updated = db.prepare(
    'SELECT id, username, email, role FROM users WHERE id = ?'
  ).get(req.params.id)
  res.json({ message: 'Profile updated', user: updated })
})

module.exports = router
