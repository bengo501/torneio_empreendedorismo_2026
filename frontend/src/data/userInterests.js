/** tags de interesse — onboarding, perfil e recomendações da ia */

export const ONBOARDING_INTERESTS = [
  {
    id: 'musica',
    category: 'Música',
    tags: ['Rock', 'Pagode', 'Samba', 'Funk', 'Eletrônica', 'Jazz', 'MPB', 'Rap', 'Trap', 'Indie', 'Sertanejo', 'Reggae'],
  },
  {
    id: 'saudeBemEstar',
    category: 'Saúde e bem-estar',
    tags: ['Academias', 'Parques', 'Trilhas', 'Corrida', 'Caminhada', 'Yoga', 'Bike', 'Skate', 'Alimentação saudável', 'Meditação', 'Academia ao ar livre'],
  },
  {
    id: 'cultura',
    category: 'Cultura',
    tags: ['Museus', 'Ateliês', 'Teatro', 'Cinema', 'Galerias', 'Exposições', 'Arte urbana', 'Fotografia', 'Literatura', 'História local', 'Cultura gaúcha'],
  },
  {
    id: 'gastronomia',
    category: 'Gastronomia',
    tags: ['Mexicana', 'Churrasco', 'Xis', 'Sushi', 'Pizza', 'Hambúrguer', 'Café', 'Brunch', 'Comida vegana', 'Comida italiana', 'Doces', 'Food truck'],
  },
  {
    id: 'noturno',
    category: 'Vida noturna',
    tags: ['Bares', 'Restaurantes', 'Baladas', 'Pubs', 'Música ao vivo', 'Karaokê', 'Happy hour', 'Drinks', 'Cerveja artesanal', 'Stand-up', 'Rolê tranquilo', 'Rolê agitado'],
  },
  {
    id: 'feiras',
    category: 'Feiras',
    tags: ['Artesanato', 'Brechó', 'Feira orgânica', 'Moda autoral', 'Produtos locais', 'Antiguidades', 'Feira gastronômica', 'Vinis', 'Livros usados', 'Plantas', 'Economia criativa'],
  },
]

export const BEHAVIOR_TAGS = [
  'gosto de lugares baratos',
  'prefiro lugares gratuitos',
  'gosto de lugares calmos',
  'gosto de lugares movimentados',
  'prefiro lugares ao ar livre',
  'gosto de lugares fechados',
  'gosto de lugares instagramáveis',
  'quero conhecer lugares escondidos',
  'gosto de lugares tradicionais',
  'prefiro novidades',
  'gosto de caminhar',
  'prefiro evitar caminhar muito',
  'uso transporte público',
  'uso carro',
  'uso bicicleta',
  'gosto de sair à noite',
  'prefiro sair de dia',
  'gosto de eventos culturais',
  'gosto de comer bem',
  'quero economizar',
  'gosto de apoiar pequenos negócios',
  'gosto de programas em família',
  'gosto de sair com amigos',
  'gosto de sair sozinho',
  'gosto de lugares pet friendly',
  'preciso de acessibilidade',
  'quero evitar lugares muito cheios',
  'gosto de explorar bairros novos',
  'gosto de descobrir cafés',
  'gosto de feiras de rua',
]

export const TRANSPORT_APP_OPTIONS = [
  { id: 'uber', label: 'Uber', emoji: '🚗' },
  { id: '99', label: '99', emoji: '🟡' },
  { id: 'inDriver', label: 'inDriver', emoji: '💚' },
  { id: 'whoosh', label: 'Whoosh', emoji: '🛴' },
  { id: 'lime', label: 'Lime', emoji: '💚' },
  { id: 'yellow', label: 'Tembici / Yellow', emoji: '🚲' },
  { id: 'onibus', label: 'Ônibus / transporte público', emoji: '🚌' },
  { id: 'a_pe', label: 'A pé / caminhada', emoji: '🚶' },
]

/** mapa categoria → tags gerais + específicas (ia) */
export const USER_INTEREST_TAGS = {
  musica: {
    label: 'Música',
    generalTags: ['música ao vivo', 'shows', 'festivais', 'baladas', 'bares com música', 'música gratuita', 'música independente', 'música local'],
    specificTags: ['rock', 'indie', 'pop', 'mpb', 'pagode', 'samba', 'funk', 'eletrônica', 'jazz', 'rap', 'sertanejo', 'reggae', 'acústico', 'dj set'],
  },
  saudeBemEstar: {
    label: 'Saúde e bem-estar',
    generalTags: ['vida saudável', 'atividade física', 'bem-estar', 'relaxamento', 'esporte', 'natureza', 'autocuidado', 'ar livre'],
    specificTags: ['academias', 'parques', 'trilhas', 'corrida', 'caminhada', 'yoga', 'bike', 'skate', 'alimentação saudável', 'meditação'],
  },
  cultura: {
    label: 'Cultura',
    generalTags: ['arte', 'história', 'patrimônio', 'exposições', 'experiências culturais', 'cultura local', 'educação', 'criatividade'],
    specificTags: ['museus', 'galerias', 'teatro', 'cinema', 'arte urbana', 'fotografia', 'literatura', 'cultura gaúcha', 'história local'],
  },
  gastronomia: {
    label: 'Gastronomia',
    generalTags: ['restaurantes', 'cafés', 'bares', 'comida local', 'experiência gastronômica', 'comida barata', 'brunch', 'delivery'],
    specificTags: ['churrasco', 'xis', 'sushi', 'pizza', 'hambúrguer', 'café', 'comida vegana', 'food truck', 'comida gaúcha', 'cervejaria'],
  },
  noturno: {
    label: 'Vida noturna',
    generalTags: ['noite', 'rolê noturno', 'bares', 'baladas', 'shows', 'música ao vivo', 'eventos noturnos'],
    specificTags: ['bar', 'pub', 'balada', 'happy hour', 'drinks', 'música ao vivo', 'stand-up', 'rooftop', 'rolê tranquilo', 'rolê agitado'],
  },
  feiras: {
    label: 'Feiras e economia local',
    generalTags: ['feiras', 'economia local', 'pequenos empreendedores', 'produtores locais', 'artesanato', 'compras locais'],
    specificTags: ['artesanato', 'brechó', 'feira orgânica', 'moda autoral', 'produtos locais', 'feira gastronômica', 'plantas'],
  },
}

/** tags selecionadas → lista plana para ia */
export function flattenInterestTags(selectedInterests = {}, selectedBehavior = []) {
  const tags = new Set(selectedBehavior.map(t => t.toLowerCase()))
  for (const [catId, chipTags] of Object.entries(selectedInterests)) {
    const meta = USER_INTEREST_TAGS[catId]
    if (meta) meta.generalTags.forEach(t => tags.add(t))
    ;(chipTags || []).forEach(t => tags.add(t.toLowerCase()))
  }
  return [...tags]
}

export function allSelectedInterestChips(selectedInterests = {}) {
  return Object.values(selectedInterests).flat()
}
