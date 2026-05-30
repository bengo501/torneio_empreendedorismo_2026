import { Router } from 'express'
import { fetchSymplaEvents, isSymplaConfigured } from '../services/symplaService.js'

const router = Router()

router.get('/events', async (req, res) => {
  try {
    const city = req.query.city || 'Porto Alegre'
    const state = req.query.state || 'RS'
    const result = await fetchSymplaEvents(city, state)
    res.json(result)
  } catch {
    res.status(500).json({ events: [], source: 'fallback', symplaConfigured: false })
  }
})

router.get('/health', (_req, res) => {
  res.json({ ok: true, sympla: isSymplaConfigured() })
})

export default router
