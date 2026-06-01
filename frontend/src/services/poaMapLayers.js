/**
 * camadas de mapa poa — geometria real via overpass (openstreetmap)
 * trânsito: níveis mock + polylines osm
 * natureza: polígonos osm de parques, praças e água
 */
import { PORTO_ALEGRE_TRAFFIC_RAW } from '../data/poa/portoAlegreTrafficData.js'
import { getPoaTrafficMockSegments } from '../data/poa/trafficMock.js'
import { mergeNatureWithMock } from '../data/poa/mockNature.js'
import {
  POA_BBOX,
  mergeWayPaths,
  nameMatchesWay,
  roadSearchTermsFromMock,
  slicePathBetweenAnchors,
  parseNatureElements,
} from './osmGeometry.js'

const ENDPOINT = 'https://overpass.kumi.systems/api/interpreter'
const FALLBACK = 'https://overpass-api.de/api/interpreter'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000
const TRAFFIC_CACHE_KEY = 'tourio_poa_traffic_osm_v5'
const NATURE_CACHE_KEY = 'tourio_poa_nature_osm_v3'

const OSM_UA = 'TourioApp/1.0 (porto alegre urban copilot; contact: dev@tourio.app)'

async function runOverpass(query, timeoutMs = 45000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    for (const url of [ENDPOINT, FALLBACK]) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          signal: ctrl.signal,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': OSM_UA,
          },
          body: `data=${encodeURIComponent(query)}`,
        })
        if (!res.ok) throw new Error(`overpass ${res.status}`)
        const text = await res.text()
        if (text.trimStart().startsWith('<')) throw new Error('overpass html response')
        return JSON.parse(text)
      } catch { /* próximo servidor */ }
    }
    throw new Error('overpass unavailable')
  } finally {
    clearTimeout(timer)
  }
}

const CACHE_LEGACY = {
  [TRAFFIC_CACHE_KEY]: 'turio_poa_traffic_osm_v5',
  [NATURE_CACHE_KEY]: 'turio_poa_nature_osm_v3',
}

