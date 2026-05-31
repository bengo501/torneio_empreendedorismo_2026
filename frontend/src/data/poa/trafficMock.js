import { PORTO_ALEGRE_TRAFFIC_RAW, TRAFFIC_MOCK_LEGEND } from './portoAlegreTrafficData.js'

const LEVEL_STYLE = {
  leve: { level: 'free', color: '#43A047', weight: 3.5, opacity: 0.48, label: 'trânsito leve' },
  medio: { level: 'moderate', color: '#FBC02D', weight: 4, opacity: 0.52, label: 'trânsito médio' },
  pesado: { level: 'severe', color: '#E53935', weight: 5, opacity: 0.58, label: 'trânsito pesado' },
}

export const TRAFFIC_FILTERS = [
  { id: 'todos', label: 'todos' },
  { id: 'leve', label: 'leve' },
  { id: 'medio', label: 'médio' },
  { id: 'pesado', label: 'pesado' },
]

export function getPoaTrafficMockSegments(filterId = 'todos') {
  return PORTO_ALEGRE_TRAFFIC_RAW
    .filter(item => filterId === 'todos' || item.trafficLevel === filterId)
    .map(item => {
      const style = LEVEL_STYLE[item.trafficLevel] ?? LEVEL_STYLE.medio
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        path: item.coordinates.map(c => [c.lat, c.lng]),
        level: style.level,
        trafficLevel: item.trafficLevel,
        color: item.color || style.color,
        weight: style.weight,
        opacity: style.opacity,
        label: style.label,
        speedLabel: item.speedLabel,
        estimatedSpeed: item.estimatedSpeed,
        area: item.area,
        from: item.from,
        to: item.to,
        description: item.description,
        tags: item.tags ?? [],
        mock: true,
      }
    })
}

export { TRAFFIC_MOCK_LEGEND }
