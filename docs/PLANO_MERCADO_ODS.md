# plano de mercado e alinhamento ods — tourio

documento estratégico do tourio (copiloto urbano inteligente), centrado em porto alegre no mvp e com expansão planejada para o rio grande do sul e demais regiões do brasil.

---

## resumo executivo

o tourio transforma dados fragmentados da cidade — lugares, eventos, trânsito, clima, mobilidade — em experiências urbanas personalizadas para moradores, turistas e estudantes. diferente de apps de mapa genéricos ou redes sociais, o tourio combina contexto local, mobilidade multimodal e ia conversacional em uma única interface centrada no mapa.

**proposta de valor:** "sua cidade, no seu bolso — do farmácia de emergência ao show de hoje, com a melhor forma de chegar lá."

**mercado inicial:** grande porto alegre (~4,2 milhões na região metropolitana), com extensão para cidades turísticas do rs (bento gonçalves, gramado, santa cruz do sul).

---

## segmentos de mercado

### moradores (core)

**perfil:** adultos 25–45 anos, moradores de bairros centrais e periféricos de porto alegre que usam smartphone diariamente para deslocamento e descoberta local.

**dores:**
- informação urbana espalhada entre google maps, instagram, waze e grupos de whatsapp
- dificuldade de comparar opções de transporte (uber vs 99 vs ônibus vs patinete)
- falta de visão unificada de eventos gratuitos e serviços essenciais no bairro

**jobs to be done:**
- encontrar farmácia, mercado ou saúde a até 3 km rapidamente
- saber o que fazer hoje perto de casa sem pagar ingresso caro
- escolher transporte mais barato ou ecológico para o trabalho

**métricas de sucesso:** retenção semanal (d7 > 25%), sessões com uso de essenciais ou ir, relatos comunitários por usuário ativo.

### turistas (crescimento)

**perfil:** visitantes nacionais e internacionais em porto alegre e rota das vinícolas; estadia média 2–5 dias; alta dependência de smartphone.

**dores:**
- não conhecem bairros, horários ou eventos locais fora dos circuitos óbvios
- google maps não destaca cultura gratuita nem experiências autênticas
- comparação de transporte exige abrir 3–4 apps diferentes

**jobs to be done:**
- descobrir o que fazer hoje sem planejar com antecedência
- ir do hotel ao evento com rota e transporte sugeridos
- explorar gastronomia e cultura com filtros (gratuito, acessível, perto)

**métricas de sucesso:** sessões por visita, uso da aba explorar/hoje, conversão para deeplinks de transporte, nps pós-visita.

### estudantes (viralidade)

**perfil:** universitários ufrgs, pucrs, unisinos, feevale; 18–26 anos; orçamento limitado; alta familiaridade com apps.

**dores:**
- eventos gratuitos e cultura de rua difíceis de centralizar
- mobilidade barata (ônibus, bike, caminhada) pouco integrada a descoberta
- falta de senso de pertencimento à cidade além do campus

**jobs to be done:**
- saber o que rola hoje perto da faculdade
- dividir rotas e descobertas com colegas
- ganhar reconhecimento por contribuir com a comunidade (relatos, reviews)

**métricas de sucesso:** cadastros via parceria universitária, compartilhamentos, uso em horários de intervalo (11h–14h, 17h–22h).

---

## fontes de receita

### 1. freemium (base)

| tier | preço | inclui |
|------|-------|--------|
| tourio free | r$ 0 | mapa, essenciais, eventos básicos, 5 rotas/dia, assistente texto limitado |
| tourio plus | r$ 9,90/mês | rotas ilimitadas, alertas proativos, histórico, assistente voz completo, offline parcial |
| tourio família | r$ 19,90/mês | até 4 perfis, compartilhamento de rotas, modo crianças |

**justificativa:** manter acesso gratuito para ods 10 e 11; monetizar conveniência e personalização avançada.

### 2. listings de comércio local (b2b smb)

- plano básico: presença no mapa explorar (r$ 49/mês)
- plano destaque: pin destacado + badge "parceiro tourio" + analytics (r$ 149/mês)
- plano evento: promoção de evento na aba hoje (r$ 29/evento ou pacote mensal)

**público:** restaurantes, bares, galerias, lojas de bairro, feiras.

**diferencial vs google:** audiência hiperlocal, contexto de eventos e mobilidade integrado, custo acessível para pequenos negócios.

### 3. parcerias de mobilidade (revenue share)

- deeplinks para uber, 99, indriver, whoosh, lime, tembici
- comissão por corrida/viagem iniciada via tourio (negociável: 1–3%)
- destaque patrocinado de modal em rotas específicas (ex.: patinete em distâncias < 2 km)

**estado atual:** deeplinks implementados em `frontend/src/services/deeplinks.js`; apis de preço em tempo real no backlog.

### 4. turismo municipal (b2g)

