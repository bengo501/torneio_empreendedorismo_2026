# organização do projeto — tourio

guia para desenvolvedores: estrutura do monorepo, convenções, fluxo git, testes, variáveis de ambiente e receitas para adicionar cidade ou tela.

---

## visão do monorepo

```
tourio/  (package name interno: zippi — migração gradual para tourio)
├── frontend/                 # react 18 + vite + leaflet (pwa)
│   ├── src/
│   │   ├── screens/          # rotas/páginas
│   │   ├── components/       # ui reutilizável
│   │   ├── services/         # apis cliente (geo, overpass, sympla fetch)
│   │   ├── data/             # mocks, curadoria, configs estáticos
│   │   ├── context/          # UserContext, ThemeContext
│   │   └── styles/
│   ├── public/
│   ├── vite.config.js        # proxy /api → localhost:3001
│   └── package.json          # name: zippi-frontend
├── backend/                  # express node
│   └── src/
│       ├── server.js
│       ├── routes/
│       └── services/
├── api/                      # entry vercel serverless
├── docs/                     # documentação
├── package.json              # workspaces root
├── vercel.json               # rewrites produção
└── .env.example
```

**workspaces npm:** root orquestra `frontend` e `backend` via `npm run dev`.

---

## convenções de pastas

### frontend/src/screens/

uma tela = uma rota principal. exemplos:
- `Home.jsx` — mapa e abas principais
- `Onboarding.jsx` — fluxo inicial
- `Profile.jsx`, `ProfileInfo.jsx` — perfil usuário
- `Login.jsx`, `Splash.jsx`, `Loading.jsx`

**regra:** screens compõem components; não colocar lógica de api pesada inline — extrair para `services/`.

### frontend/src/components/

componentes reutilizáveis sem rota própria:
- `ZippiMap.jsx` — mapa leaflet
- `VoiceAssistant.jsx` — stt + parser
- `ServiceCard.jsx`, `PlacePreviewSheet.jsx`
- docks: `AlertsDock.jsx`, `NotificationsDock.jsx`

**regra:** props explícitas; evitar dependência circular com screens.

### frontend/src/services/

integrações externas e lógica sem ui:
- `geo.js`, `overpass.js`, `weather.js`
- `deeplinks.js`, `scooters.js`, `sympla.js`
- `community.js`, `essentialsSearch.js`
- `poaMapLayers.js`, `osmGeometry.js`

**regra:** funções puras quando possível; cache documentado no topo do arquivo.

### frontend/src/data/

dados estáticos e curadoria:
- `poa/` — lugares porto alegre por categoria
- `explore.js`, `events.js` — legado multi-cidade
- `interestTree.js`, `userInterests.js`
- `services.js` — operadores transporte

**regra:** todo lugar novo passa por schema em `poa/normalize.js` (ver [DADOS_URBANOS_MAPA.md](./DADOS_URBANOS_MAPA.md)).

### backend/src/

- `server.js` — express app, cors, mount routes
- `routes/events.js` — proxy sympla
- `services/symplaService.js` — cliente api sympla

---

## convenções de nomenclatura

| tipo | convenção | exemplo |
|------|-----------|---------|
| componentes react | PascalCase.jsx | `ZippiMap.jsx` |
| services/utils | camelCase.js | `overpass.js` |
| constantes export | UPPER_SNAKE | `POA_BBOX`, `EXPLORE_PLACES` |
| ids cidade | lowercase slug | `poa`, `bentogoncalves` |
| branches git | tipo/descricao-curta | `feat/gtfs-trensurb` |
| commits | imperativo, português ou inglês consistente | `adiciona cache overpass poa` |
| issues | tourio-NNN prefix | `[tourio-201] gtfs trensurb` |

**idioma:** ui e docs em português; código (nomes variáveis) em inglês.

---

## fluxo git

### branches

- `main` — produção estável
- `develop` — integração (opcional; se não existir, usar main + feature branches)
- `feat/*`, `fix/*`, `docs/*`, `chore/*`

### pull request

1. branch a partir de `main`
2. commits pequenos e focados
3. pr com descrição: o quê, por quê, como testar
4. link issue `closes tourio-XXX`
5. 1 approval mínimo (ou self-review em solo dev com checklist)
6. squash merge preferido

### o que não commitar

- `.env` com tokens
- `node_modules/`, `dist/`
- credenciais sympla, google, uber

---

## estratégia de testes

**estado atual:** testes manuais; automatização no backlog (tourio-601).

### pirâmide alvo

| camada | ferramenta | escopo |
|--------|------------|--------|
| unit | vitest | normalize.js, confidence, parsers voz |
| integration | vitest + mock fetch | overpass, sympla service |
| e2e | playwright | fluxo onboarding → ir → deeplink |

### comandos propostos (adicionar ao frontend)

```bash
npm run test -w zippi-frontend
npm run test:e2e -w zippi-frontend
```

### checklist manual pré-release

