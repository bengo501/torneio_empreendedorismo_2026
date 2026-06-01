# treinamento de modelos de ia — turio

complementa [ARQUITETURA_IA.md](./ARQUITETURA_IA.md) com o plano de **treinamento por escala geográfica** e o código inicial em `frontend/src/ai/`.

---

## escala (ordem obrigatória)

| fase | id | escopo | status mvp |
|------|-----|--------|------------|
| 1 | `poa` | porto alegre (seed + overpass + sympla) | **ativo** |
| 2 | `rs` | rio grande do sul | planejado |
| 3 | `br` | brasil | planejado |
| 4 | `world` | mundo | planejado |

configuração: `frontend/src/ai/config/trainingPhases.js`

---

## três sistemas × fase poa

### sistema 1 — coleta e classificação

| etapa | poa (agora) | rs / br / mundo |
|-------|-------------|-----------------|
| ingestão | json `data/poa/raw/`, geocode nominatim | extracts osm por uf/país |
| classificação | `classifyUrbanData()` regex v0 | few-shot gpt-4o-mini → fine-tune pequeno |
| validação | curadoria manual + bairros | revisão comunidade + confidence |

arquivo: `frontend/src/ai/collect/classifyUrbanData.js`

**treino poa (próximo passo backend):**

1. exportar `POA_PLACES` + labels `mapFilter` como dataset jsonl (`{text, label}`)
2. 200–500 exemplos rotulados (curadoria)
3. avaliar acurácia em holdout 20%
4. promover modelo `turio-classify-v1-poa` no pipeline ingestão

### sistema 2 — recomendação

| etapa | poa (agora) | escala |
|-------|-------------|--------|
| features | distância 3 km, interesses, hora, economia local | clima, eventos sympla, histórico |
| ranking | `scorePlace()` / `rankPlaces()` heurístico | embedding + learning-to-rank |

arquivo: `frontend/src/ai/recommend/scorePlaces.js`

integração app: lista explorar já ordena por distância; ranking por score pode substituir quando `UserContext.interests` estiver ligado.

### sistema 3 — assistente

| etapa | poa (agora) | produção |
|-------|-------------|----------|
| diálogo | parser regex em `VoiceAssistant.jsx` | llm + rag |
| contexto | `buildSystemPrompt()` stub | kb por cidade + memória usuário |

arquivo: `frontend/src/ai/assistant/prompts.js`

**treino assistente poa:**

1. corpus de perguntas reais (suporte, onboarding, “o que tem perto”)
2. rag sobre `POA_PLACES` + docs `FEATURES.md`
3. avaliação humana: precisão de endereço, tom, segurança
4. só depois tts/stt em produção

---

## bairros (knowledge base local)

modelo genérico: `frontend/src/data/poa/neighborhoods.js`

lista poa (11 bairros): centro, cidade baixa, floresta, independência, farroupilha, rio branco, bom fim, santana, moinhos de vento, bela vista, partenon — ver [BAIRROS_POA.md](./BAIRROS_POA.md).

análise automática: `neighborhoodAnalysis.js` → `POA_FEATURED_NEIGHBORHOOD_STATS`

cada lugar normalizado recebe `neighborhoodId` / `neighborhoodLabel` via endereço ou coordenadas.

---

## checklist poa → produção ia

- [ ] dataset jsonl classificação (lugares poa)
- [ ] endpoint backend `/ai/classify` (proxy llm)
- [ ] vector store por bairro (pgvector ou sqlite-vec)
- [ ] métricas: precisão categoria, ndcg@10 recomendação
- [ ] rs: replicar pipeline `data/rs/` + fase `rs` ativa
- [ ] br: federar cidades com mesmo schema `normalizePlace`

---

## referências no repositório

| doc / código | uso |
|--------------|-----|
| `docs/ARQUITETURA_IA.md` | visão dos 3 sistemas |
| `docs/ESCALA_GEOGRAFICA.md` | expansão cidade → mundo |
| `docs/DATA_SOURCES.md` | fontes por fase |
| `frontend/src/ai/` | stubs executáveis |