- licenciamento white-label para prefeituras e secretarias de turismo
- pacote "cidade no mapa": curadoria oficial, eventos, rotas temáticas, dados abertos
- preço referência: r$ 15.000–50.000/ano por município (escala por população)

**casos de uso:** porto alegre (turismo + cultura), bento gonçalves (rota do vinho), gramado (serra gaúcha).

### 5. insights anonimizados (b2b data)

- relatórios agregados de fluxo, interesse por categoria, horários de pico (sem dados pessoais)
- compradores: urbanistas, incorporadoras, varejo, operadores de transporte
- preço: assinatura anual ou projeto pontual (r$ 5.000–30.000)

**governança:** opt-in explícito, k-anonimidade, conformidade lgpd; ver [ESCALA_GEOGRAFICA.md](./ESCALA_GEOGRAFICA.md).

---

## ideias de precificação e unit economics

**meta ano 1 (poa):** 10.000 usuários ativos mensais, 2% conversão plus → ~200 assinantes → r$ 1.980/mês recorrente.

**meta ano 2 (rs):** 50.000 mau, 50 listings smb, 2 parcerias mobilidade, 1 contrato municipal → receita mista ~r$ 25.000/mês.

**meta ano 3 (brasil piloto):** 200.000 mau, receita diversificada com margem positiva em smb + b2g.

**cac estimado:** r$ 3–8 (orgânico + embaixadores + universidades); **ltv plus:** r$ 120–180 (12–18 meses retenção).

---

## go-to-market

### fase 1 — porto alegre (meses 1–12)

1. **mvp público:** mapa poa com essenciais, explorar, hoje, ir (estado atual do repositório)
2. **seed community:** 20 embaixadores de bairro (bom fim, cidad baixa, menino deus, centro histórico)
3. **parcerias:** sympla (eventos), associação comercial local, cicloativistas, coletivos culturais
4. **universidades:** feiras na ufrgs/pucrs, código em troca de feedback estruturado
5. **pr:** "copiloto urbano feito no rs" — mídia local, pitch em hubs (san pedro, acate)

**canais:** instagram (descoberta), whatsapp (grupos de bairro), indicação in-app, qr codes em comércios parceiros.

### fase 2 — rio grande do sul (meses 12–24)

1. replicar template de cidade: bento gonçalves (já parcialmente no app), gramado, pelotas, caxias
2. rota turística integrada: poa ↔ serra ↔ litoral
3. contrato piloto com secretaria de turismo estadual
4. expansão de listings smb em cidades vinícolas

### fase 3 — regiões estratégicas brasil (meses 24–36)

1. curitiba, florianópolis, salvador, belo horizonte (cidades médias com forte turismo/cultura)
2. backend agregador maduro, ia contextual em produção
3. programa de franquia de embaixadores regionais

---

## análise competitiva

### tourio vs google maps

| dimensão | google maps | tourio |
|----------|-------------|-------|
| foco | navegação universal | descoberta + mobilidade + contexto local |
| eventos | limitado, sem curadoria local | aba hoje com sympla + curadoria + filtros gratuitos |
| transporte | sugere modal único | compara uber, 99, patinete, ônibus, caminhada |
| comunidade | reviews genéricos | relatos em tempo real no mapa |
| comércio local | seo pago, grandes redes favorecidas | destaque acessível para smb |
| ia | genérica | assistente com contexto da cidade e preferências do usuário |
| ods | não explícito | métricas de impacto integradas ao produto |

**posicionamento:** "google maps te leva; tourio te mostra a cidade."

### tourio vs uber / 99

| dimensão | uber/99 | tourio |
|----------|---------|-------|
| objetivo | completar corrida | otimizar deslocamento + descoberta |
| multimodal | limitado ao ecossistema próprio | agrega todos os modais + deeplinks |
| preço | mostra só o próprio | compara e sugere alternativa mais barata/eco |
| destino | endereço | lugar, evento, experiência |

**posicionamento:** parceiro de distribuição, não concorrente direto — tourio gera demanda qualificada.

### tourio vs instagram / tiktok

| dimensão | instagram | tourio |
|----------|-----------|-------|
| descoberta | algoritmo global, conteúdo efêmero | mapa geolocalizado, acionável agora |
| confiança | influenciadores patrocinados | dados + comunidade + fontes oficiais |
| ação | link na bio | rota + transporte + horário em um toque |

**posicionamento:** "instagram inspira; tourio executa."

### barreiras de entrada do tourio

- curadoria local profunda (dados poa em `frontend/src/data/poa/`)
- integração multimodal nativa
- pipeline de dados urbanos proprietário
- comunidade e embaixadores de bairro
- alinhamento ods mensurável para editais e parcerias públicas

---

## alinhamento ods com métricas

### ods 8 — trabalho decente e crescimento econômico

