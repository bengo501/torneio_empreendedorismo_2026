/**
 * integração sympla — eventos por cidade
 * requer VITE_SYMPLA_TOKEN (chave em sympla.com.br → minha conta → integrações)
 * usa proxy /api/sympla no vite para contornar cors
 */

const SYMPLA_PROXY = import.meta.env.VITE_SYMPLA_PROXY ?? '/api/sympla'
const TOKEN = import.meta.env.VITE_SYMPLA_TOKEN ?? ''

const CAT_MAP = {
  musica: 'musica',
  music: 'musica',
  show: 'musica',
  festa: 'musica',
  cultura: 'cultura',
  teatro: 'cultura',
  cinema: 'cultura',
  arte: 'cultura',
  esporte: 'esporte',
  sport: 'esporte',
  corrida: 'esporte',
  gastronomia: 'gastronomia',
  food: 'gastronomia',
  feira: 'feira',
  workshop: 'cultura',
  curso: 'educacao',
  educacao: 'educacao',
}

const CAT_EMOJI = {
  musica: '🎵',
  cultura: '🎭',
  feira: '🛍️',
  gastronomia: '🍽️',
  esporte: '🏃',
  educacao: '🎓',
  todos: '🗓️',
}

function symplaHeaders() {
  return {
    Accept: 'application/json',
    s_token: TOKEN,
  }
}

function parseCoord(v) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

function mapCategory(raw) {
  const key = (raw || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  for (const [pattern, cat] of Object.entries(CAT_MAP)) {
    if (key.includes(pattern)) return cat
  }
  return 'cultura'
}

function formatEventDate(start, end) {
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
  const lat = parseCoord(addr.lat ?? addr.latitude)
  const lon = parseCoord(addr.lon ?? addr.longitude)
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
    lat,
    lon,
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

async function symplaFetch(path, params = {}) {
  if (!TOKEN) return null
  const qs = new URLSearchParams(params).toString()
  const url = `${SYMPLA_PROXY}${path}${qs ? `?${qs}` : ''}`
  try {
    const res = await fetch(url, { headers: symplaHeaders() })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/** tenta api de parceiros com filtro de cidade */
async function fetchPartnersByCity(city, state) {
  const data = await symplaFetch('/partners/events', {
    city,
    state,
    page: '1',
    limit: '24',
  })
  const list = data?.data ?? data?.events ?? data
  return Array.isArray(list) ? list : []
}

/** api pública — lista eventos do organizador; filtra por cidade no cliente */
async function fetchPublicFiltered(city, state) {
  const all = []
  for (let page = 1; page <= 3; page++) {
    const data = await symplaFetch('/public/v1.5.1/events', {
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

/** geocodifica eventos sem coordenadas (máx 5 por performance) */
async function geocodeMissing(events, cityName) {
  const { searchPlaces } = await import('./geo.js')
  const out = [...events]
  let geocoded = 0
  for (let i = 0; i < out.length && geocoded < 5; i++) {
    if (out[i].lat != null && out[i].lon != null) continue
    const q = `${out[i].local}, ${cityName}`
    const places = await searchPlaces(q, null, null, { strict: true, radiusDeg: 0.2 })
    if (places[0]) {
      out[i] = { ...out[i], lat: places[0].lat, lon: places[0].lon }
      geocoded++
    }
  }
  return out
}

/**
 * busca eventos sympla para uma cidade
 * @returns {{ events: Array, source: 'sympla'|'fallback'|'mixed' }}
 */
export async function fetchSymplaEvents(cityName, stateCode = 'RS') {
  if (!TOKEN) {
    return { events: [], source: 'fallback' }
  }

  let raw = await fetchPartnersByCity(cityName, stateCode)
  if (!raw.length) {
    raw = await fetchPublicFiltered(cityName, stateCode)
  }

  let events = raw
    .filter(ev => !ev.cancelled && ev.published !== 0)
    .map((ev, i) => normalizeSymplaEvent(ev, i))

  events = await geocodeMissing(events, cityName)

  return {
    events: events.filter(e => e.lat != null && e.lon != null),
    source: events.length ? 'sympla' : 'fallback',
  }
}

export function hasSymplaToken() {
  return Boolean(TOKEN)
}
