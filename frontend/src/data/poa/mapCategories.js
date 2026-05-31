/** filtros horizontais por aba — copiloto urbano poa */

export const LUGARES_FILTERS = [
  { id: 'todos', label: 'Todos', emoji: '🗺️' },
  { id: 'cultura', label: 'Cultura', emoji: '🎭' },
  { id: 'parques', label: 'Parques', emoji: '🌿' },
  { id: 'cafes', label: 'Cafés', emoji: '☕' },
  { id: 'gastronomia', label: 'Gastronomia', emoji: '🍽️' },
  { id: 'compras', label: 'Compras', emoji: '🛒' },
  { id: 'saude', label: 'Saúde', emoji: '🏥' },
  { id: 'educacao', label: 'Educação', emoji: '🎓' },
  { id: 'trilhas', label: 'Trilhas', emoji: '🥾' },
  { id: 'mirantes', label: 'Mirantes', emoji: '🌅' },
  { id: 'economia', label: 'Economia Local', emoji: '🤝' },
  { id: 'feiras', label: 'Feiras', emoji: '🎪' },
]

export const EVENTOS_FILTERS = [
  { id: 'todos', label: 'Todos', emoji: '📅' },
  { id: 'musica', label: 'Música', emoji: '🎵' },
  { id: 'cultura', label: 'Cultura', emoji: '🎭' },
  { id: 'feira', label: 'Feiras', emoji: '🎪' },
  { id: 'gastronomia', label: 'Gastronomia', emoji: '🍽️' },
  { id: 'esporte', label: 'Esportes', emoji: '🏃' },
  { id: 'gratuito', label: 'Gratuitos', emoji: '🆓' },
  { id: 'hoje', label: 'Hoje', emoji: '⚡' },
  { id: 'aovivo', label: 'Ao Vivo', emoji: '🎤' },
  { id: 'infantil', label: 'Infantil', emoji: '👶' },
  { id: 'noturno', label: 'Noturno', emoji: '🌙' },
]

export const ESSENCIAIS_FILTERS = [
  { id: 'farmacias', label: 'Farmácias', emoji: '💊' },
  { id: 'mercados', label: 'Mercados', emoji: '🛒' },
  { id: 'restaurantes', label: 'Restaurantes', emoji: '🍽️' },
  { id: 'saude', label: 'Saúde', emoji: '🏥' },
  { id: 'fastfood', label: 'Fast Food', emoji: '🍔' },
]

export const PIN_TYPES = {
  farmacia: { emoji: '💊', color: '#3B82F6' },
  mercado: { emoji: '🛒', color: '#2563EB' },
  saude: { emoji: '🏥', color: '#14B8A6' },
  fastfood: { emoji: '🍔', color: '#F97316' },
  cultura: { emoji: '🎭', color: '#A855F7' },
  parque: { emoji: '🌿', color: '#34C759' },
  cafe: { emoji: '☕', color: '#D97706' },
  gastronomia: { emoji: '🍽️', color: '#EA580C' },
  compras: { emoji: '🛍️', color: '#EC4899' },
  educacao: { emoji: '🎓', color: '#6366F1' },
  trilha: { emoji: '🥾', color: '#059669' },
  mirante: { emoji: '🌅', color: '#0EA5E9' },
  economia: { emoji: '🤝', color: '#84CC16' },
  feira: { emoji: '🎪', color: '#F59E0B' },
  evento: { emoji: '📅', color: '#8B5CF6' },
  default: { emoji: '📍', color: '#6366F1' },
}

export function pinMeta(pinType) {
  return PIN_TYPES[pinType] ?? PIN_TYPES.default
}
