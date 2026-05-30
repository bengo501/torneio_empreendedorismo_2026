/**
 * Serviço de patinetes/bikes via GBFS (General Bikeshare Feed Specification).
 * GBFS é o padrão aberto usado por operadores de micromobilidade.
 *
 * Operadores com feeds GBFS públicos rastreados:
 * - Whoosh (https://api.whoosh.bike/gbfs/ptBR/gbfs.json)
 * - Lime (https://data.lime.bike/api/partners/v2/gbfs)
 * - Tembici/Yellow (feed via API pública)
 *
 * Nota: a maioria dos operadores brasileiros não expõe feed GBFS público.
 * A integração real requer contratos com as operadoras ou uso das APIs
 * proprietárias (documentadas no BACKLOG.md).
 *
 * Por enquanto, retornamos dados simulados com coordenadas reais de POA
 * enquanto os contratos de API são firmados.
 */

const SCOOTER_OPERATORS = [
  {
    id: 'whoosh',
    name: 'Whoosh',
    emoji: '🛴',
    color: '#10B981',
    // GBFS feed real — requer autenticação na versão pública
    gbfsUrl: 'https://api.whoosh.bike/gbfs/ptBR/free_bike_status.json',
  },
  {
    id: 'lime',
    name: 'Lime',
    emoji: '🟢',
    color: '#00C247',
    gbfsUrl: 'https://data.lime.bike/api/partners/v2/gbfs/porto_alegre/free_bike_status',
  },
  {
    id: 'tembici',
    name: 'Tembici',
    emoji: '🚲',
    color: '#FACC15',
    gbfsUrl: null, // feed proprietário — requer API key
  },
]

/**
 * Tenta buscar patinetes/bikes de um operador via GBFS.
 * Retorna array vazio em caso de falha (sem autenticação / sem cobertura).
 */
async function fetchGbfsOperator(operator, lat, lon, radiusMeters) {
  if (!operator.gbfsUrl) return []
  try {
    const res = await fetch(operator.gbfsUrl, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return []
    const data = await res.json()
    const bikes = data.data?.bikes ?? []
    return bikes
      .filter(b => {
        if (!b.lat || !b.lon) return false
        const dlat = (b.lat - lat) * Math.PI / 180
        const dlon = (b.lon - lon) * Math.PI / 180
        const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dlon / 2) ** 2
        const distM = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return distM <= radiusMeters
      })
      .slice(0, 10)
      .map(b => ({
        id: `${operator.id}-${b.bike_id}`,
        operator: operator.id,
        name: operator.name,
        emoji: operator.emoji,
        color: operator.color,
        lat: b.lat,
        lon: b.lon,
        batteryPct: b.current_range_meters ? Math.min(100, Math.round(b.current_range_meters / 200)) : null,
      }))
  } catch {
    return []
  }
}

/**
 * Busca patinetes/bikes disponíveis próximos ao usuário.
 * Tenta todos os operadores em paralelo; ignora falhas individuais.
 *
 * @param {number} lat
 * @param {number} lon
 * @param {number} [radiusMeters=800]
 * @returns {Promise<Array>}
 */
export async function fetchNearbyScooters(lat, lon, radiusMeters = 800) {
  const results = await Promise.allSettled(
    SCOOTER_OPERATORS.map(op => fetchGbfsOperator(op, lat, lon, radiusMeters))
  )
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
}

export { SCOOTER_OPERATORS }
