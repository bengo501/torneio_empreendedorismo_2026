# backlog scrumban — tourio

guia de operação ágil para o time tourio: fluxo scrumban, definição de pronto, backlog priorizado a partir do mvp atual e convenção de ids estilo github issues.

---

## o que é scrumban no tourio

combinamos **scrum** (cadência, revisão, objetivo de sprint) com **kanban** (fluxo contínuo, wip limits, pull system). não há sprint planning rígido de duas semanas fechadas — itens entram em "ready" quando cumprem critérios de pronto e são puxados para "in progress" conforme capacidade.

**princípios:**
- visualizar todo o trabalho no quadro
- limitar wip (máx. 2 itens por dev em "in progress")
- priorizar por valor para usuário poa + dependências técnicas
- done = deployável em staging ou produção

---

## colunas do quadro

```
backlog → ready → in progress → review → done
```

| coluna | descrição | critério de entrada |
|--------|-----------|---------------------|
| **backlog** | ideias priorizadas, ainda não refinadas | item registrado com id tourio-xxx |
| **ready** | refinado, estimado, sem bloqueios | critérios de aceite escritos, dependências mapeadas |
| **in progress** | desenvolvimento ativo | dev atribuído, branch criada |
| **review** | pr aberto, code review ou qa | build verde, checklist de pr preenchido |
| **done** | merged, deploy staging/prod | definição de done cumprida |

**ferramentas sugeridas:** github projects, linear ou notion kanban. cada card referencia id `tourio-NNN`.

---

## cadência de sprint

| evento | frequência | duração | objetivo |
|--------|------------|---------|----------|
| refinamento | semanal (quarta) | 45 min | mover itens backlog → ready |
| planning leve | quinzenal (segunda) | 30 min | definir meta da quinzena (1–3 entregas) |
| daily async | diário | 5 min | post no canal: ontem / hoje / bloqueio |
| review | quinzenal (sexta) | 30 min | demo do que foi para done |
| retrospectiva | mensal | 45 min | melhorar processo |

**meta por quinzena (time 2–4 devs):** 3–5 itens done, sendo pelo menos 1 de infra ou dívida técnica.

---

## definição de done (dod)

um item só vai para **done** quando:

- [ ] código merged na branch principal via pull request aprovado
- [ ] build e lint passam (`npm run build`)
- [ ] funcionalidade testada manualmente no fluxo descrito nos critérios de aceite
- [ ] sem regressão visível nas abas home (mapa, ir, explorar, hoje, essenciais)
- [ ] documentação atualizada se mudou api, env ou fluxo de deploy
- [ ] variáveis sensíveis não commitadas (.env.example atualizado se necessário)
- [ ] deploy em staging ou produção verificado (quando aplicável)
- [ ] card no quadro marcado done com link do pr

**exceções:** spikes de pesquisa têm dod reduzido (documento de conclusão + decisão go/no-go).

---

## definição de ready

item entra em **ready** quando:

- [ ] título e descrição claros em português
- [ ] critérios de aceite numerados (dado/quando/então)
- [ ] estimativa (t-shirt: xs/s/m/l/xl ou pontos 1–8)
- [ ] dependências identificadas (apis, design, backend)
- [ ] arquivos prováveis listados (ex.: `overpass.js`, `Home.jsx`)

---

## convenção de ids (estilo github issues)

formato: **`tourio-{número}`** — ex.: `tourio-042`

| faixa | domínio |
|-------|---------|
| tourio-001 – tourio-099 | produto / ux |
| tourio-100 – tourio-199 | mapa e dados urbanos |
| tourio-200 – tourio-299 | mobilidade e transporte |
| tourio-300 – tourio-399 | backend e infra |
| tourio-400 – tourio-499 | ia e assistente |
| tourio-500 – tourio-599 | adoção, growth, b2b |
| tourio-600 – tourio-699 | dívida técnica |
| tourio-700 – tourio-799 | expansão geográfica |

**no github:** criar issue com título `[tourio-042] descrição curta`. no corpo, referenciar docs e critérios de aceite. pr usa `closes tourio-042` ou `fixes #42`.

---

## estado atual do mvp (baseline)

funcionalidades **done** no repositório:

- mapa leaflet com tiles carto, pins explorar/eventos/essenciais
- overpass: highways, natureza, paradas ônibus, amenities
- rotas osrm + deeplinks uber/99/indriver/patinetes
- abas ir, explorar, hoje, essenciais
- cidades poa e bento gonçalves (explorar/hoje)
- sympla via backend proxy
- onboarding interesses (interestTree)
- perfil editável
- assistente voz protótipo (regex, não llm)
- relatos comunidade (localStorage)
- clima open-meteo

---

## backlog priorizado

### prioridade p0 — crítico (próxima quinzena)

