const KEY = 'tourio-place-contributions'
const OLD_KEY = 'turio-place-contributions'

export const PLACE_CATEGORIES = [
  { id: 'cultura', label: 'cultura' },
  { id: 'parques', label: 'parques' },
  { id: 'cafes', label: 'cafés' },
  { id: 'gastronomia', label: 'gastronomia' },
  { id: 'compras', label: 'compras' },
  { id: 'educacao', label: 'educação' },
  { id: 'feiras', label: 'feiras' },
  { id: 'economia', label: 'economia local' },
  { id: 'mirantes', label: 'mirantes' },
  { id: 'trilhas', label: 'trilhas' },
]

export function getPlaceContributions() {
  try {
    if (!localStorage.getItem(KEY)) {
      const legacy = localStorage.getItem(OLD_KEY)
      if (legacy) {
        localStorage.setItem(KEY, legacy)
        localStorage.removeItem(OLD_KEY)
      }
    }
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * @param {{ name: string, category: string, address?: string, lat?: number, lon?: number, note?: string }} payload
 */
export function addPlaceContribution(payload) {
  const list = getPlaceContributions()
  const row = {
    id: `pc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'suggest_place',
    status: 'pending',
    createdAt: Date.now(),
    upvotes: 0,
    ...payload,
  }
  list.unshift(row)
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)))
  return row
}
