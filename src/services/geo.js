/** Get current GPS position (real device location) */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste dispositivo'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

/** Reverse geocode: coordinates → address (OpenStreetMap Nominatim, free) */
export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt-BR`,
      { headers: { 'Accept-Language': 'pt-BR' } }
    )
    const data = await res.json()
    // Build a short readable address
    const a = data.address || {}
    const parts = [
      a.road || a.pedestrian || a.path,
      a.house_number,
      a.suburb || a.neighbourhood || a.city_district,
      a.city || a.town || a.village,
    ].filter(Boolean)
    return parts.length ? parts.join(', ') : data.display_name
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  }
}

/** Forward geocode: text → list of places */
export async function searchPlaces(query, lat, lon) {
  try {
    const viewbox = lat && lon
      ? `&viewbox=${lon - 0.1},${lat + 0.1},${lon + 0.1},${lat - 0.1}&bounded=0`
      : ''
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1${viewbox}&accept-language=pt-BR`,
      { headers: { 'Accept-Language': 'pt-BR' } }
    )
    const data = await res.json()
    return data.map(p => ({
      label: p.display_name.split(',').slice(0, 3).join(','),
      fullLabel: p.display_name,
      lat: parseFloat(p.lat),
      lon: parseFloat(p.lon),
    }))
  } catch {
    return []
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
