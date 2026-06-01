import { getActivePhase } from '../config/trainingPhases.js'

const CATEGORY_HINTS = [
  [/farm[aá]cia|drogaria/i, 'farmacias'],
  [/mercado|supermercado|conveni[eê]ncia/i, 'mercados'],
  [/hospital|upa|cl[ií]nica|sa[uú]de/i, 'saude'],
  [/museu|teatro|galeria|cultural/i, 'cultura'],
  [/parque|praça|jardim/i, 'parques'],
  [/caf[eé]|coffee/i, 'cafes'],
  [/restaurante|gastronomia|bar\b/i, 'gastronomia'],
  [/feira|artesanato|economia local/i, 'economia'],
  [/universidade|escola|biblioteca/i, 'educacao'],
  [/trilha|mirante/i, 'trilhas'],
]

/**
 * sistema 1 — classificação leve (sem llm) para ingestão mvp.
 * substituível por few-shot / fine-tune na fase poa→rs.
 */
export function classifyUrbanData(raw = {}) {
  const text = `${raw.name || ''} ${raw.category || ''} ${raw.preview || ''} ${raw.address || ''}`
  let mapFilter = 'todos'
  for (const [re, id] of CATEGORY_HINTS) {
    if (re.test(text)) {
      mapFilter = id
      break
    }
  }
  const phase = getActivePhase()
  return {
    mapFilter,
    confidence: raw.source === 'curadoria' ? 0.92 : 0.65,
    phaseId: phase.id,
    model: 'tourio-classify-v0-regex',
  }
}
