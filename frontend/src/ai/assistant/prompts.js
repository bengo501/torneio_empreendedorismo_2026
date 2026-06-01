import { getActivePhase } from '../config/trainingPhases.js'

/**
 * sistema 3 — prompts base (orquestrador llm futuro).
 */
export function buildSystemPrompt({ city = 'Porto Alegre', userName = '' } = {}) {
  const phase = getActivePhase()
  return [
    'você é o copiloto urbano tourio.',
    `fase de conhecimento: ${phase.label} (${phase.id}).`,
    `cidade ativa: ${city}.`,
    userName ? `usuário: ${userName}.` : '',
    'responda em português, frases curtas, sem inventar endereços.',
    'priorize lugares do knowledge base e distância até 3 km quando houver gps.',
    'se não souber, diga que ainda não há dado curado para o local.',
  ].filter(Boolean).join('\n')
}

export const ASSISTANT_TOOLS_STUB = [
  { name: 'focus_place', description: 'centralizar mapa em um lugar' },
  { name: 'filter_category', description: 'filtrar explorar por categoria' },
  { name: 'open_route', description: 'iniciar rota até destino' },
]
