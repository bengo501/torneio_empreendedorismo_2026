# features

descrição detalhada de cada funcionalidade do zippi.

## mapa interativo

- base leaflet.js com tiles carto (dark/light)
- pin do usuário: esfera verde 3d pulsante
- pins de explorar e eventos sempre visíveis
- camada de trânsito com geometria real (overpass + simulação)
- parques (verde) e água (azul) via overpass — sem interação
- paradas de ônibus quando rota ativa
- patinetes/bikes via gbfs quando rota ativa
- animação cinemática ao selecionar destino (estilo pokémon go)
- botão centralizar: toggle zoom out/in

**arquivos:** `ZippiMap.jsx`, `Home.jsx`

---

## aba ir (navegação)

- busca de destino com autocomplete (nominatim)
- múltiplas paradas (até 3)
- seleção no mapa
- cálculo de rota via osrm
- recomendação de transporte com filtros (equilibrado, barato, rápido, eco)
- cards simplificados com botão "abrir" → deeplink para app
- assistente de voz (chrome/edge; firefox usa texto)

**arquivos:** `Home.jsx`, `ServiceCard.jsx`, `deeplinks.js`

---

## aba explorar

- saudação personalizada: "boa tarde, joão! porto alegre te espera!"
- seletor de cidade: porto alegre | bento gonçalves
- ao trocar cidade: mapa voa até a cidade selecionada
- filtros por categoria: cultura, parques, gastronomia, etc.
- filtros por bairro (11 bairros poa: centro, rio branco, partenon, bom fim, …)
- lugares em raio de 3 km com gps, lista atualiza ao se mover
- lista + pins no mapa
- eventos gratuitos e pagos identificados
- **sugerir lugar** — contribuição da comunidade (mvp local; ver [CONTRIBUICAO_USUARIOS.md](./CONTRIBUICAO_USUARIOS.md))

**arquivos:** `Home.jsx`, `explore.js`, `nearbyPlaces.js`, `neighborhoods.js`, `SuggestPlaceModal.jsx`

---

## aba hoje (eventos)

- eventos do dia filtrados por categoria
- toggle rápido poa / bento gonçalves
- cards com preço (grátis destacado)
- navegar para evento → aba ir com destino preenchido

**arquivos:** `Home.jsx`, `events.js`, `EventCard`

---

## aba essenciais

- farmácias, mercados, restaurantes, saúde
- busca overpass `around:3000m` (bairro)
- fallback nominatim com cidade no query
- nunca retorna resultados de outro estado

**arquivos:** `Home.jsx`, `essentials.js`, `overpass.js`

---

## docks superiores

### notifications dock
- rotação automática: "perto de você" + eventos
- um item por vez com fade

### alerts dock
- clima severo (open-meteo)
- trânsito crítico (nível severe)
- condicional — só aparece quando relevante

**arquivos:** `NotificationsDock.jsx`, `AlertsDock.jsx`

---

## header e localização

- cidade em destaque no topo
- bairro · rua · temperatura abaixo
- botões: tema, pin/aviso, centralizar, perfil
- gps com fallback para porto alegre

---

## comunidade

- criar pin de aviso no mapa (modo pin)
- upvote em relatos
- dados em localStorage (mvp)

**arquivos:** `CommunityModal.jsx`, `community.js`

---

## perfil

- avatar, nome, telefone, cidade
- impacto: corridas, co₂, economia
- preferências: tema, notificações
- histórico de viagens

**arquivos:** `Profile.jsx`, `History.jsx`

---

## assistente de voz

- modo chat: busca destino por voz
- modo guia (botão ia): explora cidade
- web speech api (pt-br)

**arquivos:** `VoiceAssistant.jsx`

---

## glass ui

- superfícies translúcidas estilo ios
- blur 36px, saturação 200%
- variantes: primary, secondary, pill, dock

**arquivos:** `styles/glass.js`
