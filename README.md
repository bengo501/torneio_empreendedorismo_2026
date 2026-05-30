# zippi — mobilidade urbana inteligente

zippi conecta pessoas à cidade: essenciais no bairro, cultura para explorar, eventos de hoje e transporte multimodal — tudo em um mapa.

## objetivo

ajudar moradores e turistas a descobrir e se deslocar pela cidade com informação local, opções gratuitas e pagas, e integração com apps de transporte.

## documentação

| documento | conteúdo |
|-----------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | arquitetura técnica |
| [docs/FEATURES.md](docs/FEATURES.md) | funcionalidades do app |
| [docs/APIS.md](docs/APIS.md) | integrações e apis |
| [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) | fontes de dados |
| [docs/CITY_MAPPING.md](docs/CITY_MAPPING.md) | mapeamento urbano |
| [docs/ODS.md](docs/ODS.md) | alinhamento com ods da onu |
| [docs/BACKLOG.md](docs/BACKLOG.md) | funcionalidades futuras |

## stack

react + vite + tailwind + leaflet + openstreetmap + osrm + open-meteo

## rodar localmente

```bash
npm install
npm run dev
```

acesse: http://localhost:5173/home

### variáveis locais

copie `.env.example` → `.env` e preencha `VITE_SYMPLA_TOKEN` se quiser eventos sympla.

## deploy na vercel

guia completo: [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)

resumo:

1. importe o repo em [vercel.com/new](https://vercel.com/new)
2. adicione `VITE_SYMPLA_TOKEN` nas environment variables
3. deploy → acesse `https://<projeto>.vercel.app/home`

## estrutura

```
src/
  components/   # mapa, docks, cards, voz
  screens/      # home, perfil, login
  services/     # geo, overpass, clima, patinetes, deeplinks
  data/         # lugares, eventos, transporte
  context/      # tema, usuário
  styles/       # glass ui
docs/           # documentação completa
```

## cidades (mvp)

- porto alegre (gps + explorar)
- bento gonçalves (explorar remoto)

## licença

projeto mvp — torneio empreendedorismo 2026
