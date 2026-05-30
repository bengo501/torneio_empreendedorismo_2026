# deploy na vercel

monorepo: **frontend** (estático) + **api** (serverless na raiz).

## variáveis de ambiente

| nome | onde usar |
|------|-----------|
| `SYMPLA_TOKEN` | backend / serverless (obrigatório para eventos sympla) |

**não** use mais `VITE_SYMPLA_TOKEN` — a chave ficou só no servidor.

## passos

1. importe o repo em [vercel.com/new](https://vercel.com/new)
2. confirme:
   - build: `npm run build`
   - output: `frontend/dist`
   - install: `npm install`
3. adicione `SYMPLA_TOKEN` em environment variables
4. deploy → `https://<projeto>.vercel.app/home`

## rotas

| rota | destino |
|------|---------|
| `/api/events` | `api/events.js` (serverless) |
| `/api/health` | `api/health.js` |
| `/home`, etc. | `frontend/dist/index.html` |

## desenvolvimento local

```bash
npm install
# .env na raiz com SYMPLA_TOKEN=
npm run dev
```

frontend: `:5173` — proxy `/api` → backend `:3001`
