/**
 * cliente de eventos — chama o backend zippi (/api/events)
 * a chave sympla fica só no servidor (SYMPLA_TOKEN)
 */

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchSymplaEvents(cityName, stateCode = 'RS') {
  try {
    const qs = new URLSearchParams({ city: cityName, state: stateCode })
    const res = await fetch(`${API_BASE}/api/events?${qs}`)
    if (!res.ok) return { events: [], source: 'fallback' }
    return res.json()
  } catch {
    return { events: [], source: 'fallback' }
  }
}

export async function hasSymplaToken() {
  try {
    const res = await fetch(`${API_BASE}/api/health`)
    if (!res.ok) return false
    const data = await res.json()
    return Boolean(data.sympla)
  } catch {
    return false
  }
}
