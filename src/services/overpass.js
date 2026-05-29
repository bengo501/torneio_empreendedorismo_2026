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

async function runQuery(query) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })
  if (!res.ok) throw new Error(`overpass ${res.status}`)
  return res.json()
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
