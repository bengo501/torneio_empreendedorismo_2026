# zippi — mobilidade urbana inteligente

zippi conecta pessoas à cidade: essenciais no bairro, cultura para explorar, eventos de hoje e transporte multimodal — tudo em um mapa.

## estrutura do repositório

```
frontend/          # react + vite + leaflet (pwa)
backend/           # api node (express) + funções vercel
api/               # entrada serverless vercel → backend
docs/              # documentação
```

| pasta | responsabilidade |
|-------|------------------|
| `frontend/src` | telas, componentes, mapa, chamadas públicas (osm, osrm) |
| `backend/src` | sympla, proxies, lógica com chaves secretas |
| `api/` | handlers vercel (`/api/events`, `/api/health`) |

## rodar localmente

```bash
npm install
```

crie `.env` na **raiz** com `SYMPLA_TOKEN` (copie de `.env.example`).

```bash
# frontend + backend juntos
npm run dev

# ou separado
npm run dev:frontend   # http://localhost:5173/home
npm run dev:backend    # http://localhost:3001
```

## build

```bash
npm run build
```

saída: `frontend/dist`

## deploy na vercel

[docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)

variável de ambiente na vercel: **`SYMPLA_TOKEN`** (não precisa mais de `VITE_SYMPLA_TOKEN` no cliente).

## documentação

| documento | conteúdo |
|-----------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | arquitetura |
| [docs/APIS.md](docs/APIS.md) | integrações |
| [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md) | deploy |
| [docs/CHAVES_API.md](docs/CHAVES_API.md) | chaves de api |

## licença

projeto mvp — torneio empreendedorismo 2026
