# sugestões de funcionalidades — turio

catálogo de ideias para evolução do turio além do mvp atual (mapa poa, essenciais, explorar, hoje, ir, assistente voz protótipo). organizado por domínio; priorização em [BACKLOG_SCRUMBAN.md](./BACKLOG_SCRUMBAN.md).

---

## mapa e visualização

1. **modo satélite híbrido** — alternar entre carto dark/light e imagem de satélite com labels
2. **clusters inteligentes de pins** — agrupar por densidade com contagem e zoom progressivo
3. **heatmap de atividade** — camada opcional mostrando zonas com mais eventos/relatos nas últimas 24h
4. **timeline do mapa** — slider temporal para ver eventos passados e futuros no mesmo viewport
5. **modo noturno automático** — tiles e pins adaptados ao horário local
6. **pins 3d por categoria** — ícones diferenciados por altura/cor (já parcialmente no mvp)
7. **mini preview ao hover** — card flutuante com foto, horário e distância sem abrir sheet completa
8. **modo exploração guiada** — rota serpenteante conectando 3–5 lugares culturais próximos
9. **camadas toggleáveis** — trânsito, natureza, eventos, essenciais, comunidade, patinetes
10. **mapa offline por bairro** — cache de tiles + pois curados para uso sem rede
11. **realidade aumentada (fase 2)** — câmera apontando para rua mostra pins de lugares visíveis
12. **comparador de bairros** — side-by-side de densidade de serviços entre dois bairros

---

## mobilidade e transporte

13. **preços em tempo real uber/99/indriver** — apis oficiais ou estimativa via parceiros
14. **gtfs trensurb completo** — horários, estações, tempo de espera
15. **gps de ônibus ao vivo** — integração ceptc ou dados abertos quando disponíveis
16. **cartão tri/trilho** — saldo e recarga via deeplink ou parceria
17. **multimodal otimizado** — combinar caminhada + metrô + patinete em rota única
18. **estacionamento próximo** — pois osm + parceiros com vagas e preço
19. **pontos de táxi** — cooperativas locais com telefone/wpp
20. **modo entrega** — rotas otimizadas para entregadores (múltiplas paradas)
21. **alertas de bloqueio de via** — push quando rota favorita é afetada
22. **histórico de gastos com transporte** — gráfico mensal por modal
23. **carona solidária** — matching básico entre usuários com mesma rota (com moderação)
24. **rotas acessíveis** — evitar escadas, priorizar rampas (tags osm wheelchair)

---

## social e comunidade

25. **relatos com validação cruzada** — upvote/downvote de alertas de trânsito e obras
26. **perfil público de contribuidor** — badge por bairro, ranking semanal
27. **grupos de bairro** — feed local filtrado por região
28. **compartilhar rota** — link ou qr com destino + modal sugerido
29. **convites** — gamificação por indicar amigos
30. **check-in em lugares** — presença opcional com privacidade granular
31. **listas colaborativas** — "melhores cafés do bom fim" criadas pela comunidade
32. **moderação comunitária** — embaixadores aprovam relatos suspeitos
33. **integração whatsapp** — enviar evento do dia para grupo com um toque
34. **stories locais** — conteúdo efêmero geolocalizado (24h) de comerciantes e usuários

---

## gamificação

35. **pontos turio** — por relatos, check-ins, rotas eco, descobertas
36. **missões diárias** — "visite um parque", "use transporte eco", "reporte trânsito"
37. **conquistas** — selos por bairros explorados, eventos gratuitos, km a pé
38. **ranking por bairro** — competição saudável entre regiões
39. **recompensas locais** — desconto em parceiro smb ao completar missão
40. **streak de uso** — dias consecutivos abrindo o app
41. **nivel de embaixador** — trilha para usuários que viram curadores oficiais
42. **desafios sazonais** — carnaval, oktoberfest bento, natal luz gramado

---

## inteligência artificial

43. **assistente guia completo** — rag sobre dados da cidade + preferências do usuário
44. **recomendação contextual** — "chovendo? aqui estão museus cobertos perto"
45. **classificação automática de lugares** — few-shot sobre categorias do interestTree
46. **resumo de eventos** — ia gera "seu fim de semana" personalizado
47. **tradução automática** — turistas estrangeiros veem descrições em en/es
48. **detecção de anomalias** — pico de relatos de trânsito dispara alerta proativo
49. **chat multimodal** — enviar foto de placa/evento e ia identifica lugar
50. **memória de preferências** — lembra transportes favoritos, restrições alimentares
51. **planejador de dia** — "monte meu sábado com até r$ 50, mostly a pé"
52. **síntese de reviews** — agrega opiniões de múltiplas fontes em parágrafo único

ver implementação detalhada em [ARQUITETURA_IA.md](./ARQUITETURA_IA.md).

---

## economia local

53. **marketplace de experiências** — workshops, tours guiados, degustações
54. **cupons de comerciantes** — parceiros smb oferecem desconto via app
55. **feiras e mercados** — calendário de feiras livres com horário e produtos
56. **destaque a negócios de impacto** — cooperativas, economia solidária, artesanato
57. **programa "compre local"** — badge em lugares independentes vs redes
58. **reserva de mesa** — deeplink ou api para restaurantes parceiros
59. **doação para causas locais** — arredondamento em turio plus
60. **vitrine de artesãos** — perfil ampliado para produtores na rota do vinho

---

## acessibilidade e inclusão

