import { fetchSymplaEvents } from '../src/services/symplaService.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  const city = req.query?.city || 'Porto Alegre'
  const state = req.query?.state || 'RS'
  const range = req.query?.range || 'all'
  try {
    const result = await fetchSymplaEvents(city, state, range)
    res.status(200).json(result)
  } catch {
    res.status(500).json({ events: [], source: 'fallback', symplaConfigured: false })
  }
}
