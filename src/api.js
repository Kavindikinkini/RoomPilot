const BASE = 'http://localhost:5000/api'

export const registerUser = async (username, email, password) => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
  return res.json()
}

export const loginUser = async (username, password) => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  return res.json()
}

export const getDesigns = async (userId) => {
  const res = await fetch(`${BASE}/designs/${userId}`)
  return res.json()
}

export const saveDesign = async (design) => {
  const res = await fetch(`${BASE}/designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(design)
  })
  return res.json()
}

export const deleteDesign = async (id) => {
  const res = await fetch(`${BASE}/designs/${id}`, { method: 'DELETE' })
  return res.json()
}

export const updateProfile = async (id, data) => {
  const res = await fetch(`${BASE}/profile/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}
