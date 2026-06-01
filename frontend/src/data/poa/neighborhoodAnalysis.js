import { POA_PLACES } from './index.js'
import { POA_NEIGHBORHOODS, resolveNeighborhood } from './neighborhoods.js'

const FEATURED_IDS = [
  'centro',
  'cidade-baixa',
  'floresta',
  'independencia',
  'farroupilha',
  'rio-branco',
  'bom-fim',
  'santana',
  'moinhos-de-vento',
  'bela-vista',
  'partenon',
]

function categoryKey(place) {
  return place.mapFilter || place.pinType || 'outros'
}

/**
 * catálogo analítico por bairro (lugares tab) — nomes, endereços e categorias.
 */
export function buildNeighborhoodCatalog(places = POA_PLACES) {
  const lugares = places.filter(p => p.tab === 'lugares')
  const byId = Object.fromEntries(
    POA_NEIGHBORHOODS.map(n => [n.id, { neighborhood: n, places: [], byCategory: {} }]),
  )
  const unassigned = []

  for (const place of lugares) {
    const nb = place.neighborhoodId
      ? { id: place.neighborhoodId, label: place.neighborhoodLabel }
      : resolveNeighborhood(place.address, place.lat, place.lng)
    if (!nb || !byId[nb.id]) {
      unassigned.push(place)
      continue
    }
    const bucket = byId[nb.id]
    bucket.places.push(place)
    const cat = categoryKey(place)
    if (!bucket.byCategory[cat]) bucket.byCategory[cat] = []
    bucket.byCategory[cat].push({
      id: place.id,
      name: place.name,
      address: place.address,
      subcategory: place.subcategory,
      mapFilter: place.mapFilter,
    })
  }

  return {
    featured: FEATURED_IDS.map(id => summarizeNeighborhood(byId[id])),
    all: POA_NEIGHBORHOODS.map(n => summarizeNeighborhood(byId[n.id])),
    unassignedCount: unassigned.length,
    unassignedSample: unassigned.slice(0, 8).map(p => ({ name: p.name, address: p.address })),
  }
}

function summarizeNeighborhood(bucket) {
  if (!bucket) return null
  const { neighborhood, places, byCategory } = bucket
  const categories = Object.entries(byCategory)
    .map(([id, items]) => ({ id, count: items.length, samples: items.slice(0, 3) }))
    .sort((a, b) => b.count - a.count)

  return {
    id: neighborhood.id,
    label: neighborhood.label,
    totalPlaces: places.length,
    categories,
    places: places.map(p => ({
      id: p.id,
      name: p.name,
      address: p.address,
      category: p.category,
      mapFilter: p.mapFilter,
    })),
  }
}

/** estatísticas dos quatro bairros prioritários (dev / painel futuro) */
export const POA_FEATURED_NEIGHBORHOOD_STATS = buildNeighborhoodCatalog()
