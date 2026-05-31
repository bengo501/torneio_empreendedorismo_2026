import farmacias from './raw/farmacias.js'
import supermercados from './raw/supermercados.js'
import saude from './raw/saude.js'
import fastFood from './raw/fastFood.js'
import cultura from './raw/cultura.js'
import natureza from './raw/natureza.js'
import cafes from './raw/cafes.js'
import gastronomia from './raw/gastronomia.js'
import economia from './raw/economia.js'
import educacao from './raw/educacao.js'
import eventSources from './raw/eventSources.js'
import eventosMock from './raw/eventosMock.js'
import { normalizePlace, normalizeEventMock } from './normalize.js'
import { pinMeta } from './mapCategories.js'

const RAW_ALL = [
  ...farmacias,
  ...supermercados,
  ...saude,
  ...fastFood,
  ...cultura,
  ...natureza,
  ...cafes,
  ...gastronomia,
  ...economia,
  ...educacao,
]

/** todos os lugares normalizados (poa mvp) */
export const POA_PLACES = RAW_ALL.map((r, i) => normalizePlace(r, i))

export const POA_EVENT_SOURCES = eventSources.map((r, i) => normalizePlace({ ...r, isEventSource: true }, 1000 + i))

export const POA_EVENT_MOCKS = eventosMock.map((r, i) => normalizeEventMock(r, 2000 + i))

export const POA_ESSENTIALS = POA_PLACES.filter(p => p.tab === 'essenciais' && !p.isEventSource)

export const POA_LUGARES = POA_PLACES.filter(p => p.tab === 'lugares')

/** converte mock de evento para formato da lista (events.js / sympla) */
export function poaMockToEventRow(place) {
  const cat = eventCatFromPlace(place)
  return {
    id: place.id,
    emoji: pinMeta('evento').emoji,
    title: place.name,
    local: place.address.split(' - ')[0] || place.name,
    bairro: place.address.split(' - ')[1]?.split(',')[0]?.trim() || 'Porto Alegre',
    time: place.timeLabel || 'em breve',
    price: /gr[aá]tis/i.test(place.priceRange || '') ? 'Grátis' : (place.priceRange || 'R$'),
    cat,
    lat: place.lat,
    lon: place.lng,
    desc: place.preview,
    highlight: /hoje/i.test(place.timeLabel || ''),
    source: 'poa-mock',
  }
}

function eventCatFromPlace(place) {
  const c = (place.category || '').toLowerCase()
  if (/m[uú]sica|noturno|ao vivo/i.test(c)) return 'musica'
  if (/feira/i.test(c)) return 'feira'
  if (/gastronomia/i.test(c)) return 'gastronomia'
  if (/esporte/i.test(c)) return 'esporte'
  if (/infantil/i.test(c)) return 'cultura'
  if (/gratuito/i.test(c)) return 'gratuito'
  return 'cultura'
}

function lugaresFrom(places) {
  return places.filter(p => p.tab === 'lugares')
}

function essentialsFrom(places) {
  return places.filter(p => p.tab === 'essenciais' && !p.isEventSource)
}

export function filterPoaLugares(filterId, places = POA_PLACES) {
  const list = lugaresFrom(places)
  if (filterId === 'todos') return list.filter(p => p.lat != null)
  return list.filter(p => p.lat != null && p.mapFilter === filterId)
}

export function filterPoaEssentials(filterId, places = POA_PLACES) {
  if (filterId === 'restaurantes') {
    return lugaresFrom(places).filter(p => p.lat != null && p.pinType === 'gastronomia')
  }
  return essentialsFrom(places).filter(p => p.lat != null && p.mapFilter === filterId)
}

export function filterPoaEventMocks(filterId) {
  const list = POA_EVENT_MOCKS.filter(p => p.lat != null)
  if (filterId === 'todos') return list
  if (filterId === 'hoje') return list.filter(p => /hoje/i.test(p.timeLabel || ''))
  if (filterId === 'gratuito') return list.filter(p => /gr[aá]tis/i.test(p.priceRange || ''))
  if (filterId === 'aovivo') return list.filter(p => /ao vivo/i.test(p.category || ''))
  if (filterId === 'noturno') return list.filter(p => /noturno/i.test(p.category || ''))
  if (filterId === 'infantil') return list.filter(p => /infantil/i.test(p.category || ''))
  return list.filter(p => eventCatFromPlace(p) === filterId || p.mapFilter === filterId)
}

export function placeToMapPin(place) {
  const meta = pinMeta(place.pinType)
  return {
    id: place.id,
    lat: place.lat,
    lon: place.lng,
    label: place.name,
    desc: place.preview,
    emoji: meta.emoji,
    category: place.mapFilter,
    color: meta.color,
    type: place.isEvent ? 'event' : place.tab === 'essenciais' ? 'essential' : 'poa',
    place,
  }
}

export function sortByLocalFirst(places) {
  return [...places].sort((a, b) => {
    if (a.isLocalBusiness && !b.isLocalBusiness) return -1
    if (!a.isLocalBusiness && b.isLocalBusiness) return 1
    return a.name.localeCompare(b.name, 'pt-BR')
  })
}
