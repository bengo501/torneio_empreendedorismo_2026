# apis e integrações

documentação de todas as apis que o zippi utiliza ou planeja utilizar.

guia de chaves e parcerias: [CHAVES_API.md](./CHAVES_API.md)

lugares próximos sem google: [LUGARES_APIS.md](./LUGARES_APIS.md)

## status das integrações

| api | status | uso no zippi |
|-----|--------|--------------|
| nominatim (osm) | ativo | geocodificação, busca de endereços |
| overpass (osm) | ativo | pois, parques, ônibus, essenciais |
| osrm | ativo | cálculo de rotas |
| open-meteo | ativo | clima local |
| carto tiles | ativo | mapa base |
| gbfs (whoosh/lime) | parcial | patinetes e bikes |
| sympla | ativo (backend) | eventos via `GET /api/events` |
| ticketmaster | planejado | shows e eventos pagos |
| bilhetin | planejado | ingressos locais |
| google maps places | planejado | sync pois · ver [ATUALIZACAO_LUGARES.md](./ATUALIZACAO_LUGARES.md) |
| instagram graph api | planejado | posts parceiros · ver [INGESTAO_CONTEUDO_WEB.md](./INGESTAO_CONTEUDO_WEB.md) |
| x api v2 | planejado | agenda social · ver [INGESTAO_CONTEUDO_WEB.md](./INGESTAO_CONTEUDO_WEB.md) |
| rss / scraping blogs | planejado | notícias e eventos · backend |
| uber api | planejado | preços em tempo real |
| 99 api | planejado | preços em tempo real |
| indriver api | planejado | preços em tempo real |
| gtfs (trensurb) | backlog | metrô porto alegre |

---

## geolocalização e mapas

### nominatim (openstreetmap)

- **url:** `https://nominatim.openstreetmap.org`
- **autenticação:** nenhuma (respeitar rate limit: 1 req/s)
- **funções:** `reverseGeocodeDetailed`, `searchPlaces`
- **arquivo:** `src/services/geo.js`
- **parâmetros importantes:**
  - `countrycodes=br` — restringe ao brasil
  - `viewbox` + `bounded` — prioriza resultados locais
  - `accept-language=pt-BR`

### overpass api

- **url:** `https://overpass-api.de/api/interpreter`
- **autenticação:** nenhuma
- **funções:** `fetchHighwayWays`, `fetchNatureFeatures`, `searchNearbyAmenities`, `fetchBusStops`
- **arquivo:** `src/services/overpass.js`
- **cache:** sessionStorage, ttl 24h

### osrm (open source routing machine)

- **url:** `https://router.project-osrm.org`
- **autenticação:** nenhuma (instância pública)
- **função:** `fetchRoute`
- **retorno:** polyline geojson, distância, duração

### carto basemaps

- **dark:** `basemaps.cartocdn.com/dark_all`
- **light:** `basemaps.cartocdn.com/rastertiles/voyager`
- **uso:** tiles do leaflet em `ZippiMap.jsx`

---

## clima

### open-meteo

- **url:** `https://api.open-meteo.com/v1/forecast`
- **autenticação:** nenhuma
- **função:** `getWeather`, `isSevereWeather`
- **arquivo:** `src/services/weather.js`
- **dados:** temperatura, probabilidade de chuva, código wmo

---

## transporte

### deeplinks (apps nativos)

- **arquivo:** `src/services/deeplinks.js`
- **apps suportados:** uber, 99, indriver, whoosh, lime, tembici/yellow
- **fluxo:** tenta abrir app nativo → fallback web → loja de apps

### gbfs (general bikeshare feed specification)

- **arquivo:** `src/services/scooters.js`
- **operadores:** whoosh, lime, tembici
- **status:** estrutura pronta; feeds públicos exigem api key

---

## eventos

### sympla

- **url:** `https://api.sympla.com.br` (proxy dev: `/api/sympla`)
- **autenticação:** header `s_token` — variável `SYMPLA_TOKEN` no backend (ver `.env.example`)
- **arquivo:** `backend/src/services/symplaService.js` — cliente: `frontend/src/services/sympla.js`
- **endpoints tentados:** `/partners/events?city=&state=` e `/public/v1.5.1/events` (filtro por cidade no cliente)
- **fallback:** `src/data/events.js` quando sem token ou api vazia
- **cors:** proxy no `vite.config.js` (dev) e rewrite `/api/sympla` no `vercel.json` (produção)

### ticketmaster / bilhetin

- **uso:** shows pagos, teatros, festivais
- **integração:** busca por cidade + filtro gratuito/pago

### portais locais / jornais

- **fontes:** prefeitura, cultura.rs.gov.br, zero hora, g1 rs
- **método:** scraping ou rss (requer backend)

---

## pois comerciais (planejado)

### google maps places api

- **uso:** restaurantes, farmácias, supermercados com avaliações
- **alternativa gratuita:** overpass + nominatim (já em uso)
- **quando usar google:** dados enriquecidos (horário, fotos, reviews)

---

## infraestrutura futura (backend)

para produção, recomenda-se um backend próprio que:

1. centralize chamadas às apis (evita rate limits no cliente)
2. faça cache distribuído (redis)
3. agregue eventos de múltiplas fontes
4. exponha endpoint `/api/city/{slug}/map` com todos os dados da cidade

```
cliente (react) → api zippi (node/python) → nominatim / overpass / sympla / ...
```
