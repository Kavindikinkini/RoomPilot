const express = require('express')
const router  = express.Router()
const db      = require('../db')

router.post('/register', (req, res) => {
  const { username, email, password, role } = req.body
  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields are required' })

  const exists = db.prepare(
    'SELECT id FROM users WHERE username = ? OR email = ?'
  ).get(username, email)

  if (exists)
    return res.status(400).json({ message: 'Username or email already exists' })

  const result = db.prepare(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
  ).run(username, email, password, role || 'user')

  const user = db.prepare(
    'SELECT id, username, email, role FROM users WHERE id = ?'
  ).get(result.lastInsertRowid)

  res.json({ message: 'Registered successfully', user })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ message: 'All fields are required' })

  const user = db.prepare(
    'SELECT id, username, email, role FROM users WHERE username = ? AND password = ?'
  ).get(username, password)

  if (!user)
    return res.status(401).json({ message: 'Invalid username or password' })

  res.json({ message: 'Login successful', user })
})

module.exports = router
