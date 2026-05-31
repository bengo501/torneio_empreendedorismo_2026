/** Get current GPS position (real device location)
 *  highAccuracy=true  → GPS chip (slower, more precise, may fail on Firefox)
 *  highAccuracy=false → network/IP-based (faster, always works as fallback)
 */
export function getCurrentPosition(highAccuracy = true) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste dispositivo'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 14000 : 10000, maximumAge: 0 }
    )
  })
}

/** Reverse geocode detalhado: rua, bairro, cidade */
export async function reverseGeocodeDetailed(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt-BR`,
      { headers: { 'Accept-Language': 'pt-BR' } }
    )
    const data = await res.json()
    const a = data.address || {}
    const street = [a.road || a.pedestrian || a.footway, a.house_number].filter(Boolean).join(', ')
    const neighborhood = a.suburb || a.neighbourhood || a.city_district || a.quarter || null
    const city = a.city || a.town || a.village || a.municipality || 'Porto Alegre'
    const state = a.state || 'RS'
    const parts = [street, neighborhood, city].filter(Boolean)
    const label = parts.length ? parts.join(', ') : (data.display_name ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`)
    return { label, street: street || null, neighborhood, city, state }
  } catch {
    const fallback = `${lat.toFixed(4)}, ${lon.toFixed(4)}`
    return { label: fallback, street: null, neighborhood: null, city: 'Porto Alegre', state: 'RS' }
  }
}

/** Reverse geocode: coordinates → endereço resumido (string) */
export async function reverseGeocode(lat, lon) {
  const d = await reverseGeocodeDetailed(lat, lon)
  return d.label
}

/**
 * Forward geocode: text → list of places
 * @param {string} query - search term
 * @param {number|null} lat - user latitude for biasing
 * @param {number|null} lon - user longitude for biasing
 * @param {{ strict?: boolean, radiusDeg?: number }} opts
 *   strict=true  → bounded=1, only returns results inside the viewbox (for Essenciais/nearby)
 *   strict=false → bounded=0, biases toward viewbox but allows wider results (for Ir/Explorar)
 *   radiusDeg    → viewbox half-size in degrees (default 0.5° ≈ 55 km for strict=false, 0.15° ≈ 17 km for strict=true)
 */
function kmBetween(a, b) {
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLon = (b.lon - a.lon) * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** photon (komoot) — geocoder osm sem chave; bom como fallback */
async function searchPhoton(query, lat, lon, { maxKm } = {}) {
  try {
    const bias = lat != null && lon != null ? `&lat=${lat}&lon=${lon}` : ''
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8${bias}`,
      { signal: AbortSignal.timeout(8000) },
    )
    const data = await res.json()
    if (data?.lang) return []
    return (data.features || [])
      .map(f => {
        const [flon, flat] = f.geometry?.coordinates ?? []
        const p = f.properties ?? {}
        if (!flat || !flon) return null
        const city = p.city || p.locality || p.state || ''
        if (city && !/brasil|brazil|porto alegre|bento|rs|rio grande/i.test(`${city} ${p.country || ''} ${p.name || ''}`)) {
          if (p.country && !/bra|br/i.test(String(p.country))) return null
        }
        const parts = [p.name, p.street, p.city].filter(Boolean)
        const label = parts.slice(0, 3).join(', ') || query
        const place = { label, fullLabel: parts.join(', '), lat: flat, lon: flon }
        if (lat != null && maxKm != null) {
          place.distanceKm = kmBetween({ lat, lon }, place)
          if (place.distanceKm > maxKm) return null
        }
        return place
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

export async function searchPlaces(query, lat, lon, { strict = false, radiusDeg } = {}) {
  const maxKm = strict && lat != null ? (radiusDeg ?? 0.15) * 111 : null
  try {
    const r = radiusDeg ?? (strict ? 0.15 : 0.5)
    const viewbox = lat && lon
      ? `&viewbox=${lon - r},${lat + r},${lon + r},${lat - r}&bounded=${strict ? 1 : 0}`
      : ''
    const country = '&countrycodes=br'
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1${viewbox}${country}&accept-language=pt-BR`,
      { headers: { 'Accept-Language': 'pt-BR' } },
    )
    const data = await res.json()
    let results = data.map(p => ({
      label: p.display_name.split(',').slice(0, 3).join(','),
      fullLabel: p.display_name,
      lat: parseFloat(p.lat),
      lon: parseFloat(p.lon),
    }))
    if (maxKm != null) {
      results = results
        .map(p => ({ ...p, distanceKm: kmBetween({ lat, lon }, p) }))
        .filter(p => p.distanceKm <= maxKm)
    }
    if (results.length >= 3) return results.slice(0, 8)

    const photon = await searchPhoton(query, lat, lon, { maxKm: maxKm ?? 25 })
    const seen = new Set(results.map(p => `${p.lat?.toFixed(4)}_${p.lon?.toFixed(4)}`))
    for (const p of photon) {
      const k = `${p.lat?.toFixed(4)}_${p.lon?.toFixed(4)}`
      if (!seen.has(k)) {
        seen.add(k)
        results.push(p)
      }
    }
    return results.slice(0, 8)
  } catch {
    const photon = await searchPhoton(query, lat, lon, { maxKm: maxKm ?? 25 })
    return photon.slice(0, 8)
  }
}

/** Fetch a road route from OSRM (free, OpenStreetMap routing) */
export async function fetchRoute(origin, destination, mode = 'driving') {
  try {
    const profile = mode === 'cycling' ? 'bike' : mode === 'foot' ? 'foot' : 'car'
    const url = `https://router.project-osrm.org/route/v1/${profile === 'bike' ? 'cycling' : profile === 'foot' ? 'foot' : 'driving'}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (data.routes && data.routes[0]) {
      const coords = data.routes[0].geometry.coordinates
      const distanceKm = +(data.routes[0].distance / 1000).toFixed(2)
      const durationMin = Math.ceil(data.routes[0].duration / 60)
      return {
        polyline: coords.map(([lon, lat]) => [lat, lon]),
        distanceKm,
        durationMin,
      }
    }
  } catch {/* fallback below */}
  // Fallback: straight line
  const R = 6371
  const dLat = (destination.lat - origin.lat) * Math.PI / 180
  const dLon = (destination.lon - origin.lon) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(origin.lat*Math.PI/180)*Math.cos(destination.lat*Math.PI/180)*Math.sin(dLon/2)**2
  const distanceKm = +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2)
  return {
    polyline: [[origin.lat, origin.lon], [destination.lat, destination.lon]],
    distanceKm,
    durationMin: Math.ceil(distanceKm / 30 * 60),
  }
}
