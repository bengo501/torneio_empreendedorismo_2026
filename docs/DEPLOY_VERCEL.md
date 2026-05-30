# deploy na vercel

guia para publicar o zippi (vite + react + pwa).

## pré-requisitos

- conta em https://vercel.com
- repositório no github (recomendado) ou deploy via cli
- chave sympla (opcional): `VITE_SYMPLA_TOKEN`

---

## opção a — github (recomendado)

1. envie o projeto para um repositório github (sem o arquivo `.env`)
2. em https://vercel.com/new importe o repositório
3. a vercel detecta **vite** automaticamente:
   - build: `npm run build`
   - output: `dist`
4. em **environment variables** adicione:

| nome | valor | ambientes |
|------|-------|-----------|
| `VITE_SYMPLA_TOKEN` | sua chave sympla | production, preview |
| `VITE_SYMPLA_PROXY` | `/api/sympla` | production, preview |

5. clique em **deploy**
6. url final: `https://seu-projeto.vercel.app/home` (use `/home` como entrada)

---

## opção b — cli

```bash
npm i -g vercel
vercel login
cd torneio_empreendedorismo_2026
vercel
```

na primeira vez, confirme:

- framework: vite
- build: `npm run build`
- output: `dist`

para produção:

```bash
vercel --prod
```

variáveis pela cli:

```bash
vercel env add VITE_SYMPLA_TOKEN production
vercel env add VITE_SYMPLA_PROXY production
# valor de VITE_SYMPLA_PROXY: /api/sympla
```

---

## o que o `vercel.json` faz

| regra | função |
|-------|--------|
| `/api/sympla/*` → `api.sympla.com.br` | proxy sympla (cors) em produção |
| spa fallback → `index.html` | rotas `/home`, `/profile`, etc. |
| cache em `/assets/*` | js/css com hash |

o proxy do `vite.config.js` só vale no `npm run dev`; na vercel usa o rewrite acima.

---

## variáveis de ambiente

só variáveis com prefixo `VITE_` entram no bundle do navegador.

- **obrigatório para sympla ao vivo:** `VITE_SYMPLA_TOKEN`
- **opcional:** `VITE_SYMPLA_PROXY` (padrão já é `/api/sympla`)

**não** cole a chave no github. configure só no painel da vercel.

---

## depois do deploy

1. abra `https://<seu-dominio>/home`
2. teste gps / mapa (https é obrigatório para geolocalização)
3. aba **hoje** — deve mostrar `· sympla` se o token estiver certo
4. instale como pwa (adicionar à tela inicial no celular)

---

## problemas comuns

| sintoma | solução |
|---------|---------|
| página 404 em `/home` | confirme rewrite spa no `vercel.json` |
| sympla não carrega | `VITE_SYMPLA_TOKEN` na vercel + redeploy |
| mapa em branco | verifique console; tiles carto precisam de rede |
| gps não funciona | abrir site em **https**; permitir localização no browser |
| build falha | rode `npm run build` local e corrija erros de typescript |

---

## domínio customizado

vercel → projeto → settings → domains → adicione seu domínio e siga o dns.

---

## referências

- [vercel vite](https://vercel.com/docs/frameworks/vite)
- [rewrites](https://vercel.com/docs/projects/project-configuration#rewrites)
