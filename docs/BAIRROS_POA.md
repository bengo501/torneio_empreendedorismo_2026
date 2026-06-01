# bairros poa — modelo e análise (mvp)

## modelo genérico

arquivo: `frontend/src/data/poa/neighborhoods.js`

cada bairro na lista `POA_NEIGHBORHOODS`:

| campo | descrição |
|-------|-----------|
| `id` | slug estável (`centro`, `rio-branco`, …) |
| `label` | nome exibido na ui |
| `aliases` | trechos de endereço que identificam o bairro |
| `center` + `radiusKm` | fallback por coordenadas quando o endereço não cita o bairro |

novos bairros: adicionar objeto ao array — os chips em explorar listam todos automaticamente.

lugares normalizados ganham `neighborhoodId` e `neighborhoodLabel` em `normalize.js`.

---

## lista atual (11 bairros)

| id | label | região |
|----|-------|--------|
| centro | centro | núcleo histórico e orla |
| cidade-baixa | cidade baixa | sul do centro, vida noturna |
| floresta | floresta | leste do centro, shopping total |
| independência | independência | eixo gonçalo de carvalho |
| farroupilha | farroupilha | redenção, parque farroupilha |
| rio branco | rio branco | entre bom fim e independência |
| bom fim | bom fim | universitário, redenção |
| santana | santana | ipiranga, planetário ufrgs |
| moinhos de vento | moinhos de vento | parcão, padre chagas |
| bela vista | bela vista | auxiliadora, carlos gomes |
| partenon | partenon | pucrs, ipiranga norte |

---

## análise por bairro

gerada por `buildNeighborhoodCatalog()` — rodar no console após mudar o seed:

```js
import { buildNeighborhoodCatalog } from './src/data/poa/neighborhoodAnalysis.js'
console.log(buildNeighborhoodCatalog())
```

contagens mudam quando endereços em `raw/` citam bairros novos ou aliases são ampliados.

---

## mapa e raio 3 km

- serviço: `frontend/src/services/nearbyPlaces.js`
- gps contínuo: `watchPosition` em `geo.js`
- filtro por bairro: chips na aba explorar · lugares

ver [FEATURES.md](./FEATURES.md) e [CITY_MAPPING.md](./CITY_MAPPING.md).
