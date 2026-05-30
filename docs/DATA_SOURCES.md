# fontes de dados

de onde o zippi obtém cada tipo de informação exibida ao usuário.

## resumo por feature

| feature | fonte principal | fallback | arquivo |
|---------|-----------------|----------|---------|
| localização do usuário | browser geolocation api | porto alegre default | `geo.js` |
| endereço (rua, bairro, cidade) | nominatim reverse | coordenadas brutas | `geo.js` |
| busca de destinos | nominatim search | — | `geo.js` |
| essenciais (farmácia, mercado) | overpass around 3km | nominatim + cidade | `overpass.js` |
| rota no mapa | osrm | linha reta | `geo.js` |
| trânsito simulado | overpass (geometria real) + níveis simulados | dados estáticos poa | `traffic.js` |
| parques e água | overpass | — | `overpass.js` |
| paradas de ônibus | overpass | — | `overpass.js` |
| patinetes/bikes | gbfs | array vazio | `scooters.js` |
| clima | open-meteo | — | `weather.js` |
| lugares explorar | dados curados + osm | `explore.js` | `data/explore.js` |
| eventos hoje | sympla + curadoria local | sympla api (`VITE_SYMPLA_TOKEN`) | `services/sympla.js`, `data/events.js` |
| transporte | cálculo local + deeplinks | — | `services.js`, `deeplinks.js` |
| relatos comunidade | localStorage | — | `community.js` |

---

## dados estáticos (mvp)

enquanto as apis de eventos não estão integradas, o app usa dados curados em:

- `frontend/src/data/explore.js` — lugares culturais, parques, gastronomia
- `frontend/src/data/events.js` — eventos do dia por cidade
- `frontend/src/data/essentials.js` — categorias de serviços essenciais
- `frontend/src/data/services.js` — operadores de transporte e fórmulas de preço

### cidades disponíveis

| cidade | id | lugares | eventos |
|--------|-----|---------|---------|
| porto alegre | `poa` | `EXPLORE_PLACES` | `EVENTS_TODAY` |
| bento gonçalves | `bentogoncalves` | `EXPLORE_BENTO` | `EVENTS_BENTO` |

---

## dados dinâmicos (tempo real)

### geolocalização

```
navigator.geolocation.getCurrentPosition()
  → reverseGeocodeDetailed(lat, lon)
  → { city, neighborhood, street, label }
```

### essenciais próximos

```
overpass: node/way[amenity=pharmacy](around:3000,lat,lon)
  → ordena por distância haversine
  → exibe top 8
```

### rota

```
osrm: /route/v1/driving/{origin};{destination}
  → polyline + distanceKm + durationMin
  → desenha no mapa + calcula opções de transporte
```

### clima

```
open-meteo: latitude, longitude, current_weather
  → temperatura, emoji, alerta de chuva
  → AlertsDock se isSevereWeather()
```

---

## cache

| tipo | onde | ttl |
|------|------|-----|
| overpass (ruas, natureza, pois) | sessionStorage | 24h |
| chave | `zippi_osm_{tipo}_{bbox}` | — |

---

## qualidade e localidade

regras implementadas para garantir dados da mesma cidade:

1. nominatim sempre com `countrycodes=br`
2. essenciais: overpass `around:3000m` antes de nominatim
3. nominatim fallback inclui nome da cidade no query
4. `POA_DEFAULT` usado se gps ainda não carregou
5. explore/events filtrados por `exploreCity` selecionada