61. **modo alto contraste** — além do dark/light atual
62. **leitor de tela otimizado** — aria labels em mapa e sheets
63. **tamanho de fonte ajustável** — preferência global
64. **rotas sem barreiras** — filtros wheelchair, cadeira de bebê, evitar ladeiras
65. **legendas em vídeos de eventos** — quando houver conteúdo multimídia
66. **modo daltonismo** — paleta de pins adaptada
67. **navegação por teclado** — desktop e leitores
68. **linguagem simples** — toggle para textos em linguagem fácil
69. **alertas sonoros configuráveis** — para usuários com deficiência visual
70. **intérprete de libras (fase longa)** — avatar em vídeos institucionais

---

## b2b e empresas

71. **painel do comerciante** — editar horário, promoção, foto do pin
72. **analytics de descoberta** — quantas visualizações e rotas gerou
73. **turio for teams** — deslocamento corporativo, relatórios co₂
74. **api white-label** — prefeitura embeda mapa turio no site oficial
75. **gestão de eventos oficiais** — secretaria publica eventos verificados
76. **campanhas patrocinadas** — destaque temporário em categoria (ex.: pizza)
77. **integração erp/fechamento** — horário de funcionamento sincronizado
78. **certificação "parceiro verificado"** — selo após validação presencial

---

## dados e infraestrutura

79. **endpoint `/api/city/{slug}/map`** — agregação server-side de todas as camadas
80. **scheduler de ingestão** — cron para sympla, rss, scraping portais locais
81. **campo confidence em todos os pois** — score 0–1 por fonte e freshness
82. **deduplicação fuzzy** — mesmo lugar de osm + google + curadoria → um pin
83. **versionamento de dados** — diff de pois entre releases
84. **export open data** — cidade publica dataset derivado (anonimizado)
85. **webhooks de alerta** — parceiros recebem eventos de pico de tráfego
86. **observabilidade** — dashboards de latência overpass, sympla, osrm
87. **feature flags** — lançar funcionalidades por cidade ou % usuários
88. **a/b testing nativo** — experimentos em recomendação e onboarding

---

## funcionalidades transversais

89. **notificações push inteligentes** — evento perto, chuva, trânsito na rota habitual
90. **widget home screen** — "eventos hoje" ou "trânsito no caminho"
91. **atalhos siri/google assistant** — "ei turio, farmácia perto"
92. **modo turista vs morador** — ui adaptada ao perfil declarado
93. **multi-idioma** — pt-br, en, es desde fase internacional
94. **modo economia de bateria** — reduz polling e animações
95. **sincronização entre dispositivos** — favoritos e histórico na nuvem
96. **modo família** — perfis infantis com lugares seguros
97. **integração calendário** — exportar evento salvo para google/apple calendar
98. **deep linking universal** — `turio.app/poa/evento/123` abre direto no app

---

## matriz de priorização sugerida

| impacto / esforço | quick wins | projetos estratégicos |
|-------------------|------------|----------------------|
| alto impacto, baixo esforço | push notifications, clusters, compartilhar rota | preços mobilidade tempo real |
| alto impacto, alto esforço | ia guia completa | gtfs + gps ônibus |
| médio | gamificação básica, cupons smb | realidade aumentada |

---

## sugestões por persona

### morador poa — top 10

1. alertas trânsito na rota habitual (push matinal)
2. essenciais 24h com filtro "aberto agora"
3. comparador uber vs 99 vs ônibus em um card
4. relatos comunitários com validação
5. histórico de gastos transporte
6. rotas eco com co₂ economizado
7. feiras e mercados do bairro no mapa
8. modo "emergência" — farmácia/hospital mais próximo
9. salvar lugares favoritos por bairro
10. integração cartão tri (saldo)

### turista — top 10

1. roteiro "1 dia no centro histórico" guiado
2. eventos gratuitos hoje destacados
3. tradução en/es de descrições
4. modo offline poa centro
5. deeplink rota completa hotel → evento
6. badge "entrada gratuita"
7. mapa térmico de aglomeração (evitar filas)
8. parceiros gastronômicos com cupom
9. check-in gamificado em pontos turísticos
10. compartilhar roteiro com companions

### estudante — top 10

1. filtro "grátis" default na aba hoje
2. mapa campus + bibliotecas + bandejão
3. eventos universitários (sympla + boards ufrgs)
4. ranking inter-campus (gamificação)
5. carona solidária entre faculdades
6. horários biblioteca integrados
7. alertas show gratuito same-day
8. parceria centro acadêmico (qr codes)
9. modo "intervalo" — sugestões a 15 min a pé
10. desconto smb parceiro com email .edu

---

## dependências entre sugestões

algumas funcionalidades só fazem sentido após infra base:

```
turio-301 agregador api
  ├── scheduler eventos (88)
  ├── confidence scores (81)
  ├── deduplicação (82)
  └── endpoint city map (79)

turio-401 ia fase 1
  ├── recomendação contextual (44)
  ├── resumo eventos (46)
  └── planejador de dia (51)

turio-501 embaixadores
  ├── moderação comunitária (32)
  ├── listas colaborativas (31)
  └── vitrine artesãos (60)
```

---

## critérios para aceitar sugestão no backlog

1. alinhada a segmento prioritário (morador, turista, estudante)
2. viável com stack atual ou roadmap 12 meses
3. mensurável (métrica de sucesso definida)
4. não duplica google maps sem diferencial local
5. contribui para ods mensurável quando possível

---

## referências

- estado atual: [FEATURES.md](./FEATURES.md)
- backlog operacional: [BACKLOG_SCRUMBAN.md](./BACKLOG_SCRUMBAN.md)
- adoção: [MELHORIAS_ADOCAO.md](./MELHORIAS_ADOCAO.md)
- ia: [ARQUITETURA_IA.md](./ARQUITETURA_IA.md)
