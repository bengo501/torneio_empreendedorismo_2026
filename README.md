# turio — copiloto urbano inteligente

turio (antes zippi) conecta pessoas à cidade com **mobilidade multimodal**, **mapa contextual**, **descoberta de lugares e eventos** e **ia personalizada**. o mvp está centrado em **porto alegre**, com dados mockados e geometria real via openstreetmap.

## visão

> transformar dados fragmentados da cidade (lugares, eventos, trânsito, clima, mobilidade) em **experiências urbanas personalizadas** para moradores e turistas — com impacto em economia local, sustentabilidade e inclusão.

## o que o app faz hoje

- mapa com pins de lugares, eventos, essenciais e trânsito simulado
- parques e água com polígonos reais (overpass)
- rotas multimodais (uber, 99, patinetes, ônibus) via osrm
- onboarding com interesses em **categorias expansivas** (categoria → grupo → tag)
- perfil editável: nome, foto, telefone, interesses, apps de transporte
- assistente de voz/texto (protótipo)
- eventos via sympla (backend) + mocks locais

## estrutura do repositório

```
frontend/          # react + vite + leaflet (pwa)
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

build: `npm run build` → `frontend/dist`

deploy: [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)

## documentação completa

### produto e negócio

| documento | conteúdo |
|-----------|----------|
| [docs/PLANO_MERCADO_ODS.md](docs/PLANO_MERCADO_ODS.md) | plano de mercado, monetização e ods |
| [docs/SUGESTOES_APP.md](docs/SUGESTOES_APP.md) | ideias e funcionalidades futuras |
| [docs/MELHORIAS_ADOCAO.md](docs/MELHORIAS_ADOCAO.md) | adoção real: técnica + incentivo + comunidade |

### engenharia e ia

| documento | conteúdo |
|-----------|----------|
| [docs/ORGANIZACAO_PROJETO.md](docs/ORGANIZACAO_PROJETO.md) | como estruturar e arquitetar o projeto |
| [docs/ARQUITETURA_IA.md](docs/ARQUITETURA_IA.md) | três sistemas de ia + implementação passo a passo |
| [docs/DADOS_URBANOS_MAPA.md](docs/DADOS_URBANOS_MAPA.md) | pipeline de dados → mapa dinâmico |
| [docs/ESCALA_GEOGRAFICA.md](docs/ESCALA_GEOGRAFICA.md) | poa → rs → brasil → mundo |

### operação

| documento | conteúdo |
|-----------|----------|
| [docs/BACKLOG_SCRUMBAN.md](docs/BACKLOG_SCRUMBAN.md) | backlog, todos e kanban scrumban |
| [docs/APIS.md](docs/APIS.md) | integrações atuais e planejadas |
| [docs/FEATURES.md](docs/FEATURES.md) | funcionalidades |
| [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) | fontes de dados |
| [docs/CITY_MAPPING.md](docs/CITY_MAPPING.md) | mapeamento de cidades |
| [docs/ODS.md](docs/ODS.md) | objetivos de desenvolvimento sustentável |

## arquitetura de ia (resumo)

três módulos integrados — **sistema de inteligência urbana do turio**:

1. **coleta e atualização** — eventos, lugares, clima, trânsito (apis + curadoria + classificação por llm)
2. **recomendação contextual** — perfil, localização, horário, clima, orçamento
3. **assistente conversacional** — texto e voz, roteiros, explicações

detalhes: [docs/ARQUITETURA_IA.md](docs/ARQUITETURA_IA.md)

## monetização (resumo)

- **b2c freemium**: rotas e mapa grátis; ia avançada e roteiros premium
- **b2b local**: destaque de negócios, feiras, restaurantes (economia local)
- **parcerias**: sympla, operadoras de mobilidade, prefeitura/turismo
- **dados agregados**: insights urbanos anonimizados (b2g)

detalhes: [docs/PLANO_MERCADO_ODS.md](docs/PLANO_MERCADO_ODS.md)

## ods atendidas

| ods | como o turio contribui |
|-----|------------------------|
| 8 | trabalho decente — visibilidade para pequenos negócios e feiras |
| 9 | indústria e inovação — ia e dados urbanos |
| 11 | cidades sustentáveis — mobilidade consciente, menos emissões |
| 12 | consumo responsável — economia local e feiras |
| 13 | clima — rotas e modos com menor co₂ |
| 10 | redução de desigualdades — acessibilidade e lugares gratuitos |

## licença

projeto mvp — torneio empreendedorismo 2026