| id | item | esforço | notas |
|----|------|---------|-------|
| tourio-301 | backend agregador `/api/city/poa/map` | l | centraliza overpass/sympla; reduz rate limit |
| tourio-101 | trânsito real ou semi-real (substituir simulação pura) | m | parceria ou scraping dados abertos poa |
| tourio-302 | cache redis para overpass e sympla | m | ttl configurável por camada |
| tourio-001 | push notifications (web push pwa) | m | alertas clima, eventos, trânsito |
| tourio-201 | gtfs trensurb — estações no mapa | m | ver [BACKLOG.md](./BACKLOG.md) |

### prioridade p1 — alto valor

| id | item | esforço | notas |
|----|------|---------|-------|
| tourio-401 | assistente ia fase 1 — llm + contexto cidade | l | ver [ARQUITETURA_IA.md](./ARQUITETURA_IA.md) |
| tourio-102 | campo `confidence` em todos os pois | s | ver [DADOS_URBANOS_MAPA.md](./DADOS_URBANOS_MAPA.md) |
| tourio-103 | scheduler ingestão eventos (sympla + rss) | m | cron backend |
| tourio-002 | onboarding valor imediato (primeira rota em < 60s) | s | ver [MELHORIAS_ADOCAO.md](./MELHORIAS_ADOCAO.md) |
| tourio-202 | gbfs whoosh/lime com api key | s | `scooters.js` pronto |
| tourio-003 | compartilhar rota / evento via link | s | deep linking |
| tourio-501 | programa embaixadores bairro (10 pilotos) | m | operacional + badge in-app |

### prioridade p2 — médio prazo

| id | item | esforço |
|----|------|---------|
| tourio-203 | preços uber/99 tempo real | l |
| tourio-104 | deduplicação fuzzy osm + curadoria | m |
| tourio-402 | recomendação contextual por clima/hora | m |
| tourio-004 | gamificação — pontos por relatos | m |
| tourio-601 | testes e2e playwright fluxo ir | m |
| tourio-602 | error boundary + telemetria sentry | s |
| tourio-701 | template cidade — gramado | m |
| tourio-502 | painel smb básico (listings) | l |

### prioridade p3 — backlog futuro

| id | item |
|----|------|
| tourio-204 | cartão tri saldo |
| tourio-405 | rag completo assistente guia |
| tourio-702 | expansão curitiba |
| tourio-005 | modo realidade aumentada |
| tourio-503 | contrato turismo municipal |

---

## checklist todo global (mvp → produção)

### infraestrutura

- [ ] tourio-301 — endpoint agregador city map
- [ ] tourio-302 — redis cache
- [ ] tourio-602 — monitoramento erros
- [ ] tourio-603 — ci github actions (lint + build)
- [ ] documentar sla apis externas

### dados

- [ ] tourio-102 — confidence scores
- [ ] tourio-103 — scheduler eventos
- [ ] tourio-104 — deduplicação
- [ ] integrar ticketmaster ou bilhetin (sympla complementar)
- [ ] limites ibge para detecção automática de cidade

### produto

- [ ] tourio-001 — push notifications
- [ ] tourio-002 — onboarding otimizado
- [ ] tourio-003 — share links
- [ ] tourio-004 — gamificação relatos
- [ ] modo offline básico (tiles + pois poa)

### mobilidade

- [ ] tourio-201 — gtfs trensurb
- [ ] tourio-202 — gbfs patinetes
- [ ] tourio-203 — preços apps transporte
- [ ] navegação turn-by-turn voz

### ia

- [ ] tourio-401 — llm assistente fase 1
- [ ] tourio-402 — recomendação contextual
- [ ] tourio-405 — rag + memória

### adoção

- [ ] tourio-501 — embaixadores
- [ ] tourio-502 — listings smb
- [ ] parcerias ufrgs, pucrs
- [ ] landing page tourio.app

### expansão

- [ ] tourio-701 — gramado template
- [ ] tourio-702 — curitiba piloto
- [ ] governança multi-cidade

---

## template de card (copiar)

```markdown
## tourio-XXX — título

**prioridade:** p0 | p1 | p2 | p3
**esforço:** xs | s | m | l | xl
**assignee:** @dev

### contexto
por que este item importa agora.

### critérios de aceite
1. dado usuário em poa, quando abre essenciais, então vê farmácias a 3km ordenadas por distância
2. ...

### arquivos prováveis
- frontend/src/...
- backend/src/...

### dependências
- tourio-301 (bloqueia se agregador não existir)

### notas técnicas
...
```

---

## wip limits recomendados

| coluna | limite |
|--------|--------|
| in progress | 2 por desenvolvedor |
| review | 4 total no time |
| ready | ilimitado, mas top 10 sempre refinados |

---

## métricas de fluxo

acompanhar quinzenalmente:

- **lead time** — ready → done (meta: < 5 dias para itens s/m)
- **throughput** — itens done por quinzena
- **taxa de abandono** — itens que voltam de review para in progress
- **idade do backlog** — % itens p0 com mais de 14 dias em backlog

---

## referências

- ideias: [SUGESTOES_APP.md](./SUGESTOES_APP.md)
- backlog legado: [BACKLOG.md](./BACKLOG.md)
- organização: [ORGANIZACAO_PROJETO.md](./ORGANIZACAO_PROJETO.md)
