import { kmBetween, EXPLORE_RADIUS_KM } from '../../services/nearbyPlaces.js'

/**
 * sistema 2 — scoring heurístico (substitui ranking llm no mvp).
 * @param {object} place — lugar normalizado
 * @param {{ lat: number, lon: number }} origin
 * @param {{ interestIds?: string[], hour?: number }} ctx
 */
export function scorePlace(place, origin, ctx = {}) {
  let score = 0.5
  const dist = origin?.lat ? kmBetween(origin, { lat: place.lat, lon: place.lng }) : null
  if (dist != null && dist <= EXPLORE_RADIUS_KM) {
    score += 0.35 * (1 - dist / EXPLORE_RADIUS_KM)
  }
  if (place.isLocalBusiness) score += 0.12
  const interests = ctx.interestIds || []
  if (interests.length && place.mapFilter && interests.some(id => id.includes(place.mapFilter))) {
    score += 0.2
  }
  const hour = ctx.hour ?? new Date().getHours()
  if (place.mapFilter === 'cafes' && hour >= 7 && hour <= 11) score += 0.08
  if (place.mapFilter === 'gastronomia' && hour >= 18) score += 0.08
  return Math.min(1, score)
}

export function rankPlaces(places, origin, ctx = {}) {
  return [...places]
    .map(p => ({ place: p, score: scorePlace(p, origin, ctx) }))
    .sort((a, b) => b.score - a.score)
    .map(r => ({ ...r.place, recommendScore: r.score }))
}
