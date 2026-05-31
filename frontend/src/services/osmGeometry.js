/** utilitários para montar polylines/polígonos a partir de respostas overpass (osm) */

export const POA_BBOX = {
  south: -30.28,
  west: -51.28,
  north: -29.92,
  east: -51.06,
}

export function normOsmName(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bav\.?\s*/g, '')
    .replace(/\bavenida\s*/g, '')
    .replace(/\brua\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function wayToPath(way) {
  if (!way?.geometry?.length) return null
  return way.geometry.map(p => [p.lat, p.lon])
}

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function polygonAreaM2(path) {
  if (!path || path.length < 3) return 0
  const lat0 = path.reduce((s, p) => s + p[0], 0) / path.length
  const mPerDegLat = 111320
  const mPerDegLon = 111320 * Math.cos(lat0 * Math.PI / 180)
  let area = 0
  for (let i = 0; i < path.length - 1; i++) {
    const x1 = path[i][1] * mPerDegLon
    const y1 = path[i][0] * mPerDegLat
    const x2 = path[i + 1][1] * mPerDegLon
    const y2 = path[i + 1][0] * mPerDegLat
    area += x1 * y2 - x2 * y1
  }
  return Math.abs(area / 2)
}

export function nearestIndex(path, point) {
  let best = 0
  let bestD = Infinity
  path.forEach((p, i) => {
    const d = haversineM(p[0], p[1], point[0], point[1])
    if (d < bestD) {
      bestD = d
      best = i
    }
  })
  return best
}

export function slicePathBetweenAnchors(fullPath, start, end) {
  if (!fullPath?.length) return fullPath
  if (fullPath.length <= 2) return fullPath
  const i0 = nearestIndex(fullPath, start)
  const i1 = nearestIndex(fullPath, end)
  if (i0 === i1) return fullPath
  return i0 <= i1 ? fullPath.slice(i0, i1 + 1) : fullPath.slice(i1, i0 + 1).reverse()
}

function endpointDist(a, b) {
  return haversineM(a[0], a[1], b[0], b[1])
}

/** encadeia ways osm com mesmo nome em uma polyline contínua */
export function mergeWayPaths(ways) {
  const segments = ways.map(w => wayToPath(w)).filter(p => p?.length >= 2)
  if (!segments.length) return []
  if (segments.length === 1) return segments[0]

  const pool = segments.map(s => [...s])
  let path = pool.shift()

  while (pool.length) {
    const head = path[0]
    const tail = path[path.length - 1]
    let best = { idx: -1, dist: Infinity, reverse: false, atHead: false }

    pool.forEach((seg, idx) => {
      const opts = [
        { dist: endpointDist(tail, seg[0]), reverse: false, atHead: false },
        { dist: endpointDist(tail, seg[seg.length - 1]), reverse: true, atHead: false },
        { dist: endpointDist(head, seg[seg.length - 1]), reverse: false, atHead: true },
        { dist: endpointDist(head, seg[0]), reverse: true, atHead: true },
      ]
      for (const o of opts) {
        if (o.dist < best.dist) best = { idx, ...o }
      }
    })

    if (best.idx < 0 || best.dist > 120) break

    let seg = pool.splice(best.idx, 1)[0]
    if (best.reverse) seg = [...seg].reverse()
    path = best.atHead ? [...seg, ...path] : [...path, ...seg]
  }

  return path
}

export function nameMatchesWay(wayName, searchTerms) {
  const n = normOsmName(wayName)
  if (!n) return false
  return searchTerms.some(term => {
    const t = normOsmName(term)
    return n.includes(t) || t.includes(n)
  })
}

export function roadSearchTermsFromMock(item) {
  const raw = item.name
    .replace(/\s*\/\s*.*/g, '')
    .replace(/^av\.?\s*/i, '')
    .replace(/^avenida\s*/i, '')
    .replace(/^rua\s*/i, '')
    .trim()
  return [raw, item.name, normOsmName(item.name)]
}

export function classifyNatureTags(tags = {}) {
  if (tags.natural === 'water' || tags.water || tags.waterway || tags.coastline) return 'water'
  if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.leisure === 'nature_reserve') return 'park'
  if (tags.place === 'square') return 'park'
  if (tags.landuse === 'recreation_ground') return 'park'
  if (tags.landuse === 'grass' && tags.name) return 'park'
  return null
}

export function parseNatureElements(elements) {
  const waysById = new Map()
  const relations = []
  const wayInRelation = new Set()

  for (const el of elements || []) {
    if (el.type === 'way') waysById.set(el.id, el)
    if (el.type === 'relation') relations.push(el)
  }

  for (const rel of relations) {
    for (const m of rel.members || []) {
      if (m.type === 'way') wayInRelation.add(m.id)
    }
  }

  const features = []

  for (const rel of relations) {
    const kind = classifyNatureTags(rel.tags)
    if (!kind) continue
    for (const m of rel.members || []) {
      if (m.type !== 'way' || m.role === 'inner') continue
      const way = waysById.get(m.id)
      const path = wayToPath(way)
      if (!path || path.length < 3) continue
      features.push({
        id: `rel-${rel.id}-w-${m.id}`,
        kind,
        name: rel.tags?.name || way?.tags?.name || null,
        path,
        area: polygonAreaM2(path),
        source: 'osm-relation',
      })
    }
  }

  for (const way of waysById.values()) {
    if (wayInRelation.has(way.id)) continue
    const kind = classifyNatureTags(way.tags)
    if (!kind) continue
    const path = wayToPath(way)
    if (!path || path.length < 3) continue
    features.push({
      id: `way-${way.id}`,
      kind,
      name: way.tags?.name || null,
      path,
      area: polygonAreaM2(path),
      source: 'osm-way',
    })
  }

  return dedupeNatureFeatures(features)
}

export function dedupeNatureFeatures(features) {
  const byKind = { water: [], park: [] }
  for (const f of features) {
    if (f.kind === 'water') {
      if (f.area >= 800) byKind.water.push(f)
    } else if (f.kind === 'park') {
      if (f.area >= 400) byKind.park.push(f)
    }
  }

  const dedupe = (list) => {
    const byName = new Map()
    for (const f of list) {
      const key = normOsmName(f.name) || f.id
      const prev = byName.get(key)
      if (!prev || f.area > prev.area) byName.set(key, f)
    }
    return [...byName.values()]
  }

  const water = dedupe(byKind.water).sort((a, b) => b.area - a.area).slice(0, 12)
  const park = dedupe(byKind.park).sort((a, b) => b.area - a.area).slice(0, 35)
  return [...water, ...park]
}
