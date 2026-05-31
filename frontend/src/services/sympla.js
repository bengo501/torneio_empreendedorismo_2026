/**
 * cliente de eventos — chama o backend zippi (/api/events)
 * a chave sympla fica só no servidor (SYMPLA_TOKEN)
 */

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchSymplaEvents(cityName, stateCode = 'RS', range = 'all') {
  try {
    const qs = new URLSearchParams({ city: cityName, state: stateCode, range })
    const res = await fetch(`${API_BASE}/api/events?${qs}`)
    if (!res.ok) return { events: [], source: 'fallback', range }
    return res.json()
  } catch {
    return { events: [], source: 'fallback', range }
  }
}

export function fetchEventsToday(cityName, stateCode = 'RS') {
  return fetchSymplaEvents(cityName, stateCode, 'today')
}

export function fetchEventsUpcoming(cityName, stateCode = 'RS') {
  return fetchSymplaEvents(cityName, stateCode, 'upcoming')
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