**contribuição:**
- visibilidade para comércio local e eventos culturais
- geração de demanda para motoristas e operadores de micromobilidade via summarizing revenue to local businesses via listings

**métricas:**
- número de negócios locais listados
- cliques e rotas geradas para comércio parceiro
- receita estimada redirecionada (proxy via deeplinks + analytics)

**meta ano 3:** 500 smb ativos, 50.000 rotas/mês para destinos comerciais locais.

### ods 9 — indústria, inovação e infraestrutura

**contribuição:**
- plataforma de dados urbanos abertos e apis
- inovação em mobilidade multimodal e ia contextual
- infraestrutura digital para cidades inteligentes

**métricas:**
- apis/documentação pública consumida por terceiros
- uptime do agregador de dados
- cidades com pipeline de dados ativo

**meta ano 3:** 5 cidades com `/api/city/{slug}/map` em produção.

### ods 10 — redução das desigualdades

**contribuição:**
- acesso gratuito a informação urbana essencial
- destaque de eventos e lugares gratuitos
- comparação de transporte favorecendo opções acessíveis

**métricas:**
- % sessões usando tier free vs plus
- % recomendações com opção gratuita ou de baixo custo
- usuários em bairros periféricos (distribuição geográfica)

**meta ano 3:** 40% usuários ativos fora do eixo centro/bom fim.

### ods 11 — cidades e comunidades sustentáveis

**contribuição:**
- mapeamento de parques, praças e corpos d'água (overpass)
- incentivo a transporte público e micromobilidade
- relatos comunitários colaborativos

**métricas:**
- km de rotas ecológicas sugeridas (bike, patinete, a pé)
- relatos comunitários validados
- parques e áreas verdes mapeadas por cidade

**meta ano 3:** 30% rotas com modal eco; 1.000 relatos/mês validados.

### ods 12 — consumo e produção responsáveis

**contribuição:**
- incentivo a feiras, comércio local e eventos de economia circular
- redução de viagens redundantes via planejamento integrado

**métricas:**
- destinos categorizados como "economia local"
- co₂ evitado estimado por viagens multimodais eco

**meta ano 3:** 10 toneladas co₂ equivalente evitadas/mês (modelo de cálculo documentado).

### ods 13 — ação contra a mudança global do clima

**contribuição:**
- ranking de transporte com fator de emissão
- histórico de viagens ecológicas
- alertas de clima severo (open-meteo) para evitar deslocamentos desnecessários

**métricas:**
- % usuários escolhendo modal eco quando disponível
- viagens com emissão abaixo da média da cidade

**meta ano 3:** 25% das rotas completadas via modal zero ou baixa emissão.

---

## roadmap de 3 anos

### ano 1 — fundação (2026)

| trimestre | entregas |
|-----------|----------|
| q1 | mvp poa estável, sympla backend, overpass trânsito/natureza |
| q2 | onboarding interesses, assistente voz básico, relatos comunidade |
| q3 | 1.000 usuários, 10 embaixadores, primeiros listings smb piloto |
| q4 | bento gonçalves completo, métricas ods v1, pitch prefeitura poa |

### ano 2 — tração rs (2027)

| trimestre | entregas |
|-----------|----------|
| q1 | backend agregador redis, gtfs trensurb, push notifications |
| q2 | gramado + pelotas, ia recomendação contextual fase 2 |
| q3 | contrato turismo rs, 50 smb, parceria mobilidade revenue share |
| q4 | 50.000 mau, tourio plus lançado, break-even operacional parcial |

### ano 3 — escala (2028)

| trimestre | entregas |
|-----------|----------|
| q1 | expansão curitiba + floripa, api pública de dados urbanos |
| q2 | ia conversacional completa (rag + memória), white-label municipal |
| q3 | 200.000 mau, insights b2b, internacional piloto (montevidéu ou lisboa) |
| q4 | série seed ou edital de inovação urbana, 5+ cidades br pleno |

---

## riscos e mitigações

| risco | impacto | mitigação |
|-------|---------|-----------|
| dependência de apis gratuitas (nominatim, overpass) | alto | backend proxy + cache + instância própria osm |
| google maps absorve features | médio | foco hiperlocal, comunidade, ods, smb |
| baixa monetização inicial | médio | freemium + smb antes de b2g |
| lgpd em dados de movimento | alto | opt-in, anonimização, dpo desde ano 2 |
| churn pós-turismo | médio | gamificação, hábitos diários (essenciais, alertas) |

---

## referências internas

- [APIS.md](./APIS.md) — integrações atuais
- [ODS.md](./ODS.md) — visão original de impacto
- [ESCALA_GEOGRAFICA.md](./ESCALA_GEOGRAFICA.md) — expansão territorial
- [MELHORIAS_ADOCAO.md](./MELHORIAS_ADOCAO.md) — estratégia de adoção
- [ARQUITETURA_IA.md](./ARQUITETURA_IA.md) — diferencial tecnológico
