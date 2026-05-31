/**
 * trânsito — níveis mock + geometria real via overpass (openstreetmap)
 */

import { getPoaTrafficMockSegments } from './poa/trafficMock.js'
import { loadPoaTrafficSegments } from '../services/poaMapLayers.js'

export const TRAFFIC_LEVELS = {
  free:     { color: '#43A047', label: 'fluido',        weight: 2.5, opacity: 0.28 },
  moderate: { color: '#FBC02D', label: 'moderado',      weight: 3,   opacity: 0.32 },
  heavy:    { color: '#FF9500', label: 'intenso',       weight: 3.5, opacity: 0.36 },
  severe:   { color: '#E53935', label: 'congestionado', weight: 4,   opacity: 0.4  },
}

export function getTrafficSegments(_hour, _dayOfWeek) {
  return getPoaTrafficMockSegments('todos')
}

export async function loadTrafficGeometry() {
  return loadPoaTrafficSegments()
}

export function getTrafficSummary(segments) {
  const severe = segments.filter(s => s.trafficLevel === 'pesado' || s.level === 'severe' || s.level === 'heavy').length
  if (severe >= 3) return { text: 'trânsito pesado na cidade (simulado)' }
  if (severe >= 1) return { text: 'algumas vias congestionadas (simulado)' }
  return { text: 'trânsito em geral fluido (simulado)' }
}

export function isCriticalTraffic(level) {
  return level === 'heavy' || level === 'severe'
}

export function isAlertTraffic(level, segment) {
  if (segment?.trafficLevel === 'pesado') return true
  return level === 'severe' || level === 'heavy'
}
