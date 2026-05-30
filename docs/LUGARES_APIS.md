# lugares próximos sem google maps

o zippi **já não depende do google**. essenciais e explorar usam dados abertos (openstreetmap). este guia explica a api uber que você encontrou e alternativas **sem cartão de crédito**.

---

## o que a api uber do link faz (e o que não faz)

documentação: [business-trips receipt get](https://developer.uber.com/docs/businesses/receipts/references/api/v1/business-trips-trip_id-receipt-get)

| serve para | não serve para |
|------------|----------------|
| uber for **business** (empresas) | listar farmácias/restaurantes perto |
| baixar **recibo** de uma corrida já feita (`trip_id`) | preço estimado antes da corrida |
| integração de **despesas corporativas** | abrir o app uber com destino (isso é deeplink, já no zippi) |

para o torneio, o caminho uber continua sendo `src/services/deeplinks.js` (abrir uber/99 com destino). api de recibo só faria sentido se o zippi fosse um painel de reembolso de viagens de empresa.

outras apis uber (ride, products, estimates) exigem **parceria** aprovada — não são self-service como sympla.

---

## stack atual do zippi (grátis, sem cartão)

| camada | serviço | arquivo | uso |
|--------|---------|---------|-----|
| pois no raio | overpass | `overpass.js`, `essentialsSearch.js` | farmácia, mercado, restaurante, saúde no mapa osm |
| busca por texto | nominatim | `geo.js` | endereços e nomes com filtro brasil + viewbox |
| rotas | osrm | `geo.js` | distância e tempo |
| fallback geocode | photon (komoot) | `geo.js` | quando nominatim retorna pouco |

**recomendação:** priorize overpass para “perto de mim”; nominatim/photon para busca livre na aba ir.

---

## alternativas ao google (sem cartão)

### 1. openstreetmap (já integrado) — melhor custo zero

- **overpass** — consulta pois por tipo (`amenity=pharmacy`, `shop=supermarket`, etc.)
- **nominatim** — geocoding; respeitar 1 req/s; não abuse
- **osrm** — rotas
- **vantagem:** sem cadastro, sem limite de billing
- **limite:** sem avaliações, fotos, horário de funcionamento confiável

### 2. photon (komoot) — fallback leve

- **url:** `https://photon.komoot.io/api/`
- **chave:** nenhuma
- **dados:** osm, busca rápida com bias `lat`/`lon`
- **no zippi:** fallback automático em `searchPlaces` quando nominatim retorna poucos resultados

### 3. geoapify — melhor “substituto google” sem cartão

- **cadastro:** https://www.geoapify.com/ (e-mail, **sem cartão** no plano free)
- **free:** ~3.000 créditos/dia
- **apis:** places (categorias: restaurant, pharmacy…), geocoding, routing, isochrones
- **variável:** `VITE_GEOAPIFY_API_KEY`
- **atribuição:** obrigatória no mapa (“powered by geoapify” + osm)
- **exemplo places:** `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:lon,lat,radius&apiKey=`

### 4. locationiq

- **cadastro:** https://locationiq.com/
- **free:** ~5.000 requisições/dia (plano free)
- **compatível** com api estilo nominatim (fácil trocar url em `geo.js`)
- **variável sugerida:** `VITE_LOCATIONIQ_TOKEN`

### 5. openrouteservice (heidelberg)

- **cadastro:** https://openrouteservice.org/dev/#/signup
- **free:** chave gratuita com cota diária
- **apis:** geocode, directions, **pois** (explore categories)
- **variável:** `VITE_ORS_API_KEY`
- bom para rotas + pois num só provedor

### 6. foursquare places api

- **cadastro:** https://foursquare.com/developers/
- **free tier:** cota mensal para startups (ver site atual)
- **vantagem:** nomes comerciais, categorias, às vezes fotos
- **desvantagem:** cobertura variável fora de capitais

### 7. ticketmaster / sympla

- só **eventos**, não farmácias — sympla já integrado

---

## comparativo rápido

| api | cartão? | pois perto | reviews | brasil |
|-----|---------|------------|---------|--------|
| osm overpass | não | excelente | não | bom |
| nominatim | não | médio | não | bom |
| photon | não | médio | não | bom |
| geoapify | não no free | bom | limitado | bom |
| locationiq | não no free | bom | não | bom |
| openrouteservice | não | bom | não | bom |
| google places | sim (billing) | excelente | sim | excelente |
| uber business receipt | parceria b2b | não | n/a | n/a |

---

## o que pedir no torneio (ordem prática)

1. **nada extra** — melhorar queries overpass (já feito em essenciais)
2. **geoapify** — se quiser categorias tipo “restaurant” com filtro de raio sem montar query osm
3. **locationiq ou ors** — se nominatim/photon ficarem lentos ou bloqueados
4. **uber** — só deeplink; api de recibo não agrega valor ao app de mobilidade urbana

---

## transporte (lembrando)

| app | sem cartão / sem parceria |
|-----|---------------------------|
| uber, 99, indriver | deeplink (`deeplinks.js`) |
| whoosh, lime | gbfs ou parceria (`scooters.js`) |
| ônibus poa | gtfs público (futuro) |

---

## referências

- geoapify places: https://www.geoapify.com/places-api/
- photon: https://github.com/komoot/photon
- overpass wiki: https://wiki.openstreetmap.org/wiki/Overpass_API
- uber business (não é mobility consumer): https://developer.uber.com/docs/businesses
