# arquitetura técnica — zippi

## monorepo

```
zippi/
├── frontend/                 # app react (cliente)
│   └── src/
│       ├── screens/          # home, login, perfil…
│       ├── components/       # mapa, cards, docks
│       ├── services/         # geo, overpass, clima (público no browser)
│       ├── data/             # mocks e curadoria local
│       └── context/
├── backend/                  # api node
│   └── src/
│       ├── server.js         # express (dev local)
│       ├── routes/           # /api/events, /api/sympla
│       └── services/         # sympla (chave secreta)
├── api/                      # serverless vercel (reexporta backend/api)
└── docs/
```

## visão geral

```
┌────────────────── frontend (browser) ──────────────────┐
│  home.jsx → zippimap, sheet, serviços osm/osrm         │
│  sympla.js → fetch /api/events (sem chave no bundle)   │
└────────────────────────┬───────────────────────────────┘
                         │ /api/*
┌────────────────────────▼───────────────────────────────┐
│  backend (express local | vercel serverless)           │
│  symplaService → api.sympla.com.br + SYMPLA_TOKEN      │
└────────────────────────────────────────────────────────┘
```

## fluxo de dados

1. **localização**: geolocation → nominatim → `origin`
2. **busca**: nominatim + photon fallback (`frontend/src/services/geo.js`)
3. **essenciais**: overpass `around` → nominatim (`essentialsSearch.js`)
4. **eventos**: `GET /api/events?city=&state=` → backend sympla → merge com `data/events.js`
5. **rota**: osrm → polyline → animação cinemática
6. **transporte**: ranking local + deeplinks para apps

## serviços por camada

| camada | serviço | onde |
|--------|---------|------|
| frontend | nominatim, overpass, osrm, open-meteo | `frontend/src/services/` |
| frontend | deeplinks uber/99/whoosh | `deeplinks.js` |
| backend | sympla | `backend/src/services/symplaService.js` |

## cache

- overpass/natureza: `sessionStorage`, ttl 24h no cliente

## deploy

- **frontend**: build estático `frontend/dist`
- **backend**: funções em `/api` na vercel + variável `SYMPLA_TOKEN`

ver [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)
