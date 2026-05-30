/**
 * Simulated events data for Porto Alegre.
 * In production: integrate with Sympla, prefeitura, cultura.rs.gov.br
 */

export const EVENT_CATS = [
  { id: 'todos',       label: 'Todos',       emoji: '🗓️' },
  { id: 'musica',      label: 'Música',      emoji: '🎵' },
  { id: 'cultura',     label: 'Cultura',     emoji: '🎭' },
  { id: 'feira',       label: 'Feiras',      emoji: '🛍️' },
  { id: 'gastronomia', label: 'Gastro',      emoji: '🍽️' },
  { id: 'esporte',     label: 'Esporte',     emoji: '🏃' },
  { id: 'gratuito',    label: 'Grátis',      emoji: '💚' },
]

export const EVENTS_TODAY = [
  {
    id: 1, emoji: '🎵',
    title: 'Show: Orquestra da OSPA',
    local: 'Usina do Gasômetro',
    bairro: 'Centro Histórico',
    time: '19h30', price: 'Grátis', cat: 'musica',
    lat: -30.0340, lon: -51.2426,
    desc: 'Concerto gratuito ao ar livre com a Orquestra Sinfônica de Porto Alegre.',
    highlight: true,
  },
  {
    id: 2, emoji: '🛍️',
    title: 'Feira Orgânica do Bom Fim',
    local: 'Rua Jandaia s/n',
    bairro: 'Bom Fim',
    time: 'sáb · até 14h', price: 'Grátis', cat: 'feira',
    lat: -30.0330, lon: -51.2033,
    desc: 'Produtos orgânicos, artesanato local e gastronomia da agricultura familiar.',
  },
  {
    id: 3, emoji: '🎨',
    title: 'Exposição: Arte Urbana Sul',
    local: 'MARGS',
    bairro: 'Centro',
    time: 'até 18h', price: 'Grátis', cat: 'cultura',
    lat: -30.0312, lon: -51.2264,
    desc: 'Mostra coletiva de artistas urbanos do Sul do Brasil.',
  },
  {
    id: 4, emoji: '🏃',
    title: 'Corrida da Redenção',
    local: 'Parque da Redenção',
    bairro: 'Bom Fim',
    time: 'dom · 8h', price: 'Grátis', cat: 'esporte',
    lat: -30.0355, lon: -51.2071,
    desc: 'Corrida comunitária com percursos de 5km e 10km. Aberta para todos.',
  },
  {
    id: 5, emoji: '🍷',
    title: 'Festival Gastronômico POA',
    local: 'Mercado Público',
    bairro: 'Centro Histórico',
    time: '12h – 22h', price: 'Entrada livre', cat: 'gastronomia',
    lat: -30.0278, lon: -51.2258,
    desc: 'Gastronomia regional, cervejas artesanais e vinhos da Serra Gaúcha.',
  },
  {
    id: 6, emoji: '🎭',
    title: 'Teatro: O Pequeno Príncipe',
    local: 'Teatro São Pedro',
    bairro: 'Centro',
    time: '15h e 19h', price: 'R$ 20 – 40', cat: 'cultura',
    lat: -30.0299, lon: -51.2274,
    desc: 'Espetáculo infantojuvenil com cenografia imersiva.',
  },
  {
    id: 7, emoji: '🎬',
    title: 'Cine ao Ar Livre',
    local: 'Parque da Redenção',
    bairro: 'Bom Fim',
    time: '20h30', price: 'Grátis', cat: 'cultura',
    lat: -30.0360, lon: -51.2060,
    desc: 'Sessão gratuita de cinema no parque. Traga uma manta!',
    highlight: true,
  },
  {
    id: 8, emoji: '🎸',
    title: 'Noite do Rock — Cidade Baixa',
    local: 'Av. Cidade Baixa',
    bairro: 'Cidade Baixa',
    time: '21h', price: 'R$ 15', cat: 'musica',
    lat: -30.0400, lon: -51.2080,
    desc: 'Palco aberto para bandas locais de rock gaúcho.',
  },
  {
    id: 9, emoji: '☕',
    title: 'Coffee & Design Meeting',
    local: 'Floresta Creative Hub',
    bairro: 'Floresta',
    time: '14h', price: 'Grátis', cat: 'cultura',
    lat: -30.0190, lon: -51.2153,
    desc: 'Encontro mensal da comunidade criativa de Porto Alegre.',
  },
]

/** Eventos em Bento Gonçalves */
export const EVENTS_BENTO = [
  {
    id: 'b1', emoji: '🍷',
    title: 'Festa da Uva',
    local: 'Parque do Imigrante',
    bairro: 'Centro',
    time: 'fev – mar · diário', price: 'Grátis (degustações pagas)', cat: 'gastronomia',
    lat: -29.1750, lon: -51.5120,
    desc: 'Maior festa enogastronômica da Serra Gaúcha.',
    highlight: true,
  },
  {
    id: 'b2', emoji: '🎭',
    title: 'Mostra de Teatro Italiano',
    local: 'Centro Histórico',
    bairro: 'Centro',
    time: 'sáb · 20h', price: 'Grátis', cat: 'cultura',
    lat: -29.1696, lon: -51.5193,
    desc: 'Peças e apresentações sobre a cultura italiana gaúcha.',
  },
  {
    id: 'b3', emoji: '🎵',
    title: 'Concerto no Museu do Vinho',
    local: 'Museu do Vinho',
    bairro: 'Centro',
    time: 'dom · 18h', price: 'R$ 25', cat: 'musica',
    lat: -29.1688, lon: -51.5180,
    desc: 'Música clássica e jazz com degustação de vinhos locais.',
  },
  {
    id: 'b4', emoji: '🛍️',
    title: 'Feira de Produtos Coloniais',
    local: 'Av. Osvaldo Aranha',
    bairro: 'Centro',
    time: 'dom · 9h–14h', price: 'Grátis', cat: 'feira',
    lat: -29.1705, lon: -51.5175,
    desc: 'Queijos, embutidos, vinhos e artesanato da região.',
  },
]

/** @deprecated use EVENTS_BENTO */
export const EVENTS_GRAMADO = EVENTS_BENTO
