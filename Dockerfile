# Portal Sampa na Ilha — Frontend (Nuxt 4 SSR → Node/Nitro)
#
# Diferente do client_training (Vue+Vite estatico servido por nginx), este app
# tem rotas em server/api/ que guardam o token em cookie httpOnly. Precisa de
# um runtime Node — build estatico quebraria o login do painel.

FROM node:22-alpine AS build-stage

WORKDIR /app

# Teto do heap do V8 durante o build.
#
# Sem limite, o build do Nuxt chega a ~3 GB de RSS, e numa VPS pequena quem
# encerra a festa e o OOM killer do kernel — que mata o processo sem imprimir
# erro nenhum. O log para no meio de uma fase ("621 modules transformed" e
# silencio), o Dokploy tenta de novo e o deploy entra em loop sem nada que
# explique a falha.
#
# Com teto o V8 coleta lixo com mais agressividade em vez de crescer ate ser
# morto. E se um dia estourar de verdade, o erro vem escrito na tela
# ("JavaScript heap out of memory") em vez de sumico.
ENV NODE_OPTIONS=--max-old-space-size=2048

# As dependencias entram antes do codigo-fonte de proposito: a camada do
# `npm ci` so e refeita quando o package-lock muda, entao um deploy que mexe
# apenas em .vue/.ts reaproveita os 400 MB de node_modules ja instalados. Na
# ordem antiga o `COPY . .` vinha primeiro e invalidava essa camada a cada
# commit — reinstalando tudo, e pagando a memoria disso, em todo deploy.
COPY package.json package-lock.json ./

# `--ignore-scripts` pula o postinstall (`nuxt prepare`), que nao teria como
# rodar aqui: o nuxt.config e o app/ so chegam no COPY seguinte. O `nuxt build`
# gera por conta propria o que o prepare geraria.
RUN npm ci --ignore-scripts --no-audit --no-fund

COPY . .

RUN npm run build

FROM node:22-alpine AS production-stage

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=9042
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=9042

# Back-end do portal (api_python_sampa). Sobrescrevivel pelo ambiente.
ENV NUXT_API_BASE=https://api.portalsampanailha.com.br/api/v1
ENV NUXT_PUBLIC_API_ORIGIN=https://api.portalsampanailha.com.br
ENV NUXT_PUBLIC_SITE_URL=https://portalsampanailha.com.br

COPY --from=build-stage /app/.output ./.output

EXPOSE 9042

CMD ["node", ".output/server/index.mjs"]
