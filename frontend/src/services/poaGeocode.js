import { searchPlaces } from './geo.js'

const CACHE_KEY = 'tourio-poa-geocode-v1'
const OLD_CACHE_KEY = 'turio-poa-geocode-v1'

function loadCache() {
  try {
    if (!localStorage.getItem(CACHE_KEY)) {
      const legacy = localStorage.getItem(OLD_CACHE_KEY)
      if (legacy) {
        localStorage.setItem(CACHE_KEY, legacy)
        localStorage.removeItem(OLD_CACHE_KEY)
      }
    }
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch { /* quota */ }
}

/**
 * geocodifica lugares sem lat/lng (nominatim via searchPlaces).
 * retorna mapa id -> { lat, lng }
 */
export async function geocodePendingPlaces(places, { max = 12 } = {}) {
  const cache = loadCache()
  const pending = places.filter(p => p.geocodePending && p.address).slice(0, max)
  const out = { ...cache }

  for (const p of pending) {
    if (out[p.id]) continue
    try {
      const q = `${p.name}, ${p.address}`
      const results = await searchPlaces(q, -30.0346, -51.2177, { radiusDeg: 0.35, strict: false })
      if (results[0]?.lat) {
        out[p.id] = { lat: results[0].lat, lng: results[0].lon }
      }
    } catch { /* skip */ }
    await new Promise(r => setTimeout(r, 1100))
  }

  saveCache(out)
  return out
}

export function applyGeocodeCache(places, cache) {
  return places.map(p => {
    const c = cache[p.id]
    if (!c || p.lat != null) return p
    return { ...p, lat: c.lat, lng: c.lng, geocodePending: false }
  })
}
