import { resolveCoordsFromAddress } from './coords.js'
import { resolveNeighborhood } from './neighborhoods.js'

const CATEGORY_MAP = [
  [/essenciais\s*\/\s*farm[aá]cia/i, { tab: 'essenciais', pinType: 'farmacia', filter: 'farmacias', isEssential: true }],
  [/essenciais\s*\/\s*mercado/i, { tab: 'essenciais', pinType: 'mercado', filter: 'mercados', isEssential: true }],
  [/essenciais\s*\/\s*conveni[eê]ncia/i, { tab: 'essenciais', pinType: 'mercado', filter: 'mercados', isEssential: true }],
  [/essenciais\s*\/\s*sa[uú]de/i, { tab: 'essenciais', pinType: 'saude', filter: 'saude', isEssential: true }],
  [/gastronomia\s*\/\s*fast/i, { tab: 'essenciais', pinType: 'fastfood', filter: 'fastfood', isEssential: false }],
  [/fast\s*food/i, { tab: 'essenciais', pinType: 'fastfood', filter: 'fastfood', isEssential: false }],
  [/lugares\s*\/\s*cultura/i, { tab: 'lugares', pinType: 'cultura', filter: 'cultura' }],
  [/lugares\s*\/\s*parques/i, { tab: 'lugares', pinType: 'parque', filter: 'parques' }],
  [/lugares\s*\/\s*caf[eé]s/i, { tab: 'lugares', pinType: 'cafe', filter: 'cafes' }],
  [/lugares\s*\/\s*gastronomia/i, { tab: 'lugares', pinType: 'gastronomia', filter: 'gastronomia' }],
  [/lugares\s*\/\s*compras/i, { tab: 'lugares', pinType: 'compras', filter: 'compras' }],
  [/lugares\s*\/\s*educa[cç][aã]o/i, { tab: 'lugares', pinType: 'educacao', filter: 'educacao' }],
  [/trilhas/i, { tab: 'lugares', pinType: 'trilha', filter: 'trilhas' }],
  [/mirantes/i, { tab: 'lugares', pinType: 'mirante', filter: 'mirantes' }],
  [/feiras/i, { tab: 'lugares', pinType: 'feira', filter: 'feiras' }],
  [/economia\s*local|economia\s*criativa/i, { tab: 'lugares', pinType: 'economia', filter: 'economia' }],
  [/eventos/i, { tab: 'eventos', pinType: 'evento', filter: 'todos', isEvent: true }],
]

function slugId(name, idx) {
  const base = (name || 'place')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 48)
  return `poa-${base}-${idx}`
}

function parseCategoryMeta(category = '') {
  for (const [re, meta] of CATEGORY_MAP) {
    if (re.test(category)) return meta
  }
  return { tab: 'lugares', pinType: 'default', filter: 'todos' }
}

function buildTags(raw, meta) {
  const tags = new Set()
  if (meta.isEssential) tags.add('essencial')
  if (raw.isLocalBusiness) tags.add('economia-local')
  if (raw.brand && raw.brand !== 'Local') tags.add('rede')
  if (/gr[aá]tis/i.test(raw.priceRange || '')) tags.add('gratuito')
  if (meta.filter) tags.add(meta.filter)
  return [...tags]
}

/**
 * @param {object} raw — entrada do seed
 * @param {number} idx
 */
export function normalizePlace(raw, idx) {
  const meta = parseCategoryMeta(raw.category || '')
  const coords = raw.lat != null && raw.lng != null
    ? { lat: raw.lat, lng: raw.lng, precision: 'exact' }
    : (() => {
        const r = resolveCoordsFromAddress(raw.address, raw.name)
        return r ? { lat: r.lat, lng: r.lon, precision: r.precision } : { lat: null, lng: null, precision: 'pending' }
      })()

  const subcategory = (raw.category || '').split('/').map(s => s.trim()).pop() || meta.pinType
  const isLocal = /local|economia|feira|brique|artesanato|autoral|criativa/i.test(
    `${raw.category} ${raw.preview} ${raw.brand || ''}`,
  )

  const nb = resolveNeighborhood(raw.address || '', coords.lat, coords.lng)

  return {
    id: raw.id || slugId(raw.name, idx),
    name: raw.name,
    category: raw.category,
    subcategory,
    brand: raw.brand || null,
    address: raw.address || '',
    lat: coords.lat,
    lng: coords.lng,
    priceRange: raw.priceRange || null,
    target: raw.target || null,
    preview: raw.preview || raw.desc || '',
    social: raw.social || null,
    source: raw.source || null,
    tags: buildTags(raw, meta),
    tab: meta.tab,
    pinType: meta.pinType,
    mapFilter: meta.filter,
    isEssential: meta.isEssential ?? /essenciais/i.test(raw.category || ''),
    isLocalBusiness: raw.isLocalBusiness ?? isLocal,
    isEventSource: Boolean(raw.isEventSource || raw.type === 'dynamic_source'),
    isDynamic: Boolean(raw.isDynamic || raw.type === 'dynamic_source'),
    isEvent: meta.isEvent ?? false,
    timeLabel: raw.timeLabel || null,
    geocodePending: coords.precision === 'pending',
    neighborhoodId: nb?.id ?? null,
    neighborhoodLabel: nb?.label ?? null,
  }
}

export function normalizeEventMock(raw, idx) {
  const place = normalizePlace({
    ...raw,
    category: raw.category || 'Eventos',
    isEvent: true,
  }, idx)
  return {
    ...place,
    tab: 'eventos',
    pinType: 'evento',
    isEvent: true,
    isDynamic: false,
  }
}
