import { SYMPLA_BASE, SYMPLA_TOKEN } from '../config.js'

const CAT_MAP = {
  musica: 'musica', music: 'musica', show: 'musica', festa: 'musica',
  cultura: 'cultura', teatro: 'cultura', cinema: 'cultura', arte: 'cultura',
  esporte: 'esporte', sport: 'esporte', corrida: 'esporte',
  gastronomia: 'gastronomia', food: 'gastronomia', feira: 'feira',
  workshop: 'cultura', curso: 'educacao', educacao: 'educacao',
}

const CAT_EMOJI = {
  musica: '🎵', cultura: '🎭', feira: '🛍️', gastronomia: '🍽️',
  esporte: '🏃', educacao: '🎓', todos: '🗓️',
}

function mapCategory(raw) {
  const key = (raw || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  for (const [pattern, cat] of Object.entries(CAT_MAP)) {
    if (key.includes(pattern)) return cat
  }
  return 'cultura'
}

function formatEventDate(start) {
  if (!start) return 'em breve'
  try {
    const d = new Date(start.replace(' ', 'T'))
    const day = d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${day} · ${time}`
  } catch {
    return start
  }
}

function normalizeSymplaEvent(raw, index) {
  const addr = raw.address || raw.location || {}
  const lat = parseFloat(addr.lat ?? addr.latitude)
  const lon = parseFloat(addr.lon ?? addr.longitude)
  const cat = mapCategory(raw.category_prim?.name || raw.category_sec?.name || raw.category?.name)
  const price = raw.free || raw.is_free
    ? 'Grátis'
    : raw.min_price != null
      ? `R$ ${raw.min_price}`
      : raw.ticket_price != null
        ? `R$ ${raw.ticket_price}`
        : 'Consultar'

  return {
    id: `sympla-${raw.id ?? index}`,
    emoji: CAT_EMOJI[cat] ?? '🗓️',
    title: raw.name || raw.title || 'Evento Sympla',
    local: addr.name || addr.address || addr.street || 'Local a confirmar',
    bairro: addr.neighborhood || addr.city || '',
    time: formatEventDate(raw.start_date || raw.startDate),
    price,
    cat,
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
    desc: (raw.detail || raw.description || '').slice(0, 120),
    highlight: price === 'Grátis',
    source: 'sympla',
    url: raw.url || raw.event_url || null,
  }
}

function cityMatches(eventCity, targetCity) {
  if (!eventCity || !targetCity) return true
  const a = eventCity.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  const b = targetCity.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  return a.includes(b) || b.includes(a)
}

export async function symplaUpstream(path, params = {}) {
  if (!SYMPLA_TOKEN) return null
  const qs = new URLSearchParams(params).toString()
  const url = `${SYMPLA_BASE}${path}${qs ? `?${qs}` : ''}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json', s_token: SYMPLA_TOKEN },
  })
  if (!res.ok) return null
  return res.json()
}

async function fetchPartnersByCity(city, state) {
  const data = await symplaUpstream('/partners/events', { city, state, page: '1', limit: '24' })
  const list = data?.data ?? data?.events ?? data
  return Array.isArray(list) ? list : []
}

async function fetchPublicFiltered(city, state) {
  const all = []
  for (let page = 1; page <= 3; page++) {
    const data = await symplaUpstream('/public/v1.5.1/events', {
      page: String(page),
      page_size: '50',
    })
    const batch = data?.data ?? []
    if (!batch.length) break
    all.push(...batch)
    if (!data?.pagination?.has_next) break
  }
  return all.filter(ev => {
    const c = ev.address?.city
    const s = ev.address?.state
    return cityMatches(c, city) && (!state || !s || s.toUpperCase() === state.toUpperCase())
  })
}

async function nominatimSearch(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=br&accept-language=pt-BR`,
      { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'zippi-app/1.0' } },
    )
    const data = await res.json()
    if (!data[0]) return null
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

async function geocodeMissing(events, cityName) {
  const out = [...events]
  let geocoded = 0
  for (let i = 0; i < out.length && geocoded < 5; i++) {
    if (out[i].lat != null && out[i].lon != null) continue
    const coords = await nominatimSearch(`${out[i].local}, ${cityName}, Brasil`)
    if (coords) {
      out[i] = { ...out[i], lat: coords.lat, lon: coords.lon }
      geocoded++
    }
  }
  return out
}

export async function fetchSymplaEvents(cityName, stateCode = 'RS') {
  if (!SYMPLA_TOKEN) {
    return { events: [], source: 'fallback', symplaConfigured: false }
  }

  let raw = await fetchPartnersByCity(cityName, stateCode)
  if (!raw.length) raw = await fetchPublicFiltered(cityName, stateCode)

  let events = raw
    .filter(ev => !ev.cancelled && ev.published !== 0)
    .map((ev, i) => normalizeSymplaEvent(ev, i))

  events = await geocodeMissing(events, cityName)

  return {
    events: events.filter(e => e.lat != null && e.lon != null),
    source: events.length ? 'sympla' : 'fallback',
    symplaConfigured: true,
  }
}

export function isSymplaConfigured() {
  return Boolean(SYMPLA_TOKEN)
}
