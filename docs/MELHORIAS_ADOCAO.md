# melhorias de adoção — tourio

estratégia integrada para aumentar uso real do tourio: melhorias técnicas que reduzem fricção e estratégias humanas/comportamentais que criam hábito e comunidade. complementa [PLANO_MERCADO_ODS.md](./PLANO_MERCADO_ODS.md) e [SUGESTOES_APP.md](./SUGESTOES_APP.md).

---

## diagnóstico: por que usuários abandonam apps urbanos

1. **valor não imediato** — onboarding longo sem mostrar benefício concreto
2. **dados genéricos** — parece "mais um mapa" vs google
3. **falta de hábito** — uso só quando turista ou emergência
4. **confiança** — dúvida sobre precisão de eventos e trânsito
5. **fricção técnica** — lentidão overpass, sem offline, sem push

o tourio precisa vencer nos momentos **agora** (farmácia, chuva, evento hoje) e **recorrentes** (trânsito matinal, fim de semana cultural).

---

## parte 1 — melhorias técnicas

### performance e experiência

| melhoria | impacto | implementação |
|----------|---------|---------------|
| cache agressivo overpass | reduz 2–5s no pan do mapa | backend redis + ttl por bbox; já existe sessionStorage 24h no cliente |
| lazy load de camadas | first paint mais rápido | carregar natureza/trânsito só após mapa base |
| skeleton loaders | percepção de velocidade | sheets e listas com placeholder |
| debounce bbox 500ms | menos requests | já parcial em `Home.jsx`; padronizar |
| service worker pwa | reabertura instantânea | cache shell + pois poa estáticos |
| compressão geojson | menos payload | simplificar polylines trânsito |

**meta:** time to interactive < 3s em 4g; interação mapa < 500ms após cache quente.

### backend e agregação

problema atual: frontend chama nominatim, overpass, sympla proxy diretamente — rate limits e latência variável.

**solução:**
```
cliente → GET /api/city/poa/map?layers=events,traffic,nature
       → backend agrega, cacheia, normaliza
       → resposta única com confidence por item
```

benefícios:
- uma round-trip em vez de 4–6
- chaves sympla e futuras google/uber só no servidor
- scheduler pré-aquece cache antes de picos (sexta 17h, sábado 10h)

ver [DADOS_URBANOS_MAPA.md](./DADOS_URBANOS_MAPA.md).

### apis de trânsito real

estado atual: geometria real osm + níveis simulados em `poaMapLayers.js` e `trafficMock.js`.

**roadmap trânsito:**
1. **curto prazo:** integrar waze/google traffic via parceiro ou dados abertos poa (cetran)
2. **médio prazo:** relatos comunidade com peso alto após 3 validações
3. **longo prazo:** parceria operadora infraestrutura

**regra de exibição:** nunca mostrar trânsito simulado sem label "estimativa" — transparência gera confiança.

### push notifications

casos de uso prioritários:

| trigger | mensagem exemplo | timing |
|---------|------------------|--------|
| evento perto | "show gratuito a 800m em 2h — parque da redenção" | 2h antes |
| clima severo | "alerta de temporal — considere adiar deslocamento" | imediato |
| trânsito rota salva | "congestionamento na sua rota habitual para o trabalho" | 7h30 seg–sex |
| novo relato validado | "obra confirmada na av. ipiranga — evite a região" | imediato |
| streak gamificação | "3 dias explorando poa — complete a missão de hoje" | 18h |

implementação: web push (vapid) no pwa; depois fcm se app nativo.

### confiabilidade e observabilidade

- sentry para erros frontend/backend
- healthcheck `/api/health` com status overpass/sympla
- fallback gracioso: se overpass falha, mostrar pois curados de `data/poa/`
- banner "dados podem estar desatualizados" quando confidence média < 0.5

### offline e conectividade fraca

- bundle poa essencial: top 50 lugares, eventos do dia cacheados
- map tiles último viewport em indexeddb
- fila de relatos comunidade sync quando online

---

## parte 2 — adoção humana e comportamental

### onboarding com valor imediato

**problema:** usuário cria perfil e cai no mapa vazio sem saber o que fazer.

**fluxo otimizado (< 60 segundos até primeiro valor):**

1. permissão gps (ou escolher poa manualmente)
2. uma pergunta: "o que você precisa agora?" → ir / explorar / essenciais / eventos hoje
3. resultado imediato na escolha (não pedir todos os interesses upfront)
4. interesses opcionais depois, via perfil

**métrica:** % usuários que completam ação útil na primeira sessão (meta: 70%).

### relatos comunitários como flywheel

estado atual: `community.js` + localStorage + modal no mapa.

**evolução:**
- pontos por relato validado (ver tourio-004)
- badge "olho do bairro" após 10 relatos úteis
- embaixadores moderam relatos duplicados ou spam
- relatos alimentam camada trânsito com confidence boost

