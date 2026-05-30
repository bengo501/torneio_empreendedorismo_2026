# guia de chaves de api para o zippi

como configurar integrações e o que é realisticamente possível sem parceria comercial.

## configurar no projeto

1. copie `.env.example` para `.env` (já feito se você seguiu o assistente)
2. preencha as variáveis `VITE_*`
3. reinicie o dev server: `npm run dev`
4. o arquivo `.env` está no `.gitignore` — **nunca** suba chaves no git

---

## já integrado

| serviço | variável | onde obter | observação |
|---------|----------|------------|------------|
| sympla | `SYMPLA_TOKEN` (backend) | sympla.com.br → integrações | eventos via `GET /api/events`; chave só no servidor |

### sympla — limitações

- a chave lista eventos do **organizador** dono do token (ou parceria sympla partners)
- não existe catálogo público de todos os eventos do brasil sem ser parceiro
- em produção: backend ou rewrite no host (mesmo proxy que o vite)

---

## prioridade alta (vale criar chave agora)

### uber developer (link que você encontrou)

- **documentação:** [business trip receipt](https://developer.uber.com/docs/businesses/receipts/references/api/v1/business-trips-trip_id-receipt-get)
- **uso real:** recibo de corrida **já finalizada** no uber for business — não lista lugares nem preços
- **no zippi:** deeplinks em `deeplinks.js`; não precisa dessa api para o torneio

### google maps platform (opcional — exige cartão no cadastro)

- **portal:** https://console.cloud.google.com/
- **variável:** `VITE_GOOGLE_MAPS_API_KEY`
- **alternativas sem cartão:** ver [LUGARES_APIS.md](./LUGARES_APIS.md) (osm, photon, geoapify, locationiq, openrouteservice)
- **apis a habilitar:**
  - places api (new) — pois, horários, fotos, avaliações
  - directions api — rotas alternativas ao osrm
  - distance matrix api — comparar tempo/distância entre modos
  - maps javascript api — só se substituir tiles leaflet por google maps
- **custo:** crédito mensal gratuito (~us$ 200); depois cobrança por requisição
- **segurança:** restrinja a chave por domínio (http referrer) e por api
- **no zippi hoje:** nominatim + osrm cobrem o básico; google enriquece essenciais e rotas

---

## transporte — o que dá para conectar de verdade

### camada 1 — já funciona sem chave (deeplinks)

o app já abre uber, 99, indriver, whoosh, lime, tembici com destino pré-preenchido:

- arquivo: `src/services/deeplinks.js`
- **não precisa de api key** para abrir o app com rota
- **não mostra preço** antes de abrir o app do operador

### camada 2 — micromobilidade gbfs (parcial, sem chave)

| operador | feed | chave necessária? |
|----------|------|-------------------|
| whoosh | `api.whoosh.bike/gbfs/...` | às vezes bloqueado; parceria para feed estável |
| lime | `data.lime.bike/api/partners/v2/gbfs` | **lime partners api** para produção |
| tembici / yellow | proprietário | **contrato tembici** — variável `VITE_TEMBICI_API_KEY` |

arquivo: `src/services/scooters.js`

### camada 3 — apps de corrida (uber, 99, jet, etc.)

| app | api pública de preço? | como integrar no zippi |
|-----|----------------------|------------------------|
| uber | **não** para apps genéricos | [uber developers](https://developer.uber.com/) — ride api só para **parceiros** aprovados (b2b) |
| 99 | **não** | apenas deeplink (já implementado) |
| indriver | **não** | deeplink |
| cabify, bolt | parceria | contato comercial |
| "jet" (patinete/jet share) | depende da marca | verificar se expõe gbfs ou api de parceiro |

**conclusão:** para torneio/mvp, deeplinks + estimativa local (osrm + tabela de preços simulada em `data/services.js`) é o caminho viável. preço real da uber/99 exige contrato com cada empresa.

---

## prioridade média (eventos e dados urbanos)

| serviço | uso | chave |
|---------|-----|-------|
| ticketmaster discovery | shows pagos | api key no [developer.ticketmaster.com](https://developer.ticketmaster.com/) |
| openweather (opcional) | clima alternativo | já usamos open-meteo sem chave |
| trensurb / eptc gtfs | ônibus e metrô poa | arquivos gtfs públicos, sem chave (import estático) |

---

## prioridade baixa / backend obrigatório

| serviço | motivo |
|---------|--------|
| scraping portais de notícias | viola tos; precisa backend |
| bilhetin | sem api documentada pública |
| apis uber/99 em produção | segredo não pode ficar no `VITE_*` do browser — só backend |

---

## roadmap sugerido de chaves

```
fase 1 (agora)
  sympla          → SYMPLA_TOKEN (backend / vercel)
  osm + photon    → já no código (sem chave)
  geoapify        → VITE_GEOAPIFY_API_KEY (opcional, sem cartão no free)

fase 2 (micromobilidade)
  lime partners   → VITE_LIME_PARTNER_TOKEN
  whoosh / tembici → contrato comercial

fase 3 (produção)
  backend zippi   → guarda todas as chaves server-side
  uber ride api   → só se parceria aprovada
```

---

## segurança

- se a chave sympla foi exposta em chat, email ou repositório: **revogue e gere outra** no painel sympla
- nunca coloque chaves em `README`, commits ou prints
- chaves `VITE_*` ficam visíveis no bundle do navegador — só use para apis com restrição por domínio (google) ou apis já pensadas para cliente (sympla com proxy)

---

## referências no código

| arquivo | integração |
|---------|------------|
| `src/services/sympla.js` | eventos sympla |
| `src/services/geo.js` | nominatim, osrm |
| `src/services/deeplinks.js` | uber, 99, indriver, whoosh, lime, tembici |
| `src/services/scooters.js` | gbfs micromobilidade |
| `docs/APIS.md` | lista técnica de endpoints |
