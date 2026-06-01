# tourio — copiloto urbano inteligente

**tourio** conecta pessoas à cidade com mobilidade multimodal, mapa contextual, descoberta de lugares e eventos e ia personalizada. o mvp está centrado em **porto alegre**, com curadoria local, dados mockados onde necessário e geometria real via openstreetmap.

> o repositório ainda usa o prefixo interno `zippi` em pacotes npm e em alguns componentes (`ZippiMap`, classes `bg-zippi-*`). isso é legado de desenvolvimento; o nome do produto e da pwa é **tourio**.

## visão

transformar dados fragmentados da cidade (lugares, eventos, trânsito, clima, mobilidade) em experiências urbanas personalizadas para moradores e turistas — com impacto em economia local, sustentabilidade e inclusão.

## o que o app faz hoje

- **mapa** — pins de lugares, eventos e essenciais; trânsito simulado com geometria osm; parques e água (overpass); pins escalam com o zoom
- **explorar** — lugares num raio de **3 km** (gps contínuo), filtros por categoria e **11 bairros** de poa, seletor poa / bento gonçalves
- **ir** — rotas multimodais (uber, 99, patinetes, ônibus) via osrm; deeplinks para apps de transporte
- **hoje** — agenda de eventos (sympla no backend + mocks)
- **perfil** — nome, foto, interesses, apps de transporte; **lugares salvos**; **sugerir lugar** (contribuição local)
- **assistente** — voz/texto (protótipo)
- **pwa** — instalável; nome curto **tourio** no manifest

## estrutura do repositório

```
frontend/          # react + vite + leaflet (pwa tourio)
backend/           # api node (express) + sympla
api/               # serverless vercel
docs/              # documentação estratégica e técnica
```

## rodar localmente

```bash
npm install
cp .env.example .env   # SYMPLA_TOKEN na raiz
npm run dev            # frontend :5173 + backend :3001
```

- build: `npm run build` → `frontend/dist`
- deploy: [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)

## documentação

### produto e negócio

| documento | conteúdo |
|-----------|----------|
| [docs/PLANO_MERCADO_ODS.md](docs/PLANO_MERCADO_ODS.md) | plano de mercado, monetização e ods |
| [docs/SUGESTOES_APP.md](docs/SUGESTOES_APP.md) | ideias e funcionalidades futuras |
| [docs/MELHORIAS_ADOCAO.md](docs/MELHORIAS_ADOCAO.md) | adoção: técnica, incentivo e comunidade |
| [docs/BACKLOG.md](docs/BACKLOG.md) | backlog por tema (transporte, apis, localidade) |
| [docs/BACKLOG_SCRUMBAN.md](docs/BACKLOG_SCRUMBAN.md) | kanban scrumban e ids de tarefas |

### dados, mapa e comunidade

| documento | conteúdo |
|-----------|----------|
| [docs/FEATURES.md](docs/FEATURES.md) | funcionalidades detalhadas |
| [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) | fontes de dados |
| [docs/CITY_MAPPING.md](docs/CITY_MAPPING.md) | mapeamento de cidades |
| [docs/BAIRROS_POA.md](docs/BAIRROS_POA.md) | bairros e chips no mapa |
| [docs/DADOS_URBANOS_MAPA.md](docs/DADOS_URBANOS_MAPA.md) | pipeline dados → mapa |
| [docs/INGESTAO_CONTEUDO_WEB.md](docs/INGESTAO_CONTEUDO_WEB.md) | instagram, blogs, jornais |
| [docs/ATUALIZACAO_LUGARES.md](docs/ATUALIZACAO_LUGARES.md) | sync e manutenção de lugares |
| [docs/CONTRIBUICAO_USUARIOS.md](docs/CONTRIBUICAO_USUARIOS.md) | sugestões de lugares no app |

### engenharia e ia

| documento | conteúdo |
|-----------|----------|
| [docs/ORGANIZACAO_PROJETO.md](docs/ORGANIZACAO_PROJETO.md) | estrutura e arquitetura do repo |
| [docs/ARQUITETURA_IA.md](docs/ARQUITETURA_IA.md) | três sistemas de ia + implementação |
| [docs/TREINAMENTO_IA_MODELOS.md](docs/TREINAMENTO_IA_MODELOS.md) | fases poa → rs → brasil → mundo |
| [docs/ESCALA_GEOGRAFICA.md](docs/ESCALA_GEOGRAFICA.md) | expansão geográfica |
| [docs/APIS.md](docs/APIS.md) | integrações atuais e planejadas |
| [docs/ODS.md](docs/ODS.md) | objetivos de desenvolvimento sustentável |

## arquitetura de ia (resumo)

três módulos — **inteligência urbana do tourio**:

1. **coleta e atualização** — eventos, lugares, clima, trânsito (apis + curadoria + classificação)
2. **recomendação contextual** — perfil, localização, horário, clima, orçamento
3. **assistente conversacional** — texto e voz, roteiros, explicações

detalhes: [docs/ARQUITETURA_IA.md](docs/ARQUITETURA_IA.md)

## monetização (resumo)

- **b2c freemium** — mapa e rotas básicas grátis; ia avançada e roteiros premium
- **b2b local** — destaque de negócios, feiras, restaurantes
- **parcerias** — sympla, mobilidade, prefeitura/turismo
- **dados agregados** — insights urbanos anonimizados (b2g)

detalhes: [docs/PLANO_MERCADO_ODS.md](docs/PLANO_MERCADO_ODS.md)

## ods atendidas

| ods | como o tourio contribui |
|-----|------------------------|
| 8 | visibilidade para pequenos negócios e feiras |
| 9 | ia e dados urbanos |
| 11 | mobilidade consciente, menos emissões |
| 12 | economia local e feiras |
| 13 | rotas e modos com menor co₂ |
| 10 | acessibilidade e lugares gratuitos |

## licença

projeto mvp — torneio empreendedorismo 2026
