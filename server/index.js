const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth',    require('./routes/auth'))
app.use('/api/designs', require('./routes/designs'))
app.use('/api/profile', require('./routes/profile'))

app.get('/', (req, res) => {
  res.json({ message: 'RoomPilot Backend Running' })
})

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000')
})