- [ ] mapa carrega poa com pins
- [ ] essenciais retorna farmácias em gps simulado poa
- [ ] rota osrm desenha polyline
- [ ] sympla eventos ou fallback mock
- [ ] trocar bento gonçalves voa mapa
- [ ] dark/light theme
- [ ] build `npm run build` sem erro

---

## variáveis de ambiente

arquivo `.env` na raiz (copiar de `.env.example`):

| variável | onde | descrição |
|----------|------|-----------|
| `SYMPLA_TOKEN` | backend | token api sympla (secreto) |
| `PORT` | backend | default 3001 |
| `VITE_API_URL` | frontend | vazio em dev (proxy vite); url backend em preview |
| `REDIS_URL` | backend (futuro) | cache agregador |
| `OPENAI_API_KEY` | backend (futuro) | assistente ia |
| `SENTRY_DSN` | ambos (futuro) | telemetria |

**regra:** nunca prefixar segredos com `VITE_` — expõe no bundle.

**dev:** `npm run dev` sobe frontend :5173 + backend :3001; vite proxy `/api` → backend.

**prod:** vercel rewrites em `vercel.json`; `SYMPLA_TOKEN` nas env vars vercel.

---

## como adicionar nova cidade

1. criar `frontend/src/data/{slug}/` copiando estrutura de `poa/`
2. adicionar `{slug}.config.js` (ver [ESCALA_GEOGRAFICA.md](./ESCALA_GEOGRAFICA.md))
3. popular `raw/*.js` com mínimo 30 lugares via `normalize.js`
4. adicionar eventos mock ou sympla city/state
5. registrar em seletor de `Home.jsx` (explorar/hoje)
6. implementar `flyTo` com centro da config
7. documentar em `docs/` e checklist em [ESCALA_GEOGRAFICA.md](./ESCALA_GEOGRAFICA.md)
8. issue `tourio-7xx` no backlog

**essenciais:** sempre usam gps real do usuário — não mudam com cidade explorar selecionada.

---

## como adicionar nova tela

1. criar `frontend/src/screens/MinhaTela.jsx`
2. registrar rota em `App.jsx` (react-router)
3. extrair lógica para `services/` se houver fetch
4. reutilizar `styles/glass.js` para consistência visual
5. conectar contexto (`UserContext`, `ThemeContext`) se necessário
6. adicionar link de navegação a partir de tela existente
7. atualizar [FEATURES.md](./FEATURES.md) se feature user-facing

**template mínimo:**

```jsx
import { useTheme } from '../context/ThemeContext.jsx'

export default function MinhaTela() {
  const { dark } = useTheme()
  return (
    <div className={dark ? 'bg-dark-900 text-white' : 'bg-white text-gray-900'}>
      {/* conteúdo */}
    </div>
  )
}
```

---

## como adicionar novo serviço de api

1. criar `frontend/src/services/meuServico.js` ou rota backend se secreto
2. documentar em [APIS.md](./APIS.md)
3. adicionar env em `.env.example` se aplicável
4. implementar cache e fallback
5. tratar rate limit e timeout
6. incluir `confidence` se retornar pois/eventos

---

## code review checklist

### funcionalidade
- [ ] atende critérios de aceite da issue tourio-XXX
- [ ] edge cases: sem gps, api offline, cidade sem dados

### código
- [ ] segue convenções de nomenclatura
- [ ] sem secrets hardcoded
- [ ] dif mínimo — sem refatoração unrelated
- [ ] imports organizados

### ui/ux
- [ ] funciona dark e light
- [ ] responsivo mobile (viewport principal)
- [ ] loading e error states

### performance
- [ ] debounce em eventos mapa
- [ ] cache quando fetch repetitivo
- [ ] lazy load se bundle grande

### docs
- [ ] APIS.md / env example atualizados se necessário
- [ ] comentários só onde lógica não óbvia

### segurança
- [ ] inputs sanitizados
- [ ] rotas backend sem exposição de token
- [ ] lgpd: sem pii em logs

---

## scripts npm

| comando | ação |
|---------|------|
| `npm install` | instala root + workspaces |
| `npm run dev` | frontend + backend concurrently |
| `npm run dev:frontend` | só vite |
| `npm run dev:backend` | só express |
| `npm run build` | build frontend → dist |
| `npm run start:backend` | backend produção local |

---

## deploy

ver [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md).

resumo:
- push main → vercel build frontend
- funções `/api/*` serverless
- env `SYMPLA_TOKEN` configurada no dashboard

---

## dívida técnica conhecida

| item | issue | nota |
|------|-------|------|
| nome zippi vs tourio | tourio-600 | renomear gradualmente |
| assistente regex only | tourio-401 | migrar para llm |
| trânsito simulado | tourio-101 | label + api real |
| comunidade localStorage | tourio-300 | migrar api |
| sem testes auto | tourio-601 | vitest + playwright |

---

## referências

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [BACKLOG_SCRUMBAN.md](./BACKLOG_SCRUMBAN.md)
- [DADOS_URBANOS_MAPA.md](./DADOS_URBANOS_MAPA.md)
- [ARQUITETURA_IA.md](./ARQUITETURA_IA.md)
