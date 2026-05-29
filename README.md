# zippi — mobilidade urbana inteligente

zippi é um aplicativo de mobilidade urbana que integra transporte público, aplicativos de carona, micromobilidade e dados em tempo real para ajudar o usuário a se locomover pela cidade de forma rápida, sustentável e inteligente.

## objetivo

simplificar a tomada de decisão de mobilidade: em vez de abrir vários apps, o zippi agrega opções, calcula a melhor rota, considera clima e trânsito em tempo real, e abre o aplicativo de transporte correto com um toque.

## funcionalidades principais

- mapa em tempo real com trânsito, natureza (parques, rios) e pins da comunidade
- busca de destinos com geocodificação (nominatim/osm)
- cálculo de rota via osrm
- recomendação de serviços de transporte (uber, 99, indrive, patinetes, bikes)
- deeplinks para abrir apps de transporte diretamente
- aba "essenciais" para encontrar farmácias, mercados e serviços próximos (3km)
- paradas de ônibus próximas ao trajeto (openstreetmap)
- localizações de patinetes/bikes (gbfs)
- assistente de voz (web speech api)
- alertas de clima e trânsito
- modo claro/escuro com glass ui estilo ios

## tecnologias

| camada         | tecnologia                              |
|----------------|-----------------------------------------|
| frontend       | react + vite + tailwind css             |
| mapa           | leaflet.js                              |
| geocodificação | nominatim (openstreetmap)               |
| rota           | osrm (project-osrm.org)                 |
| poi/amenities  | overpass api (openstreetmap)            |
| clima          | open-meteo api                          |
| patinetes      | gbfs (general bikeshare feed spec)      |
| deeplinks      | uber uri scheme, 99app, indriver, etc.  |

## como rodar

```bash
npm install
npm run dev
```

acesse: http://localhost:5173/home

## estrutura de pastas

```
src/
  components/   # componentes de ui (mapa, cards, docks, voz)
  screens/      # tela principal (Home.jsx)
  services/     # integrações externas (geo, overpass, clima, patinetes)
  data/         # dados estáticos (serviços, eventos, essenciais)
  styles/       # sistema de design glass ui
  context/      # contextos react (tema)
docs/
  ARCHITECTURE.md  # arquitetura técnica
  BACKLOG.md       # funcionalidades futuras
```
