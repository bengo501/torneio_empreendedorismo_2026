const ENDPOINT = 'https://overpass-api.de/api/interpreter'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

function cacheKey(kind, bbox) {
  const k = bbox.map(n => n.toFixed(3)).join(',')
  return `zippi_osm_${kind}_${k}`
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch { /* quota */ }
}

const FALLBACK_ENDPOINT = 'https://overpass.kumi.systems/api/interpreter'

async function runQuery(query) {
  for (const endpoint of [ENDPOINT, FALLBACK_ENDPOINT]) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      })
      if (!res.ok) throw new Error(`overpass ${res.status}`)
      return res.json()
    } catch {
      /* tenta próximo servidor */
    }
  }
  throw new Error('overpass unavailable')
}

function wayToCoords(element) {
  const geom = element.geometry
  if (!geom?.length) return null
  return geom.map(p => [p.lat, p.lon])
}

/** bbox: { south, west, north, east } */
export async function fetchHighwayWays(bbox) {
  const { south, west, north, east } = bbox
  const key = cacheKey('hw', [south, west, north, east])
  const cached = readCache(key)
  if (cached) return cached

  const query = `
[out:json][timeout:25];
(
  way["highway"~"primary|secondary|tertiary|trunk|motorway"](${south},${west},${north},${east});
);
out geom;
`
  const data = await runQuery(query)
  const ways = (data.elements || [])
    .filter(el => el.type === 'way' && el.geometry?.length >= 2)
    .map(el => ({
      id: el.id,
      name: el.tags?.name ?? null,
      highway: el.tags?.highway ?? null,
      path: wayToCoords(el),
    }))

  writeCache(key, ways)
  return ways
}

export async function fetchNatureFeatures(bbox) {
  const { south, west, north, east } = bbox
  const key = cacheKey('nat', [south, west, north, east])
  const cached = readCache(key)
  if (cached) return cached

  const query = `
[out:json][timeout:25];
(
  way["leisure"="park"](${south},${west},${north},${east});
  way["leisure"="garden"](${south},${west},${north},${east});
  relation["leisure"="park"](${south},${west},${north},${east});
  way["natural"="water"](${south},${west},${north},${east});
  way["waterway"="riverbank"](${south},${west},${north},${east});
);
out geom;
`
  const data = await runQuery(query)
  const features = []

  for (const el of data.elements || []) {
    const coords = wayToCoords(el)
    if (!coords?.length) continue
    const tags = el.tags || {}
    let kind = 'other'
    if (tags.leisure === 'park' || tags.leisure === 'garden') kind = 'park'
    else if (tags.natural === 'water' || tags.waterway === 'riverbank') kind = 'water'

    features.push({
      id: `${el.type}-${el.id}`,
      kind,
      name: tags.name ?? null,
      path: coords,
    })
  }

  writeCache(key, features)
  return features
}

export function bboxFromLeaflet(bounds) {
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  return { south: sw.lat, west: sw.lng, north: ne.lat, east: ne.lng }
}

/**
 * Busca paradas de ônibus próximas (Overpass).
 * @param {number} lat  - latitude central
 * @param {number} lon  - longitude central
 * @param {number} [radiusMeters=1200] - raio de busca
 * @returns {Promise<Array<{label,lat,lon,distanceKm}>>}
 */
export async function fetchBusStops(lat, lon, radiusMeters = 1200) {
  const cKey = `zippi_osm_bus_${parseFloat(lat).toFixed(3)}_${parseFloat(lon).toFixed(3)}_${radiusMeters}`
  const cached = readCache(cKey)
  if (cached) return cached

  const query = `
[out:json][timeout:10];
(
  node["highway"="bus_stop"](around:${radiusMeters},${lat},${lon});
  node["public_transport"="stop_position"]["bus"="yes"](around:${radiusMeters},${lat},${lon});
);
out tags;`

  try {
    const data = await runQuery(query)
    const results = (data.elements || [])
      .map(el => ({
        label: el.tags?.name || el.tags?.ref || 'Parada de ônibus',
        lat: el.lat,
        lon: el.lon,
        distanceKm: haversine(lat, lon, el.lat, el.lon),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 20)
    writeCache(cKey, results)
    return results
  } catch {
    return []
  }
}

/** haversine distance in km between two lat/lon points */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2)
}

/**
 * Busca amenities/POIs próximos ao usuário via Overpass "around".
 * Muito mais preciso que Nominatim para "farmácia perto de mim".
 *
 * @param {Array<{key:string,value:string}>} tags  - ex: [{key:'amenity',value:'pharmacy'}]
 * @param {number} lat                             - latitude do usuário
 * @param {number} lon                             - longitude do usuário
 * @param {number} [radiusMeters=3000]             - raio de busca em metros
 * @returns {Promise<Array<{label,fullLabel,lat,lon,distanceKm}>>}
 */
export async function searchNearbyAmenities(tags, lat, lon, radiusMeters = 3000) {
  const tagStr = tags.map(t => `${t.key}=${t.value}`).join('|')
  const cKey = `zippi_osm_poi_${parseFloat(lat).toFixed(3)}_${parseFloat(lon).toFixed(3)}_${tagStr}_${radiusMeters}`
  const cached = readCache(cKey)
  if (cached) return cached

  const filters = tags
    .map(t => `  node["${t.key}"="${t.value}"](around:${radiusMeters},${lat},${lon});\n  way["${t.key}"="${t.value}"](around:${radiusMeters},${lat},${lon});`)
    .join('\n')

  const query = `[out:json][timeout:15];\n(\n${filters}\n);\nout center tags;`

  try {
    const data = await runQuery(query)
    const results = (data.elements || [])
      .map(el => {
        const elLat = el.lat ?? el.center?.lat
        const elLon = el.lon ?? el.center?.lon
        if (!elLat || !elLon) return null
        const tags_ = el.tags || {}
        const name = tags_.name || tags_.brand || tags_.operator
        if (!name) return null
        const addr = [
          tags_['addr:street'],
          tags_['addr:housenumber'],
          tags_['addr:suburb'] || tags_['addr:neighbourhood'],
        ].filter(Boolean).join(', ')
        const distanceKm = haversine(lat, lon, elLat, elLon)
        const label = addr ? `${name}, ${addr}` : name
        return {
          label,
          fullLabel: `${name} — ${addr || 'próximo'}`,
          lat: elLat,
          lon: elLon,
          distanceKm,
        }
      })
      .filter(Boolean)
      .filter(p => p.distanceKm <= radiusMeters / 1000 + 0.5)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 8)

    writeCache(cKey, results)
    return results
  } catch {
    return []
  }
}
