/**
 * trânsito simulado para porto alegre (mvp).
 * em produção: integrar google maps traffic, tomtom ou here.
 */

export const TRAFFIC_LEVELS = {
  free:     { color: '#34C759', label: 'Fluido',        weight: 2.5, opacity: 0.28 },
  moderate: { color: '#FFCC00', label: 'Moderado',      weight: 3,   opacity: 0.32 },
  heavy:    { color: '#FF9500', label: 'Intenso',       weight: 3.5, opacity: 0.36 },
  severe:   { color: '#FF3B30', label: 'Congestionado', weight: 4,   opacity: 0.4  },
}

/** vias principais de poa — coordenadas aproximadas */
const POA_ROADS = [
  {
    id: 'ipiranga',
    name: 'Av. Ipiranga',
    path: [[-30.022, -51.198], [-30.028, -51.208], [-30.034, -51.218], [-30.040, -51.228]],
  },
  {
    id: 'borge',
    name: 'Av. Borges de Medeiros',
    path: [[-30.025, -51.215], [-30.030, -51.220], [-30.035, -51.225], [-30.042, -51.232]],
  },
  {
    id: 'assis',
    name: 'Av. Assis Brasil',
    path: [[-30.018, -51.145], [-30.025, -51.165], [-30.032, -51.185], [-30.038, -51.205]],
  },
  {
    id: 'bonifacio',
    name: 'Av. José Bonifácio',
    path: [[-30.040, -51.195], [-30.038, -51.205], [-30.036, -51.215], [-30.034, -51.225]],
  },
  {
    id: 'cristo',
    name: 'Av. Cristóvão Colombo',
    path: [[-30.015, -51.175], [-30.022, -51.185], [-30.028, -51.195], [-30.034, -51.205]],
  },
  {
    id: 'protas',
    name: 'Av. Protásio Alves',
    path: [[-30.045, -51.185], [-30.040, -51.195], [-30.035, -51.205], [-30.030, -51.215]],
  },
  {
    id: 'joao',
    name: 'Av. João Pessoa',
    path: [[-30.048, -51.210], [-30.042, -51.218], [-30.036, -51.226], [-30.030, -51.234]],
  },
  {
    id: 'guaiba',
    name: 'Av. Edvaldo Pereira',
    path: [[-30.038, -51.235], [-30.036, -51.242], [-30.034, -51.248], [-30.032, -51.255]],
  },
]

/** nível base por via + horário */
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

export function getTrafficSegments(hour = new Date().getHours(), dayOfWeek = new Date().getDay()) {
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  const isRush = isWeekday && ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))
  const isNight = hour >= 22 || hour < 6

  return POA_ROADS.map(road => {
    let level = BASE[road.id] ?? 'moderate'
    if (isNight && level !== 'free') level = 'free'
    else if (isRush) level = RUSH_BOOST[level] ?? level
    if (hour >= 12 && hour <= 13 && road.id === 'bonifacio') level = 'moderate'

    const meta = TRAFFIC_LEVELS[level]
    return { ...road, level, color: meta.color, weight: meta.weight, opacity: meta.opacity, label: meta.label }
  })
}

export function getTrafficSummary(segments) {
  const severe = segments.filter(s => s.level === 'severe' || s.level === 'heavy').length
  if (severe >= 3) return { emoji: '🔴', text: 'Trânsito pesado na cidade' }
  if (severe >= 1) return { emoji: '🟠', text: 'Algumas vias congestionadas' }
  return { emoji: '🟢', text: 'Trânsito em geral fluido' }
}
