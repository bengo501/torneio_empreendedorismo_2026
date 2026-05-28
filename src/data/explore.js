/**
 * Curated urban experiences for Porto Alegre.
 * Each place supports the platform's social mission:
 * democratizing access to culture, leisure, and services.
 */

export const EXPLORE_CATEGORIES = [
  { id: 'todos',       label: 'Todos',       emoji: '🗺️' },
  { id: 'cultura',     label: 'Cultura',     emoji: '🎭' },
  { id: 'parques',     label: 'Parques',     emoji: '🌿' },
  { id: 'educacao',    label: 'Educação',    emoji: '🎓' },
  { id: 'gastronomia', label: 'Gastronomia', emoji: '🍽️' },
  { id: 'compras',     label: 'Compras',     emoji: '🛒' },
  { id: 'saude',       label: 'Saúde',       emoji: '🏥' },
]

export const EXPLORE_PLACES = [
  {
    id: 'redencao',
    name: 'Parque da Redenção',
    category: 'parques',
    lat: -30.0355, lon: -51.2071,
    desc: 'O coração verde de Porto Alegre',
    freeAccess: true,
  },
  {
    id: 'mercado',
    name: 'Mercado Público',
    category: 'gastronomia',
    lat: -30.0278, lon: -51.2258,
    desc: 'Centro cultural e gastronômico histórico',
    freeAccess: true,
  },
  {
    id: 'margs',
    name: 'MARGS',
    category: 'cultura',
    lat: -30.0312, lon: -51.2264,
    desc: 'Museu de Arte do Rio Grande do Sul',
    freeAccess: true,
  },
  {
    id: 'ibere',
    name: 'Fundação Iberê Camargo',
    category: 'cultura',
    lat: -30.0650, lon: -51.2461,
    desc: 'Arte contemporânea à beira do Guaíba',
    freeAccess: false,
  },
  {
    id: 'teatro_sp',
    name: 'Teatro São Pedro',
    category: 'cultura',
    lat: -30.0299, lon: -51.2274,
    desc: 'Um dos teatros mais históricos do Brasil',
    freeAccess: false,
  },
  {
    id: 'cinemateca',
    name: 'Cinemateca Capitólio',
    category: 'cultura',
    lat: -30.0308, lon: -51.2234,
    desc: 'Cinema de arte e cultura independente',
    freeAccess: false,
  },
  {
    id: 'parcao',
    name: 'Parcão (Moinhos de Vento)',
    category: 'parques',
    lat: -30.0230, lon: -51.1988,
    desc: 'Parque com lago, pista e moinho',
    freeAccess: true,
  },
  {
    id: 'botanico',
    name: 'Jardim Botânico',
    category: 'parques',
    lat: -30.0613, lon: -51.1724,
    desc: 'Trilhas e natureza na zona leste',
    freeAccess: true,
  },
  {
    id: 'ufrgs',
    name: 'UFRGS Campus Centro',
    category: 'educacao',
    lat: -30.0320, lon: -51.2230,
    desc: 'Principal universidade federal do RS',
    freeAccess: true,
  },
  {
    id: 'pucrs',
    name: 'PUCRS',
    category: 'educacao',
    lat: -30.0610, lon: -51.1712,
    desc: 'Campus com Museu de Ciências e Tecnologia',
    freeAccess: false,
  },
  {
    id: 'brique',
    name: 'Brique da Redenção',
    category: 'gastronomia',
    lat: -30.0351, lon: -51.2065,
    desc: 'Feira de artesanato e gastronomia (domingos)',
    freeAccess: true,
  },
  {
    id: 'iguatemi',
    name: 'Shopping Iguatemi',
    category: 'compras',
    lat: -30.0444, lon: -51.1978,
    desc: 'Principal shopping da cidade',
    freeAccess: true,
  },
  {
    id: 'hcpa',
    name: 'Hospital de Clínicas (HCPA)',
    category: 'saude',
    lat: -30.0384, lon: -51.2170,
    desc: 'Hospital universitário de referência',
    freeAccess: true,
  },
  {
    id: 'santa_casa',
    name: 'Santa Casa de Misericórdia',
    category: 'saude',
    lat: -30.0343, lon: -51.2214,
    desc: 'Hospital histórico no centro da cidade',
    freeAccess: true,
  },
  {
    id: 'beira_rio',
    name: 'Estádio Beira-Rio',
    category: 'cultura',
    lat: -30.0644, lon: -51.2358,
    desc: 'Estádio do Sport Club Internacional',
    freeAccess: false,
  },
]

/** Gramado curated experiences */
export const EXPLORE_GRAMADO = [
  { id: 'lago_negro',  name: 'Lago Negro',             category: 'parques',     lat: -29.3785, lon: -50.8680, desc: 'Cartão postal de Gramado — cisnes e natureza', freeAccess: true },
  { id: 'mini_mundo',  name: 'Mini Mundo',              category: 'cultura',     lat: -29.3723, lon: -50.8623, desc: 'O menor mundo em escala do Brasil', freeAccess: false },
  { id: 'dreamland',   name: 'Dreamland',               category: 'cultura',     lat: -29.3700, lon: -50.8619, desc: 'Museu de cera, ilusão e terror', freeAccess: false },
  { id: 'lugano',      name: 'Chocolates Lugano',        category: 'gastronomia', lat: -29.3734, lon: -50.8677, desc: 'Loja símbolo da chocolateria gaúcha', freeAccess: true },
  { id: 'fenac',       name: 'Parque da Fenac',          category: 'parques',     lat: -29.3800, lon: -50.8750, desc: 'Parque temático de animação europeia', freeAccess: false },
  { id: 'rota_vinho',  name: 'Rota do Vinho',           category: 'gastronomia', lat: -29.1700, lon: -51.5200, desc: 'Vinícolas e degustações na Serra Gaúcha', freeAccess: false },
  { id: 'canela',      name: 'Catedral de Pedra — Canela', category: 'cultura',  lat: -29.3618, lon: -50.8134, desc: 'Construção histórica de basalto vulcânico', freeAccess: true },
  { id: 'parque_knorr',name: 'Parque Knorr',            category: 'parques',     lat: -29.3641, lon: -50.8155, desc: 'Cascata do Caracol e natureza exuberante', freeAccess: false },
]

/** ODS impact mapped to transport category */
export const ODS_IMPACT = {
  patinete:  { code: 11, label: 'Cidades sustentáveis',      color: '#FF6700' },
  bicicleta: { code: 13, label: 'Ação contra o clima',        color: '#3F7E44' },
  carro:     { code: 10, label: 'Redução de desigualdades',   color: '#DD1367' },
}

/** Compute cumulative social impact from ride history */
export function computeSocialImpact(rideHistory) {
  const totalCo2Saved = rideHistory.reduce((acc, r) => acc + (r.ecoKg ?? 0), 0)
  const totalSaved    = rideHistory.reduce((acc, r) => acc + (r.saved  ?? 0), 0)
  const greenRides    = rideHistory.filter(r => (r.ecoKg ?? 0) > 0).length
  const totalRides    = rideHistory.length
  const greenPct      = totalRides ? Math.round((greenRides / totalRides) * 100) : 0

  return { totalCo2Saved, totalSaved, greenRides, totalRides, greenPct }
}