**por que funciona:** moradores sentem ownership; turistas confiam em dados recentes.

### embaixadores de cidade e bairro

programa piloto (tourio-501):

| papel | responsabilidade | benefício |
|-------|------------------|-----------|
| embaixador bairro | validar pois, relatos, indicar comerciantes | tourio plus grátis 6 meses |
| embaixador universidade | divulgar no campus, feedback mensal | swag + menção no app |
| embaixador turismo | curadoria eventos e rotas temáticas | networking com secretaria |

**recrutamento:** instagram, grupos de bairro, professores parceiros, feiras tech.

### parcerias universitárias

instituições alvo poa: ufrgs, pucrs, unisinos, feevale, upf.

**ativos:**
- "mapa do estudante" — eventos gratuitos, bibliotecas, bandejão, ciclovias
- hackathon tourio — dados abertos + api
- pesquisa conjunta — mobilidade sustentável, ods

**métrica:** cadastros com email `.edu.br`; sessões em horário de intervalo.

### parcerias com secretarias de turismo

proposta de valor para prefeitura:
- mapa oficial white-label
- dados agregados de interesse turístico (anonimizados)
- promoção de rota do vinho, centro histórico, orla

entregável inicial gratuito: landing poa curada + qr codes em pontos turísticos.

### habit loops (modelo hook)

```
gatilho → ação → recompensa → investimento
```

| loop | gatilho | ação | recompensa | investimento |
|------|---------|------|------------|--------------|
| manhã | horário trabalho | ver trânsito/rota | tempo economizado | salvar rota favorita |
| almoço | notificação evento | abrir aba hoje | descoberta gratuita | favoritar evento |
| fim de semana | missão gamificada | explorar parque | badge + desconto parceiro | check-in, relato |
| emergência | busca farmácia | essenciais | alívio imediato | confiar no app |

### por que usar tourio vs instagram

| instagram | tourio |
|-----------|-------|
| descoberta passiva no feed | descoberta ativa no mapa ao redor |
| conteúdo patrocinado misturado | filtros claros gratuito/parceiro |
| sem rota integrada | um toque para ir |
| sem essenciais | farmácia a 3km em 2 toques |
| algoritmo global | contexto hiperlocal poa |

**mensagem de marketing:** "pare de screenshot. vá."

### por que usar tourio vs google maps

| google maps | tourio |
|-------------|-------|
| genérico global | curado para poa e rs |
| eventos fracos | aba hoje com sympla + cultura local |
| um modal de transporte | compara uber, 99, patinete, a pé |
| reviews antigos | relatos recentes da comunidade |
| zero gamificação/comunidade | embaixadores, missões, economia local |

**mensagem:** "google te leva. tourio te mostra a cidade."

---

## parte 3 — métricas de adoção

### north star metric

**sessões semanais com ação de valor** — rota iniciada, essencial clicado, evento salvo, relato enviado.

### funil acompanhar

1. instalação / primeira visita
2. gps permitido
3. primeira ação útil (< 24h)
4. retorno d7
5. retorno d30
6. conversão plus ou interação smb

### metas ano 1 poa

| métrica | meta |
|---------|------|
| mau | 10.000 |
| d7 retenção | 25% |
| primeira ação útil | 70% |
| relatos/mês | 500 |
| nps | > 40 |

---

## parte 4 — roadmap de adoção (12 meses)

| mês | foco técnico | foco humano |
|-----|--------------|-------------|
| 1–2 | performance overpass, fallback pois | onboarding valor imediato |
| 3–4 | push notifications, agregador api | 10 embaixadores bairro |
| 5–6 | trânsito semi-real, confidence labels | parceria 1 universidade |
| 7–8 | offline poa, share links | gamificação relatos |
| 9–10 | smb listings piloto | 30 comerciantes parceiros |
| 11–12 | métricas ods dashboard | pitch secretaria turismo poa |

---

## checklist rápido

### técnico
- [ ] agregador `/api/city/poa/map`
- [ ] redis cache
- [ ] push web
- [ ] trânsito com label estimativa/real
- [ ] sentry + healthcheck
- [ ] offline poa básico

### humano
- [ ] onboarding < 60s até valor
- [ ] programa embaixadores
- [ ] parceria universidade
- [ ] qr codes pontos turísticos
- [ ] conteúdo "tourio vs google/instagram"
- [ ] missões gamificadas semanais

---

## referências

- [MELHORIAS_ADOCAO.md](./MELHORIAS_ADOCAO.md) — este documento
- [BACKLOG_SCRUMBAN.md](./BACKLOG_SCRUMBAN.md) — tourio-001, tourio-002, tourio-501
- [PLANO_MERCADO_ODS.md](./PLANO_MERCADO_ODS.md) — go-to-market
