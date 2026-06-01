/**
 * modelo genérico de bairros — lista extensível (poa mvp).
 * cada bairro: id, label, aliases (endereço), centro e raio para fallback por coordenadas.
 */

function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** @type {import('./neighborhoodTypes').PoaNeighborhood[]} */
export const POA_NEIGHBORHOODS = [
  {
    id: 'centro',
    label: 'centro',
    cityId: 'portoalegre',
    center: { lat: -30.0300, lng: -51.2270 },
    radiusKm: 1.2,
    aliases: [
      'centro historico',
      'centro histórico',
      'centro',
      'praça da matriz',
      'praça da alfandega',
      'rua dos andradas',
      'rua sete de setembro',
      'mercado publico',
      'orla do guaiba',
      'usina do gasometro',
      'mont serrat',
      'montserrat',
    ],
  },
  {
    id: 'cidade-baixa',
    label: 'cidade baixa',
    cityId: 'portoalegre',
    center: { lat: -30.0410, lng: -51.2200 },
    radiusKm: 0.85,
    aliases: [
      'cidade baixa',
      'rua sarmento leite',
      'rua general lima e silva',
      'rua joão alfredo',
    ],
  },
  {
    id: 'floresta',
    label: 'floresta',
    cityId: 'portoalegre',
    center: { lat: -30.0280, lng: -51.2150 },
    radiusKm: 0.9,
    aliases: [
      'floresta',
      'shopping total',
      'av. cristiano fischer',
    ],
  },
  {
    id: 'independencia',
    label: 'independência',
    cityId: 'portoalegre',
    center: { lat: -30.0380, lng: -51.2080 },
    radiusKm: 0.95,
    aliases: [
      'independencia',
      'independência',
      'rua goncalo de carvalho',
      'rua gonçalo de carvalho',
    ],
  },
  {
    id: 'farroupilha',
    label: 'farroupilha',
    cityId: 'portoalegre',
    center: { lat: -30.0355, lng: -51.2070 },
    radiusKm: 1.0,
    aliases: [
      'farroupilha',
      'redencao',
      'redenção',
      'parque da redencao',
      'parque da redenção',
      'parque farroupilha',
      'av. joão pessoa',
    ],
  },
  {
    id: 'rio-branco',
    label: 'rio branco',
    cityId: 'portoalegre',
    center: { lat: -30.0360, lng: -51.2050 },
    radiusKm: 0.75,
    aliases: [
      'rio branco',
      'rua vasco da gama',
      'rua felipe camarao',
      'rua felipe camarão',
    ],
  },
  {
    id: 'bom-fim',
    label: 'bom fim',
    cityId: 'portoalegre',
    center: { lat: -30.0345, lng: -51.2105 },
    radiusKm: 1.0,
    aliases: [
      'bom fim',
      'av. osvaldo aranha',
      'rua ramiro barcelos',
      'rua fernandes vieira',
      'feira ecologica do bom fim',
      'feira ecológica do bom fim',
      'rua jose bonifacio',
    ],
  },
  {
    id: 'santana',
    label: 'santana',
    cityId: 'portoalegre',
    center: { lat: -30.0380, lng: -51.1950 },
    radiusKm: 1.0,
    aliases: [
      'santana',
      'planetario da ufrgs',
      'planetário da ufrgs',
      'rua vicente da fontoura',
    ],
  },
  {
    id: 'moinhos-de-vento',
    label: 'moinhos de vento',
    cityId: 'portoalegre',
    center: { lat: -30.0250, lng: -51.1985 },
    radiusKm: 1.0,
    aliases: [
      'moinhos de vento',
      'moinhos',
      'parcao',
      'parcão',
      'rua padre chagas',
      'rua comendador caminha',
    ],
  },
  {
    id: 'bela-vista',
    label: 'bela vista',
    cityId: 'portoalegre',
    center: { lat: -30.0443, lng: -51.1839 },
    radiusKm: 1.0,
    aliases: [
      'bela vista',
      'auxiliadora',
      'boa vista',
      'tres figueiras',
      'três figueiras',
      'av. carlos gomes',
      'av. plinio brasil milano',
      'av. protasio alves',
    ],
  },
  {
    id: 'partenon',
    label: 'partenon',
    cityId: 'portoalegre',
    center: { lat: -30.0580, lng: -51.1780 },
    radiusKm: 1.2,
    aliases: [
      'partenon',
      'av. bento goncalves, 2893',
      'av. bento gonçalves, 2893',
      'av. ipiranga, 7861',
      'av. ipiranga, 6681',
      'museu de ciencias e tecnologia da pucrs',
      'museu de ciências e tecnologia da pucrs',
    ],
  },
]

const ALIAS_INDEX = POA_NEIGHBORHOODS.flatMap(n =>
  n.aliases.map(alias => ({ alias: norm(alias), neighborhood: n })),
).sort((a, b) => b.alias.length - a.alias.length)

function kmBetween(a, b) {
  if (a?.lat == null || b?.lat == null) return Infinity
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLon = (b.lng - a.lng) * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/**
 * infere bairro a partir do endereço (prioridade) ou coordenadas (fallback).
 * @returns {{ id: string, label: string } | null}
 */
export function resolveNeighborhood(address, lat = null, lng = null) {
  const addr = norm(address)
  if (addr) {
    for (const { alias, neighborhood } of ALIAS_INDEX) {
      if (addr.includes(alias)) {
        return { id: neighborhood.id, label: neighborhood.label }
      }
    }
  }
  if (lat == null || lng == null) return null

  let best = null
  let bestDist = Infinity
  for (const n of POA_NEIGHBORHOODS) {
    const d = kmBetween({ lat, lng }, n.center)
    const limit = (n.radiusKm ?? 1) * 1.35
    if (d <= limit && d < bestDist) {
      bestDist = d
      best = n
    }
  }
  return best ? { id: best.id, label: best.label } : null
}

export function getNeighborhoodById(id) {
  return POA_NEIGHBORHOODS.find(n => n.id === id) ?? null
}

export function filterPlacesByNeighborhood(places, neighborhoodId) {
  if (!neighborhoodId) return places
  return places.filter(p => p.neighborhoodId === neighborhoodId)
}
