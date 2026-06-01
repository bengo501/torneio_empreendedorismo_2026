/**
 * fases de treinamento dos modelos tourio (escala geográfica).
 * poa → rs → brasil → mundo — ver docs/TREINAMENTO_IA_MODELOS.md
 */

export const TRAINING_PHASES = [
  {
    id: 'poa',
    label: 'porto alegre',
    scope: { type: 'city', slug: 'porto-alegre', state: 'RS', country: 'BR' },
    status: 'active',
    dataSources: ['data/poa/raw', 'overpass', 'sympla', 'curadoria'],
    minPlaces: 80,
    notes: 'mvp: classificação regex + seed normalizado; few-shot llm em staging',
  },
  {
    id: 'rs',
    label: 'rio grande do sul',
    scope: { type: 'state', code: 'RS', country: 'BR' },
    status: 'planned',
    dataSources: ['ibge municipios', 'osm state extract', 'eventos regionais'],
    minPlaces: 500,
    notes: 'após poa estável: gramado, bento, serra, litoral',
  },
  {
    id: 'br',
    label: 'brasil',
    scope: { type: 'country', code: 'BR' },
    status: 'planned',
    dataSources: ['osm br', 'apis nacionais', 'parceiros turismo'],
    minPlaces: 10000,
    notes: 'embeddings multilíngues pt; deduplicação por cnpj/osm id',
  },
  {
    id: 'world',
    label: 'mundo',
    scope: { type: 'global' },
    status: 'planned',
    dataSources: ['osm planet', 'wikidata', 'licenciamento local'],
    minPlaces: null,
    notes: 'rag por cidade; modelo base multilíngue; compliance lgpd/gdpr',
  },
]

export function getActivePhase() {
  return TRAINING_PHASES.find(p => p.status === 'active') ?? TRAINING_PHASES[0]
}
