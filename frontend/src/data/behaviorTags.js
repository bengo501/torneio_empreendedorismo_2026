/**
 * Tags de comportamento do usuário para recomendação da IA.
 * Cada tag pertence a uma categoria e tem um emoji para exibição.
 * As tags selecionadas são persistidas em localStorage.
 */

export const BEHAVIOR_CATEGORIES = [
  {
    id: 'budget',
    label: 'Orçamento',
    tags: [
      'gosto de lugares baratos',
      'prefiro lugares gratuitos',
      'quero economizar',
    ],
  },
  {
    id: 'vibe',
    label: 'Vibe',
    tags: [
      'gosto de lugares calmos',
      'gosto de lugares movimentados',
      'gosto de lugares instagramáveis',
      'quero conhecer lugares escondidos',
      'gosto de lugares tradicionais',
      'prefiro novidades',
      'quero evitar lugares muito cheios',
    ],
  },
  {
    id: 'space',
    label: 'Espaço',
    tags: [
      'prefiro lugares ao ar livre',
      'gosto de lugares fechados',
      'gosto de explorar bairros novos',
    ],
  },
  {
    id: 'mobility',
    label: 'Mobilidade',
    tags: [
      'gosto de caminhar',
      'prefiro evitar caminhar muito',
      'uso transporte público',
      'uso carro',
      'uso bicicleta',
    ],
  },
  {
    id: 'time',
    label: 'Horário',
    tags: [
      'gosto de sair à noite',
      'prefiro sair de dia',
    ],
  },
  {
    id: 'interests',
    label: 'Interesses',
    tags: [
      'gosto de eventos culturais',
      'gosto de comer bem',
      'gosto de apoiar pequenos negócios',
      'gosto de descobrir cafés',
      'gosto de feiras de rua',
    ],
  },
  {
    id: 'company',
    label: 'Companhia',
    tags: [
      'gosto de programas em família',
      'gosto de sair com amigos',
      'gosto de sair sozinho',
      'gosto de lugares pet friendly',
    ],
  },
  {
    id: 'needs',
    label: 'Necessidades',
    tags: [
      'preciso de acessibilidade',
    ],
  },
]

/** Flat list of all tags (convenience) */
export const ALL_BEHAVIOR_TAGS = BEHAVIOR_CATEGORIES.flatMap(c => c.tags)

const STORAGE_KEY = 'zippi_behavior_tags'

/** Load selected tags from localStorage */
export function loadSelectedTags() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // filter out tags that no longer exist
    return parsed.filter(t => ALL_BEHAVIOR_TAGS.includes(t))
  } catch {
    return []
  }
}

/** Save selected tags to localStorage */
export function saveSelectedTags(tags) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags))
}
