import { Router } from 'express'
import { SYMPLA_BASE, SYMPLA_TOKEN } from '../config.js'

const router = Router()

/** repassa chamadas cruas à api sympla (debug / compatibilidade) */
router.all('/*', async (req, res) => {
  if (!SYMPLA_TOKEN) {
    res.status(503).json({ error: 'sympla token não configurado' })
    return
  }
  const path = req.path || '/'
  const qs = new URLSearchParams(req.query).toString()
  const url = `${SYMPLA_BASE}${path}${qs ? `?${qs}` : ''}`
  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: {
        Accept: 'application/json',
        s_token: SYMPLA_TOKEN,
      },
    })
    const body = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    res.send(body)
  } catch {
    res.status(502).json({ error: 'falha ao contactar sympla' })
  }
})

export default router
