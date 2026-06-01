# backlog scrumban — turio

guia de operação ágil para o time turio: fluxo scrumban, definição de pronto, backlog priorizado a partir do mvp atual e convenção de ids estilo github issues.

---

## o que é scrumban no turio

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
| **backlog** | ideias priorizadas, ainda não refinadas | item registrado com id turio-xxx |
| **ready** | refinado, estimado, sem bloqueios | critérios de aceite escritos, dependências mapeadas |
| **in progress** | desenvolvimento ativo | dev atribuído, branch criada |
| **review** | pr aberto, code review ou qa | build verde, checklist de pr preenchido |
| **done** | merged, deploy staging/prod | definição de done cumprida |

**ferramentas sugeridas:** github projects, linear ou notion kanban. cada card referencia id `turio-NNN`.

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

formato: **`turio-{número}`** — ex.: `turio-042`

| faixa | domínio |
|-------|---------|
| turio-001 – turio-099 | produto / ux |
| turio-100 – turio-199 | mapa e dados urbanos |
| turio-200 – turio-299 | mobilidade e transporte |
| turio-300 – turio-399 | backend e infra |
| turio-400 – turio-499 | ia e assistente |
| turio-500 – turio-599 | adoção, growth, b2b |
| turio-600 – turio-699 | dívida técnica |
| turio-700 – turio-799 | expansão geográfica |

**no github:** criar issue com título `[turio-042] descrição curta`. no corpo, referenciar docs e critérios de aceite. pr usa `closes turio-042` ou `fixes #42`.

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
| turio-301 | backend agregador `/api/city/poa/map` | l | centraliza overpass/sympla; reduz rate limit |
| turio-101 | trânsito real ou semi-real (substituir simulação pura) | m | parceria ou scraping dados abertos poa |
| turio-302 | cache redis para overpass e sympla | m | ttl configurável por camada |
| turio-001 | push notifications (web push pwa) | m | alertas clima, eventos, trânsito |
| turio-201 | gtfs trensurb — estações no mapa | m | ver [BACKLOG.md](./BACKLOG.md) |

### prioridade p1 — alto valor

| id | item | esforço | notas |
|----|------|---------|-------|
| turio-401 | assistente ia fase 1 — llm + contexto cidade | l | ver [ARQUITETURA_IA.md](./ARQUITETURA_IA.md) |
| turio-102 | campo `confidence` em todos os pois | s | ver [DADOS_URBANOS_MAPA.md](./DADOS_URBANOS_MAPA.md) |
| turio-103 | scheduler ingestão eventos (sympla + rss) | m | cron backend |
| turio-002 | onboarding valor imediato (primeira rota em < 60s) | s | ver [MELHORIAS_ADOCAO.md](./MELHORIAS_ADOCAO.md) |
| turio-202 | gbfs whoosh/lime com api key | s | `scooters.js` pronto |
| turio-003 | compartilhar rota / evento via link | s | deep linking |
| turio-501 | programa embaixadores bairro (10 pilotos) | m | operacional + badge in-app |

### prioridade p2 — médio prazo

| id | item | esforço |
|----|------|---------|
| turio-203 | preços uber/99 tempo real | l |
| turio-104 | deduplicação fuzzy osm + curadoria | m |
| turio-402 | recomendação contextual por clima/hora | m |
| turio-004 | gamificação — pontos por relatos | m |
| turio-601 | testes e2e playwright fluxo ir | m |
| turio-602 | error boundary + telemetria sentry | s |
| turio-701 | template cidade — gramado | m |
| turio-502 | painel smb básico (listings) | l |

### prioridade p3 — backlog futuro

| id | item |
|----|------|
| turio-204 | cartão tri saldo |
| turio-405 | rag completo assistente guia |
| turio-702 | expansão curitiba |
| turio-005 | modo realidade aumentada |
| turio-503 | contrato turismo municipal |

---

## checklist todo global (mvp → produção)

### infraestrutura

- [ ] turio-301 — endpoint agregador city map
- [ ] turio-302 — redis cache
- [ ] turio-602 — monitoramento erros
- [ ] turio-603 — ci github actions (lint + build)
- [ ] documentar sla apis externas

### dados

- [ ] turio-102 — confidence scores
- [ ] turio-103 — scheduler eventos
- [ ] turio-104 — deduplicação
- [ ] integrar ticketmaster ou bilhetin (sympla complementar)
- [ ] limites ibge para detecção automática de cidade

### produto

- [ ] turio-001 — push notifications
- [ ] turio-002 — onboarding otimizado
- [ ] turio-003 — share links
- [ ] turio-004 — gamificação relatos
- [ ] modo offline básico (tiles + pois poa)

### mobilidade

- [ ] turio-201 — gtfs trensurb
- [ ] turio-202 — gbfs patinetes
- [ ] turio-203 — preços apps transporte
- [ ] navegação turn-by-turn voz

### ia

- [ ] turio-401 — llm assistente fase 1
- [ ] turio-402 — recomendação contextual
- [ ] turio-405 — rag + memória

### adoção

- [ ] turio-501 — embaixadores
- [ ] turio-502 — listings smb
- [ ] parcerias ufrgs, pucrs
- [ ] landing page turio.app

### expansão

- [ ] turio-701 — gramado template
- [ ] turio-702 — curitiba piloto
- [ ] governança multi-cidade

---

## template de card (copiar)

```markdown
## turio-XXX — título

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
- turio-301 (bloqueia se agregador não existir)

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
