import { searchPlaces } from './geo.js'
import { searchNearbyAmenities } from './overpass.js'

const CITY_COORDS = {
  'porto alegre': { lat: -30.0346, lon: -51.2177, state: 'RS' },
  'bento gonçalves': { lat: -29.1696, lon: -51.5193, state: 'RS' },
}

/** distância em km entre dois pontos */
export function kmBetween(a, b) {
  if (!a?.lat || !b?.lat) return Infinity
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLon = (b.lon - a.lon) * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function normalizeCityKey(city) {
  return (city || 'porto alegre').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

function anchorForCity(cityName, lat, lon) {
  const key = normalizeCityKey(cityName)
  const preset = CITY_COORDS[key]
  if (preset) return { lat: preset.lat, lon: preset.lon, state: preset.state }
  if (lat != null && lon != null) return { lat, lon, state: 'RS' }
  return CITY_COORDS['porto alegre']
}

/** remove duplicatas por coordenada aproximada */
function dedupePlaces(places) {
  const seen = new Set()
  return places.filter(p => {
    const k = `${p.lat?.toFixed(4)}_${p.lon?.toFixed(4)}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** mantém só lugares dentro do raio máximo do usuário */
export function filterByProximity(places, lat, lon, maxKm) {
  return places
    .map(p => ({ ...p, distanceKm: kmBetween({ lat, lon }, p) }))
    .filter(p => p.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

/**
 * Busca essenciais com múltiplas estratégias e filtro geográfico rígido.
 * nunca retorna lugares a mais de maxKm do usuário.
 */
export async function searchEssentials(service, { lat, lon, city, state }) {
  const anchor = anchorForCity(city, lat, lon)
  const searchLat = lat ?? anchor.lat
  const searchLon = lon ?? anchor.lon
  const cityName = city || 'Porto Alegre'
  const stateCode = state || anchor.state || 'RS'
  const maxKm = 12

  let results = []

  if (service.osmTags?.length) {
    for (const radius of [2000, 5000, 8000]) {
      const batch = await searchNearbyAmenities(service.osmTags, searchLat, searchLon, radius)
      results = dedupePlaces([...results, ...batch])
      const nearby = filterByProximity(results, searchLat, searchLon, maxKm)
      if (nearby.length >= 4) return nearby.slice(0, 8)
    }
    results = filterByProximity(results, searchLat, searchLon, maxKm)
    if (results.length >= 3) return results.slice(0, 8)
  }

  const nominatimQueries = [
    `${service.query}, ${cityName}, ${stateCode}, Brasil`,
    `${service.query} ${cityName}`,
  ]

  for (const q of nominatimQueries) {
    const places = await searchPlaces(q, searchLat, searchLon, {
      strict: true,
      radiusDeg: 0.12,
    })
    const filtered = filterByProximity(places, searchLat, searchLon, maxKm)
    results = dedupePlaces([...results, ...filtered])
    if (results.length >= 4) break
  }

  return results.slice(0, 8)
}
