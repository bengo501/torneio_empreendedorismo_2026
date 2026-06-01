const KEY = 'turio-saved-places-v2'
const LEGACY_KEY = 'turio-saved-places'

function normalizeEntry(raw) {
  if (!raw?.id) return null
  return {
    id: raw.id,
    name: raw.name || 'lugar',
    address: raw.address || '',
    preview: raw.preview || '',
    lat: raw.lat ?? null,
    lng: raw.lng ?? raw.lon ?? null,
    mapFilter: raw.mapFilter || raw.category || 'todos',
    pinType: raw.pinType || null,
    savedAt: raw.savedAt || Date.now(),
  }
}

function readRaw() {
  try {
    const v2 = localStorage.getItem(KEY)
    if (v2) {
      const list = JSON.parse(v2)
      return Array.isArray(list) ? list.map(normalizeEntry).filter(Boolean) : []
    }
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const ids = JSON.parse(legacy)
      if (Array.isArray(ids)) {
        localStorage.removeItem(LEGACY_KEY)
        return []
      }
    }
  } catch { /* ignore */ }
  return []
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 80)))
}

export function getSavedPlaces() {
  return readRaw()
}

export function isPlaceSaved(id) {
  return readRaw().some(p => p.id === id)
}

export function savePlace(place) {
  const entry = normalizeEntry({ ...place, savedAt: Date.now() })
  if (!entry) return readRaw()
  const list = readRaw().filter(p => p.id !== entry.id)
  list.unshift(entry)
  write(list)
  return list
}

export function removeSavedPlace(id) {
  const list = readRaw().filter(p => p.id !== id)
  write(list)
  return list
}

export function toggleSavedPlace(place) {
  if (isPlaceSaved(place.id)) return removeSavedPlace(place.id)
  return savePlace(place)
}