function readCache(key) {
  try {
    if (typeof localStorage === 'undefined') return null
    const legacyKey = CACHE_LEGACY[key]
    if (legacyKey && !localStorage.getItem(key) && localStorage.getItem(legacyKey)) {
      localStorage.setItem(key, localStorage.getItem(legacyKey))
      localStorage.removeItem(legacyKey)
    }
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function writeCache(key, data) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch { /* quota */ }
}

function bboxFromCoords(coords, pad = 0.014) {
  const lats = coords.map(c => c.lat)
  const lngs = coords.map(c => c.lng)
  return {
    south: Math.min(...lats) - pad,
    west: Math.min(...lngs) - pad,
    north: Math.max(...lats) + pad,
    east: Math.max(...lngs) + pad,
  }
}

function coreRoadName(name) {
  return name
    .replace(/^av\.?\s*/i, '')
    .replace(/^avenida\s*/i, '')
    .replace(/^rua\s*/i, '')
    .split('/')[0]
    .trim()
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildTrafficOverpassQuery(items) {
  const lines = items.map(item => {
    const { south, west, north, east } = bboxFromCoords(item.coordinates)
    const core = escapeRegex(coreRoadName(item.name))
    const plain = escapeRegex(coreRoadName(item.name).normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    const pattern = core === plain ? core : `${core}|${plain}`
    return `  way["highway"]["name"~"${pattern}",i](${south},${west},${north},${east});`
  })
  return `[out:json][timeout:50];\n(\n${lines.join('\n')}\n);\nout geom;`
}

async function fetchAllTrafficWays() {
  const half = Math.ceil(PORTO_ALEGRE_TRAFFIC_RAW.length / 2)
  const batches = [
    PORTO_ALEGRE_TRAFFIC_RAW.slice(0, half),
    PORTO_ALEGRE_TRAFFIC_RAW.slice(half),
  ]
  const results = await Promise.all(
    batches.map(batch => runOverpass(buildTrafficOverpassQuery(batch)).catch(() => ({ elements: [] }))),
  )
  return results.flatMap(r => (r.elements || []).filter(el => el.type === 'way' && el.geometry?.length >= 2))
}

function mockPathFromCoords(mockItem) {
  if (!mockItem?.coordinates?.length) return null
  return mockItem.coordinates.map(c => [c.lat, c.lng])
}

function enrichLeveWithOsm(seg, allWays, mockItem) {
  const terms = roadSearchTermsFromMock(mockItem)
  const matched = allWays.filter(w => nameMatchesWay(w.tags?.name, terms))
  if (!matched.length) return null

  const merged = mergeWayPaths(matched)
  if (merged.length < 4) return null

  const anchors = mockItem.coordinates.map(c => [c.lat, c.lng])
  const i0 = merged.reduce((best, _, i) => {
    const d = haversineM(merged[i], anchors[0])
    return d < best.d ? { i, d } : best
  }, { i: 0, d: Infinity }).i
  const i1 = merged.reduce((best, _, i) => {
    const d = haversineM(merged[i], anchors[anchors.length - 1])
    return d < best.d ? { i, d } : best
  }, { i: merged.length - 1, d: Infinity }).i

  const path = i0 <= i1 ? merged.slice(i0, i1 + 1) : merged.slice(i1, i0 + 1).reverse()
  return path.length >= 4 ? path : null
}

function haversineM(a, b) {
  const R = 6371000
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLon = (b[1] - a[1]) * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** garante vias leves alinhadas (cache antigo podia ter geometria errada) */
function finalizeLeveSegments(segments) {
  return segments.map(seg => {
    if (seg.trafficLevel !== 'leve') return seg
    const mockItem = PORTO_ALEGRE_TRAFFIC_RAW.find(r => r.id === seg.id)
    const mockPath = mockPathFromCoords(mockItem)
    if (seg.geometrySource === 'osm-leve' && seg.path?.length >= 4) return seg
    if (mockPath?.length >= 2) {
      return { ...seg, path: mockPath, geometrySource: 'mock' }
    }
    return seg
  })
}

function enrichSegmentWithOsm(seg, allWays) {
  const mockItem = PORTO_ALEGRE_TRAFFIC_RAW.find(r => r.id === seg.id)
  if (!mockItem) return seg

  if (seg.trafficLevel === 'leve') {
    const osmPath = enrichLeveWithOsm(seg, allWays, mockItem)
    if (osmPath) {
      return { ...seg, path: osmPath, geometrySource: 'osm-leve' }
    }
    const mockPath = mockPathFromCoords(mockItem)
    if (mockPath?.length >= 2) {
      return { ...seg, path: mockPath, geometrySource: 'mock' }
    }
    return seg
  }

  const terms = roadSearchTermsFromMock(mockItem)
  const matched = allWays.filter(w => nameMatchesWay(w.tags?.name, terms))
  if (!matched.length) return seg

  const merged = mergeWayPaths(matched)
  if (merged.length < 2) return seg

  const anchors = mockItem.coordinates.map(c => [c.lat, c.lng])
  const path = slicePathBetweenAnchors(merged, anchors[0], anchors[anchors.length - 1])
  if (path.length >= 2) {
    return { ...seg, path, geometrySource: 'osm' }
  }
  return seg
}

async function fetchPoaNatureFromOsm() {
  const cached = readCache(NATURE_CACHE_KEY)
  if (cached) return cached

  const { south, west, north, east } = POA_BBOX
  const query = `
[out:json][timeout:90];
(
  way["natural"="water"](${south},${west},${north},${east});
  relation["natural"="water"](${south},${west},${north},${east});
  way["water"~"river|lake|pond|reservoir|basin"](${south},${west},${north},${east});
  relation["type"="multipolygon"]["water"](${south},${west},${north},${east});
  way["leisure"="park"](${south},${west},${north},${east});
  relation["leisure"="park"](${south},${west},${north},${east});
  way["leisure"="garden"](${south},${west},${north},${east});
  way["leisure"="nature_reserve"](${south},${west},${north},${east});
  relation["leisure"="nature_reserve"](${south},${west},${north},${east});
  way["place"="square"](${south},${west},${north},${east});
  way["landuse"="recreation_ground"](${south},${west},${north},${east});
  way["landuse"="grass"]["name"](${south},${west},${north},${east});
);
out geom;
`
  const data = await runOverpass(query)
  const features = parseNatureElements(data.elements).map(f => ({
    id: f.id,
    kind: f.kind,
    name: f.name,
    path: f.path,
    source: 'osm',
  }))

  if (features.length >= 5) {
    writeCache(NATURE_CACHE_KEY, features)
    return features
  }
  return null
}

export async function loadPoaTrafficSegments() {
  const mockSegments = getPoaTrafficMockSegments('todos')
  const cached = readCache(TRAFFIC_CACHE_KEY)
  if (cached?.length) return finalizeLeveSegments(cached)

  try {
    const allWays = await fetchAllTrafficWays()

    const enriched = finalizeLeveSegments(
      mockSegments.map(seg => enrichSegmentWithOsm(seg, allWays)),
    )
    const osmCount = enriched.filter(s => s.geometrySource?.startsWith('osm')).length
    if (osmCount >= 6) writeCache(TRAFFIC_CACHE_KEY, enriched)
    return enriched
  } catch {
    return finalizeLeveSegments(mockSegments)
  }
}

export async function loadPoaNatureFeatures() {
  try {
    const osm = await fetchPoaNatureFromOsm()
    if (osm?.length) return osm
  } catch { /* fallback mock */ }
  return mergeNatureWithMock()
}
