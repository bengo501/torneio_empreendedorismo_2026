/**
 * trânsito simulado com geometria real via openstreetmap (overpass).
 * níveis de congestionamento são simulados (mvp); geometria das vias é real.
 */

import { fetchHighwayWays } from '../services/overpass.js'

export const TRAFFIC_LEVELS = {
  free:     { color: '#34C759', label: 'Fluido',        weight: 2.5, opacity: 0.28 },
  moderate: { color: '#FFCC00', label: 'Moderado',      weight: 3,   opacity: 0.32 },
  heavy:    { color: '#FF9500', label: 'Intenso',       weight: 3.5, opacity: 0.36 },
  severe:   { color: '#FF3B30', label: 'Congestionado', weight: 4,   opacity: 0.4  },
}

/** metadados das vias principais de poa (nível simulado) */
export const POA_ROAD_META = [
  { id: 'ipiranga',  name: 'Ipiranga',           aliases: ['avenida ipiranga', 'av ipiranga', 'av. ipiranga'] },
  { id: 'borge',     name: 'Borges de Medeiros', aliases: ['borges de medeiros', 'av borges de medeiros'] },
  { id: 'assis',     name: 'Assis Brasil',       aliases: ['assis brasil', 'avenida assis brasil'] },
  { id: 'bonifacio', name: 'José Bonifácio',     aliases: ['jose bonifacio', 'josé bonifácio', 'av jose bonifacio'] },
  { id: 'cristo',    name: 'Cristóvão Colombo',  aliases: ['cristovao colombo', 'cristóvão colombo'] },
  { id: 'protas',    name: 'Protásio Alves',     aliases: ['protásio alves', 'protasio alves'] },
  { id: 'joao',      name: 'João Pessoa',        aliases: ['joao pessoa', 'joão pessoa'] },
  { id: 'guaiba',    name: 'Edvaldo Pereira',    aliases: ['edvaldo pereira', 'orla do guaiba'] },
]

const BASE = {
  ipiranga:  'moderate',
  borge:     'heavy',
  assis:     'moderate',
  bonifacio: 'free',
  cristo:    'moderate',
  protas:    'heavy',
  joao:      'severe',
  guaiba:    'moderate',
}

const RUSH_BOOST = { free: 'moderate', moderate: 'heavy', heavy: 'severe', severe: 'severe' }

/** fallback: segmentos com poucos pontos até o overpass responder */
const POA_ROADS_FALLBACK = [
  { id: 'ipiranga',  name: 'Av. Ipiranga',           path: [[-30.022, -51.198], [-30.028, -51.208], [-30.034, -51.218], [-30.040, -51.228]] },
  { id: 'borge',     name: 'Av. Borges de Medeiros', path: [[-30.025, -51.215], [-30.030, -51.220], [-30.035, -51.225], [-30.042, -51.232]] },
  { id: 'assis',     name: 'Av. Assis Brasil',       path: [[-30.018, -51.145], [-30.025, -51.165], [-30.032, -51.185], [-30.038, -51.205]] },
  { id: 'bonifacio', name: 'Av. José Bonifácio',     path: [[-30.040, -51.195], [-30.038, -51.205], [-30.036, -51.215], [-30.034, -51.225]] },
  { id: 'cristo',    name: 'Av. Cristóvão Colombo',  path: [[-30.015, -51.175], [-30.022, -51.185], [-30.028, -51.195], [-30.034, -51.205]] },
  { id: 'protas',    name: 'Av. Protásio Alves',      path: [[-30.045, -51.185], [-30.040, -51.195], [-30.035, -51.205], [-30.030, -51.215]] },
  { id: 'joao',      name: 'Av. João Pessoa',         path: [[-30.048, -51.210], [-30.042, -51.218], [-30.036, -51.226], [-30.030, -51.234]] },
  { id: 'guaiba',    name: 'Av. Edvaldo Pereira',     path: [[-30.038, -51.235], [-30.036, -51.242], [-30.034, -51.248], [-30.032, -51.255]] },
]

function normName(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bav\.?\s*/g, 'avenida ')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchRoadMeta(osmName) {
  const n = normName(osmName)
  if (!n) return null
  for (const meta of POA_ROAD_META) {
    const names = [meta.name, ...(meta.aliases || [])].map(normName)
    if (names.some(nm => n.includes(nm) || nm.includes(n))) return meta
  }
  return null
}

function resolveLevel(roadId, hour, dayOfWeek) {
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  const isRush = isWeekday && ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))
  const isNight = hour >= 22 || hour < 6

  let level = BASE[roadId] ?? 'moderate'
  if (isNight && level !== 'free') level = 'free'
  else if (isRush) level = RUSH_BOOST[level] ?? level
  if (hour >= 12 && hour <= 13 && roadId === 'bonifacio') level = 'moderate'
  return level
}

function segmentFromPath(roadId, name, path, hour, dayOfWeek) {
  const level = resolveLevel(roadId, hour, dayOfWeek)
  const meta = TRAFFIC_LEVELS[level]
  return {
    id: roadId,
    name,
    path,
    level,
    color: meta.color,
    weight: meta.weight,
    opacity: meta.opacity,
    label: meta.label,
  }
}

export function getTrafficSegments(hour = new Date().getHours(), dayOfWeek = new Date().getDay()) {
  return POA_ROADS_FALLBACK.map(road => segmentFromPath(road.id, road.name, road.path, hour, dayOfWeek))
}

/** geometria real do overpass + níveis simulados por via conhecida */
export async function loadTrafficGeometry(bbox, hour = new Date().getHours(), dayOfWeek = new Date().getDay()) {
  try {
    const ways = await fetchHighwayWays(bbox)
    const matched = new Map()
    const extras = []

    for (const way of ways) {
      const meta = matchRoadMeta(way.name)
      if (meta && !matched.has(meta.id)) {
        matched.set(meta.id, segmentFromPath(meta.id, way.name || meta.name, way.path, hour, dayOfWeek))
      } else if (!meta && way.path?.length >= 3) {
        const level = 'moderate'
        const m = TRAFFIC_LEVELS[level]
        extras.push({
          id: `osm-${way.id}`,
          name: way.name || 'Via',
          path: way.path,
          level,
          color: m.color,
          weight: 2,
          opacity: 0.18,
          label: m.label,
        })
      }
    }

    const segments = [...matched.values()]
    if (segments.length) {
      return [...segments, ...extras.slice(0, 12)]
    }
  } catch { /* fallback */ }

  return getTrafficSegments(hour, dayOfWeek)
}

export function getTrafficSummary(segments) {
  const severe = segments.filter(s => s.level === 'severe' || s.level === 'heavy').length
  if (severe >= 3) return { emoji: '🔴', text: 'Trânsito pesado na cidade' }
  if (severe >= 1) return { emoji: '🟠', text: 'Algumas vias congestionadas' }
  return { emoji: '🟢', text: 'Trânsito em geral fluido' }
}

export function isCriticalTraffic(level) {
  return level === 'heavy' || level === 'severe'
}

/** alerta no topo: apenas congestionamento severo */
export function isAlertTraffic(level) {
  return level === 'severe'
}
