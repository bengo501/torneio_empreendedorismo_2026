export const SERVICES = [
  {
    id: 'uber',
    name: 'Uber',
    category: 'carro',
    color: '#000000',
    bgColor: '#1a1a1a',
    emoji: '🚗',
    basePrice: 12.5,
    pricePerKm: 2.1,
    surge: 1.0,
    avgWaitMin: 4,
    co2PerKm: 120,
    comfortScore: 9,
    availability: 0.95,
    deepLink: 'uber://',
    storeLink: 'https://uber.com',
    description: 'Carro particular com motorista',
  },
  {
    id: '99',
    name: '99',
    category: 'carro',
    color: '#FFD600',
    bgColor: '#2a2200',
    emoji: '🟡',
    basePrice: 10.0,
    pricePerKm: 1.85,
    surge: 1.0,
    avgWaitMin: 5,
    co2PerKm: 120,
    comfortScore: 8,
    availability: 0.88,
    deepLink: '99app://',
    storeLink: 'https://99app.com',
    description: 'Carro particular econômico',
  },
  {
    id: 'inDriver',
    name: 'inDriver',
    category: 'carro',
    color: '#00C853',
    bgColor: '#002210',
    emoji: '💚',
    basePrice: 9.0,
    pricePerKm: 1.7,
    surge: 1.0,
    avgWaitMin: 7,
    co2PerKm: 120,
    comfortScore: 7,
    availability: 0.75,
    deepLink: 'indriver://',
    storeLink: 'https://indriver.com',
    description: 'Negocie o valor da sua corrida',
  },
  {
    id: 'whoosh',
    name: 'Whoosh',
    category: 'patinete',
    color: '#FF4B00',
    bgColor: '#2a0f00',
    emoji: '🛴',
    basePrice: 3.0,
    pricePerKm: 1.2,
    surge: 1.0,
    avgWaitMin: 1,
    co2PerKm: 0,
    comfortScore: 6,
    availability: 0.7,
    deepLink: 'whoosh://',
    storeLink: 'https://whoosh.bike',
    description: 'Patinete elétrico compartilhado',
    maxKm: 5,
  },
  {
    id: 'lime',
    name: 'Lime',
    category: 'patinete',
    color: '#00C851',
    bgColor: '#002210',
    emoji: '💚',
    basePrice: 3.5,
    pricePerKm: 1.1,
    surge: 1.0,
    avgWaitMin: 2,
    co2PerKm: 0,
    comfortScore: 6,
    availability: 0.65,
    deepLink: 'lime://',
    storeLink: 'https://li.me',
    description: 'Patinete ou bike elétrica',
    maxKm: 5,
  },
  {
    id: 'yellow',
    name: 'Tembici / Yellow',
    category: 'bicicleta',
    color: '#FFC107',
    bgColor: '#2a1e00',
    emoji: '🚲',
    basePrice: 2.0,
    pricePerKm: 0.9,
    surge: 1.0,
    avgWaitMin: 3,
    co2PerKm: 0,
    comfortScore: 5,
    availability: 0.6,
    deepLink: 'tembici://',
    storeLink: 'https://tembici.com.br',
    description: 'Bicicleta compartilhada',
    maxKm: 4,
  },
]

export function calcPrice(service, distanceKm) {
  return +(service.basePrice + service.pricePerKm * distanceKm * service.surge).toFixed(2)
}

export function calcTime(service, distanceKm) {
  const speedKmh = service.category === 'patinete' ? 18
    : service.category === 'bicicleta' ? 14
    : 30
  const travelMin = Math.ceil((distanceKm / speedKmh) * 60)
  return service.avgWaitMin + travelMin
}

export function calcScore(service, distanceKm, preferences) {
  if (service.maxKm && distanceKm > service.maxKm) return -1

  const price  = calcPrice(service, distanceKm)
  const time   = calcTime(service, distanceKm)

  const priceScore   = Math.max(0, 10 - price / 5)
  const timeScore    = Math.max(0, 10 - time / 10)
  const ecoScore     = service.co2PerKm === 0 ? 10 : Math.max(0, 10 - service.co2PerKm / 20)
  const comfortScore = service.comfortScore
  const availScore   = service.availability * 10

  const w = preferences || { price: 0.35, time: 0.25, eco: 0.2, comfort: 0.1, avail: 0.1 }

  return +(
    priceScore   * w.price   +
    timeScore    * w.time    +
    ecoScore     * w.eco     +
    comfortScore * w.comfort +
    availScore   * w.avail
  ).toFixed(2)
}

export function getRankedServices(distanceKm, preferences) {
  return SERVICES
    .map(s => ({
      ...s,
      price: calcPrice(s, distanceKm),
      totalMin: calcTime(s, distanceKm),
      score: calcScore(s, distanceKm, preferences),
      co2Saved: s.co2PerKm === 0 ? +(distanceKm * 120 / 1000).toFixed(2) : 0,
    }))
    .filter(s => s.score >= 0)
    .sort((a, b) => b.score - a.score)
}
