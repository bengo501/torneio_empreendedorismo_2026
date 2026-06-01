# escala geográfica — turio

estratégia de expansão territorial do turio: porto alegre → cidades do rs → regiões do brasil → internacional. define requisitos técnicos, parceiros de dados e governança por fase.

---

## princípios de expansão

1. **template replicável** — cada cidade é config + dados, não fork de código
2. **qualidade > quantidade** — só lançar cidade com confidence média >= 0.7 em lugares principais
3. **hub and spoke** — poa como centro de operação e curadoria rs
4. **local first** — embaixador ou parceiro institucional por cidade
5. **compliance** — lgpd no brasil; gdpr na expansão internacional

---

## fase 0 — mvp porto alegre (atual)

**status:** em produção / desenvolvimento ativo.

| aspecto | detalhe |
|---------|---------|
| slug | `poa` |
| bbox | `POA_BBOX` em `osmGeometry.js` |
| dados | `frontend/src/data/poa/raw/*`, sympla, overpass |
| cidades secundárias ui | bento gonçalves (explorar/hoje parcial) |
| backend | sympla proxy apenas |

**critério de conclusão fase 0:**
- agregador `/api/city/poa/map` em produção
- 100+ lugares curados confidence >= 0.8
- eventos sympla + fallback mock
- trânsito com geometria osm (label estimativa onde simulado)

---

## fase 1 — região metropolitana e rs turístico (meses 6–18)

### cidades alvo (prioridade)

| ordem | cidade | slug | foco |
|-------|--------|------|------|
| 1 | bento gonçalves | `bentogoncalves` | vinícolas, turismo enogastronômico |
| 2 | gramado | `gramado` | turismo nacional, eventos sazonais |
| 3 | canela | `canela` | parques, cascata caracol |
| 4 | pelotas | `pelotas` | universidade, patrimônio |
| 5 | santa cruz do sul | `santacruz` | oktoberfest, indústria |
| 6 | caxias do sul | `caxias` | feira, serra |
| 7 | torres | `torres` | litoral norte |

### requisitos técnicos fase 1

**config por cidade** — arquivo `frontend/src/data/cities/{slug}.config.js`:

```javascript
export default {
  slug: 'gramado',
  name: 'gramado',
  state: 'rs',
  country: 'br',
  center: { lat: -29.378, lon: -50.875 },
  bbox: { south: -29.45, west: -50.95, north: -29.32, east: -50.80 },
  defaultZoom: 13,
  timezone: 'America/Sao_Paulo',
  locales: ['pt-BR'],
  sympla: { city: 'Gramado', state: 'RS' },
  features: {
    traffic: false,
    gbfs: false,
    metro: false,
    community: true,
  },
  partners: {
    tourismBoard: 'gramado-turismo@example.gov.br',
  },
}
```

**checklist nova cidade:**
- [ ] `{slug}.config.js` com bbox e centro
- [ ] pasta `data/{slug}/raw/` com mínimo 30 lugares curados
- [ ] eventos sympla ou mock `eventosMock.js`
- [ ] seletor ui em explorar/hoje
- [ ] flyTo ao trocar cidade
- [ ] embaixador local nomeado
- [ ] qa confidence >= 0.7

**backend:** endpoint genérico `/api/city/:slug/map` lê config registry.

### parceiros de dados rs

| parceiro | dado | cidade |
|----------|------|--------|
| sympla | eventos | todas |
| secretaria turismo rs | rotas oficiais | serra |
| associações vinícolas | pois enogastronômicos | bento, caxias |
| prefeituras | obras, eventos oficiais | variável |
| osm overpass | essenciais, natureza | todas |

### governança fase 1

- **comitê curadoria rs:** 1 embaixador por cidade + coordenador poa
- **cadência:** revisão mensal de dados, trimestral de prioridade expansão
- **slas:** eventos atualizados em <= 24h; lugares revisados a cada 90 dias

---

## fase 2 — brasil — regiões estratégicas (meses 18–36)

### regiões e cidades piloto

| região | cidades piloto | rationale |
|--------|----------------|-----------|
| sul (consolidação) | florianópolis, curitiba | proximidade cultural, turismo forte |
| sudeste | belo horizonte, santos | universidades, eventos culturais |
| nordeste | salvador, recife | turismo + economia criativa |
| centro-oeste | bonito (ms) | ecoturismo |

### requisitos técnicos fase 2

**multi-tenant backend:**
```
/api/city/{slug}/map
/api/cities                    # lista cidades ativas
/api/city/{slug}/config        # config pública
```

**registry central** — `backend/src/cities/registry.json`:

