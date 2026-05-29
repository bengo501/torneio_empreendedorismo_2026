# arquitetura técnica — zippi

## visão geral

```
┌────────────────────────────────────────────────────────────┐
│                        home.jsx                            │
│  (orquestra estado, chama serviços, passa props ao mapa)  │
└─────────────┬──────────────────────────────┬──────────────┘
              │                              │
    ┌─────────▼──────────┐       ┌───────────▼───────────┐
    │   zippimap.jsx     │       │     sheet + docks      │
    │  (leaflet, layers) │       │ (busca, transport,     │
    │  markers, rotas,   │       │  essenciais, explorar) │
    │  trânsito, natureza│       └───────────────────────┘
    │  ônibus, patinetes │
    └────────────────────┘
```

## fluxo de dados

1. **localização**: `getCurrentPosition()` (browser geolocation api) → `reverseGeocodeDetailed()` (nominatim) → `origin` state
2. **busca**: input → `searchPlaces()` (nominatim, `countrycodes=br`, viewbox 0.5°) → resultados
3. **essenciais**: click → `searchNearbyAmenities()` (overpass, `around:3000m`) → fallback: nominatim + cidade
4. **rota**: destination set → `fetchRoute()` (osrm) → polyline → `cinematicRoute()` (animação)
5. **transporte**: rota ativa → `getRankedServices()` (cálculo local) → `ServiceCard` → `openService()` (deeplink)
6. **ônibus**: rota ativa → `fetchBusStops()` (overpass) → markers no mapa
7. **patinetes**: rota ativa → `fetchNearbyScooters()` (gbfs) → markers no mapa
8. **clima**: origin set → `getWeather()` (open-meteo) → alertas

## serviços externos

| serviço        | url                                  | autenticação | uso                          |
|----------------|--------------------------------------|--------------|------------------------------|
| nominatim      | nominatim.openstreetmap.org          | nenhuma      | geocodificação, busca        |
| overpass       | overpass-api.de/api/interpreter      | nenhuma      | poi, ruas, ônibus, natureza  |
| osrm           | router.project-osrm.org              | nenhuma      | cálculo de rota              |
| open-meteo     | api.open-meteo.com                   | nenhuma      | clima atual                  |
| carto tiles    | basemaps.cartocdn.com                | nenhuma      | tiles do mapa                |
| gbfs whoosh    | api.whoosh.bike                      | api key      | patinetes whoosh             |
| gbfs lime      | data.lime.bike                       | api key      | bikes/patinetes lime         |

## cache

- dados osm (ruas, natureza, poi) são cacheados em `sessionStorage` com ttl de 24h
- chave de cache inclui bbox/coordenadas e tipo de query
- cache evita requisições repetidas ao overpass (rate limiting)

## glass ui

todas as superfícies seguem o design system em `src/styles/glass.js`:
- **primary**: sheet principal, modais (`0.52` opacity dark / `0.45` light)
- **secondary**: inputs, itens de lista
- **pill**: botões de ação flutuantes
- **dock**: notificações e alertas superiores
- blur: `36px`, saturação: `200%`

## animação cinemática (pokémon go style)

ao selecionar destino, `mapRef.current.cinematicRoute()` executa:
1. `flyTo(dest, 17)` — 0.7s, rápido
2. `flyToBounds(routeBounds)` — 1.6s, suave
3. `flyTo(origin, 16)` — 0.7s, rápido

o flag `cinematicActiveRef` suprime o `fitBounds` automático do `ZippiMap`
durante a sequência para evitar conflito de animações.
