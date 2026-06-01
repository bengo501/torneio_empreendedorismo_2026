import { filterPoaLugares } from '../data/poa/index.js'

/** raio padrão da aba explorar · lugares */
export const EXPLORE_RADIUS_KM = 3

export function kmBetween(a, b) {
  if (a?.lat == null || b?.lat == null) return Infinity
  const lonB = b.lon ?? b.lng
  const lonA = a.lon ?? a.lng
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLon = (lonB - lonA) * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function withDistanceKm(origin, place) {
  const dist = kmBetween(origin, { lat: place.lat, lon: place.lng ?? place.lon })
  return { ...place, distanceKm: dist }
}

export function formatDistanceKm(km) {
  if (!Number.isFinite(km)) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1).replace('.', ',')} km`
}

/**
 * lugares da aba explorar (tab lugares) dentro do raio, ordenados por distância.
 * @param {object[]} places — POA_PLACES ou cópia geocodada
 * @param {{ lat: number, lon: number } | null} origin
 * @param {number} radiusKm
 * @param {string} categoryFilter — id de LUGARES_FILTERS ('todos' = todos)
 */
export function filterNearbyExplorePlaces(
  places,
  origin,
  radiusKm = EXPLORE_RADIUS_KM,
  categoryFilter = 'todos',
) {
  const base = filterPoaLugares(categoryFilter, places)
  if (!origin?.lat) return base.map(p => ({ ...p, distanceKm: null }))

  return base
    .map(p => withDistanceKm(origin, p))
    .filter(p => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

export function countNearbyExplorePlaces(places, origin, radiusKm = EXPLORE_RADIUS_KM) {
  return filterNearbyExplorePlaces(places, origin, radiusKm, 'todos').length
}