```json
{
  "curitiba": {
    "slug": "curitiba",
    "active": true,
    "tier": "standard",
    "bbox": [-25.65, -49.35, -25.35, -49.15],
    "dataVersion": "2027.03.1"
  }
}
```

**localização:**
- i18n mínimo pt-BR (default); preparar en/es para turistas
- nomes de categorias via `mapCategories.js` por locale
- timezone por cidade para eventos "hoje"

**infra:**
- redis cluster ou upstash multi-região
- cdn para tiles cache (cloudflare)
- instância overpass dedicada ou geofabrik extracts por estado

**detecção automática de cidade:**
- reverse geocode nominatim
- fallback polígono ibge (geojson limites municipais)
- usuário pode fixar cidade manualmente

### parceiros fase 2

- **embratur / sebrae** — divulgação turismo nacional
- **ticketmaster / eventim** — eventos grandes sudeste
- **operadoras gbfs** — contratos nacionais lime/tembici
- **google places** (opcional pago) — enriquecimento pois comerciais

### governança fase 2

- **modelo franchise light:** embaixador regional remunerado (stipend + plus)
- **quality gate:** cidade só vai `active: true` após checklist + 2 semanas beta
- **data licensing:** registrar origem e termos de cada fonte por cidade

---

## fase 3 — internacional (ano 3+)

### mercados piloto sugeridos

| mercado | cidade piloto | rationale |
|---------|---------------|-----------|
| mercosul | montevidéu | proximidade rs, turismo cruzado |
| europa lusófona | lisboa | idioma, hub startup |
| latam | buenos aires | fluxo turístico brasil-argentina |

### requisitos técnicos fase 3

**internacionalização completa:**
- `locales: ['pt-BR', 'en', 'es']`
- moeda e formato data por região
- apis locais de eventos e transporte (não assumir sympla/uber br)

**compliance:**
- gdpr: consentimento explícito, direito ao esquecimento, dpo
- armazenamento dados ue vs br (data residency policy)

**mapas:**
- osm global funciona; curadoria local por país
- parceiros locais substituem sympla (eventbrite, fever, etc.)

**mobilidade:**
- deeplinks por mercado (cabify, beat, bolt conforme país)
- transporte público gtfs por agência local

### governança internacional

- **entidade legal** por país ou representante
- **moderação** com guidelines multiculturais
- **parcerias** via hubs locais (wayra, rockstart, etc.)

---

## matriz de requisitos por fase

| requisito | fase 0 poa | fase 1 rs | fase 2 br | fase 3 intl |
|-----------|------------|-----------|-----------|-------------|
| city config file | poa hardcoded | template | registry json | registry + i18n |
| curadoria mínima | 100 lugares | 30/cidade | 50/cidade | 50/cidade |
| agregador api | poa only | slug param | multi-tenant | multi-region |
| scheduler | sympla poa | sympla multi | + rss nacional | apis locais |
| embaixador | 10 bairros | 1/cidade | 1/região | parceiro local |
| traffic real | simulado | opcional | prioritário | parceiro local |
| lgpd | básico | completo | completo | + gdpr |
| receita b2g | pitch poa | turismo rs | prefeituras | turismo nacional |

---

## riscos de escala prematura

| risco | mitigação |
|-------|-----------|
| dados vazios em cidade nova | não listar até checklist completo |
| custo apis (google, overpass) | cache agressivo, tier free primeiro |
| curadoria insustentável | embaixadores + scraping assistido ia |
| fragmentação código | proibir forks; só config + data |
| reputação negativa | badge confidence; beta fechado |

---

## métricas por fase

| fase | mau alvo | cidades ativas | avg confidence |
|------|----------|----------------|----------------|
| 0 | 10k | 1 (+ bento parcial) | 0.85 poa |
| 1 | 50k | 8 rs | 0.75 |
| 2 | 200k | 15 br | 0.72 |
| 3 | 500k | 20+ | 0.70 |

---

## roadmap visual

```
2026 Q1-Q4   [====poa====]
2027 Q1-Q2         [==bento==gramado==pelotas==]
2027 Q3-Q4               [====rs 8 cidades====]
2028 Q1-Q2                     [==floripa==curitiba==]
2028 Q3-Q4                           [==bh==salvador==]
2029+                                      [intl piloto]
```

---

## referências

- [PLANO_MERCADO_ODS.md](./PLANO_MERCADO_ODS.md) — go-to-market
- [DADOS_URBANOS_MAPA.md](./DADOS_URBANOS_MAPA.md) — pipeline dados
- [ORGANIZACAO_PROJETO.md](./ORGANIZACAO_PROJETO.md) — como adicionar cidade
- [BACKLOG_SCRUMBAN.md](./BACKLOG_SCRUMBAN.md) — turio-701+
