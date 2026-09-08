# Testes — Dicas & Guias

O painel chama de **guia** o que a API guarda como post de `type=dica`: é o
mesmo registro que o site público lê em `/dicas`. Não existe tabela de guias, e
as rotas de `server/api/guias/` são só um repasse para `/posts` da API Python.

## Rodar

```bash
npm install        # uma vez
npm test           # modo watch
npm run test:run   # execução única (CI)
```

O runner é o **vitest** com **happy-dom**. `test/setup.ts` instala como globais
os auto-imports que o Nuxt injeta em produção — `useRuntimeConfig`, `$fetch`, os
ajudantes do h3 (`defineEventHandler`, `getQuery`, `readBody`…) e `ref`/`computed`
do Vue. É o que permite importar a rota e a store **de verdade** dentro do teste,
em vez de reescrever a lógica delas no `it()`.

Para testar uma rota, `defineEventHandler` devolve a própria função e o "evento"
é o objeto de `criarEvento({ query, body, params })`:

```ts
import { criarEvento } from '../../../test/setup'
import handler from './index.get'

const resposta = await handler(criarEvento({ query: { pagina: 2 } }))
```

## O que está coberto

| Arquivo | Cobre |
| --- | --- |
| `server/utils/guias.test.ts` | tradução API ↔ painel: `paraGuia`, `paraPayloadGuia` (força `type=dica`, descarta campos do servidor, devolve a foto ao caminho relativo) e `paramsListagemGuias` (filtros → query da API) |
| `server/api/guias/index.get.test.ts` | listagem: busca em `/posts?type=dica`, repassa filtros, ignora `status` de quem não tem sessão, propaga erro da API |
| `server/api/guias/index.post.test.ts` | criação: grava na API, exige sessão, responde 201 com o guia traduzido |
| `server/api/guias/[id].test.ts` | leitura, edição, exclusão e os PATCH de status e destaque |
| `app/stores/guias.test.ts` | store Pinia: carregar/paginar, criar, atualizar, remover, publicar, destacar, filtros, ordenação e contagens |

## Verificação manual do CRUD

Os testes acima não sobem servidor. Para conferir que o guia criado no painel
chega ao site, com a API em `localhost:9041` e `npm run dev` em `localhost:3000`:

```bash
curl -s -c /tmp/c.txt -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@portalsampanailha.com.br","senha":"SUA_SENHA"}'

ID=$(curl -s -b /tmp/c.txt -X POST localhost:3000/api/guias -H 'Content-Type: application/json' \
  -d '{"status":"rascunho","titulo":"Guia de teste","slug":"guia-de-teste","resumo":"r","conteudo":"<p>c</p>","categoria":"turismo","tags":[]}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')

curl -s -b /tmp/c.txt -X PATCH "localhost:3000/api/guias/$ID/status?status=publicado"
curl -s localhost:3000/dicas | grep "Guia de teste"       # site público
curl -s -b /tmp/c.txt "localhost:3000/admin/guias/$ID" | grep "Guia de teste"   # painel
curl -s -b /tmp/c.txt -X DELETE "localhost:3000/api/guias/$ID"
```

## Ainda não coberto

- Componentes (`.vue`) e navegação do painel — `@vue/test-utils` já está
  instalado, mas nenhum componente tem teste.
- Testes end-to-end com navegador. Não há Playwright no projeto; a verificação
  de ponta a ponta é a sequência de `curl` acima.
