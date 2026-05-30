const KEY = 'zippi-reports'

export const REPORT_TYPES = [
  { id: 'danger',   emoji: '⚠️', label: 'Ponto perigoso',   color: '#FF4444' },
  { id: 'traffic',  emoji: '🚦', label: 'Trânsito parado',  color: '#FF8800' },
  { id: 'pothole',  emoji: '🕳️', label: 'Buraco na via',    color: '#AA6600' },
  { id: 'flooding', emoji: '🌊', label: 'Alagamento',       color: '#0088FF' },
  { id: 'closure',  emoji: '🚧', label: 'Via bloqueada',    color: '#FFCC00' },
  { id: 'camera',   emoji: '📷', label: 'Câmera de segur.', color: '#888888' },
  { id: 'accident', emoji: '🚨', label: 'Acidente',         color: '#FF2222' },
  { id: 'police',   emoji: '👮', label: 'Blitz policial',   color: '#4444FF' },
]

export function getReports() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch { return [] }
}

export function addReport({ type, lat, lon, description = '' }) {
  const reports = getReports()
  const info = REPORT_TYPES.find(r => r.id === type) || REPORT_TYPES[0]
  const report = {
    id: `r_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    type,
    emoji: info.emoji,
    label: info.label,
    color: info.color,
    lat, lon,
    description,
    timestamp: Date.now(),
    upvotes: 1,
  }
  reports.unshift(report)
  // Keep only last 50 reports, expire after 2h
  const fresh = reports
    .filter(r => Date.now() - r.timestamp < 2 * 60 * 60 * 1000)
    .slice(0, 50)
  localStorage.setItem(KEY, JSON.stringify(fresh))
  return report
}

export function upvoteReport(id) {
  const reports = getReports()
  const r = reports.find(r => r.id === id)
  if (r) { r.upvotes = (r.upvotes || 1) + 1 }
  localStorage.setItem(KEY, JSON.stringify(reports))
}

export function deleteReport(id) {
  const reports = getReports().filter(r => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(reports))
}

/** Format time ago in Portuguese */
export function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1)  return 'agora'
  if (mins < 60) return `${mins} min atrás`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h atrás`
}
