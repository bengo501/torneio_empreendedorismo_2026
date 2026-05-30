import express from 'express'
import cors from 'cors'
import { PORT } from './config.js'
import eventsRouter from './routes/events.js'
import symplaProxy from './routes/symplaProxy.js'

const app = express()

app.use(cors({ origin: true }))
app.use(express.json())

app.use('/api', eventsRouter)
app.use('/api/sympla', symplaProxy)

app.get('/', (_req, res) => {
  res.json({ service: 'zippi-api', version: '1.0' })
})

app.listen(PORT, () => {
  console.log(`zippi backend http://localhost:${PORT}`)
})
