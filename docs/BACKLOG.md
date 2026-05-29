# backlog — funcionalidades futuras

## transporte público

### paradas de metrô
- integração com o mapa de linhas do metrô de porto alegre (trensurb)
- exibir estações mais próximas com tempo estimado de caminhada
- deep link para o app trensurb ou site oficial
- api: dados abertos do trensurb ou gtfs público

### paradas de táxi
- parceria com cooperativas de táxi (coopertramp, rádio táxi, etc.)
- exibir pontos de táxi próximos ao usuário
- mostrar disponibilidade em tempo real (se api disponível)
- fallback: abrir 99taxi ou wpp do taxista

### integração com cartão trilho / tri
- mostrar saldo do cartão do usuário (requer parceria com ceptc/empresa de ônibus)
- alertar quando saldo estiver baixo
- exibir rotas de ônibus com linhas em tempo real (gps dos ônibus)

## micromobilidade — apis de patinetes/bikes

as apis abaixo estão pendentes de parceria ou acesso:

| operador   | cobertura poa | api disponível | status          |
|------------|---------------|----------------|-----------------|
| whoosh     | sim           | gbfs (key)     | pendente        |
| lime       | sim           | gbfs (key)     | pendente        |
| tembici    | sim           | proprietária   | pendente        |
| green      | sim           | gbfs (key)     | pendente        |
| jet        | verificar     | proprietária   | verificar       |
| flash      | verificar     | gbfs (key)     | pendente        |

para cada operador: solicitar acesso ao endpoint gbfs ou api proprietária,
adicionar api key ao `.env` e habilitar em `src/services/scooters.js`.

## melhorias de localidade

- implementar cache de busca por cidade detectada para evitar buscas duplicadas
- integrar dados do ibge para limites municipais exatos
- permitir que o usuário "fixe" a cidade manualmente

## social / comunidade

- sistema de pontos por relatos de incidentes no mapa
- ranking de contribuidores
- validação cruzada de relatos por outros usuários
- histórico pessoal de relatos

## navegação turn-by-turn

- instruções voz por voz durante a rota
- recalcular rota se desvio detectado
- integração com tts (text-to-speech) nativo do browser
- suporte a modos de transporte (carro, bike, a pé)

## pagamento integrado

- exibir preços em tempo real via apis dos aplicativos de transporte
- comparar preços entre uber, 99, indrive em tempo real
- histórico de corridas e gastos mensais

## acessibilidade

- rotas acessíveis (evitar escadas, calcadas irregulares)
- integração com dados de acessibilidade do osm
- modo alto contraste
- leitor de tela compatível

## b2b / empresas

- painel para empresas acompanharem deslocamentos de funcionários
- benefícios de transporte (vale transporte inteligente)
- relatórios de emissão de CO₂ por equipe

## infraestrutura

- backend próprio para cache distribuído (redis) e autenticação
- api própria para geolocalização em tempo real sem dependência do nominatim
- websockets para atualização de tráfego e pins em tempo real
- pwa (progressive web app) com modo offline básico
