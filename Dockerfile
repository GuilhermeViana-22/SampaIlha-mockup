# Portal Sampa na Ilha — Frontend (Nuxt 4 SSR → Node/Nitro)
#
# Diferente do client_training (Vue+Vite estatico servido por nginx), este app
# tem rotas em server/api/ que guardam o token em cookie httpOnly. Precisa de
# um runtime Node — build estatico quebraria o login do painel.

FROM node:22-alpine AS build-stage

WORKDIR /app

# Teto do heap do V8 durante o build.
#
# Medido nesta base de codigo, com `/usr/bin/time -v`:
#
#     sem teto      pico 2,83 GB de RSS   build ok
#     teto 2048     pico ~2,4 GB          build ok
#     teto 1536     pico 1,68 GB          build ok, 38 s
#     teto 1024     pico 1,31 GB          ESTOURA (exit 134, heap out of memory)
#
# A VPS tem 4 GB e um nucleo. Depois de MySQL, API, Traefik e o proprio Dokploy
# nao sobram os ~2,4 GB que o teto de 2048 permitia: o kernel entra em swap e a
# maquina inteira para de responder — nao so o build. 1536 e o menor teto que
# ainda compila, com folga de 512 MB sobre o ponto de ruptura.
#
# Isto reduz o risco, nao o elimina: o gargalo maior e a CPU. Com um nucleo so,
# o build ocupa a maquina por minutos e Traefik, MySQL e o proprio SSH ficam sem
# vez. Por isso o caminho recomendado e nao buildar na VPS — ver
# `scripts/publicar-imagem.sh` e o comentario no docker-compose.dokploy.yml.
ENV NODE_OPTIONS=--max-old-space-size=1536

# As dependencias entram antes do codigo-fonte de proposito: a camada do
# `npm ci` so e refeita quando o package-lock muda, entao um deploy que mexe
# apenas em .vue/.ts reaproveita os 400 MB de node_modules ja instalados. Na
# ordem antiga o `COPY . .` vinha primeiro e invalidava essa camada a cada
# commit — reinstalando tudo, e pagando a memoria disso, em todo deploy.
COPY package.json package-lock.json ./

# `--omit=dev` mantem o ferramental de teste (vitest, happy-dom,
# @vue/test-utils) fora da VPS: eles sao devDependencies e nunca chegam a ser
# baixados aqui. Medido nesta imagem, o `node_modules` do build tem 406 MB e
# 474 pacotes com ou sem os testes declarados no package.json — a diferenca
# fica em 0 MB, e o build passa a falhar de verdade se algum dia alguem
# importar uma dev dependency no runtime.
#
# O que este flag NAO tira: `typescript` e `vue-tsc` continuam vindo de carona
# (pinia depende de typescript; o nuxt, de vite-plugin-checker, que depende de
# vue-tsc). Sao dependencias de producao de terceiros, nao ha como omiti-las
# sem quebrar a instalacao.
#
# `--ignore-scripts` pula o postinstall (`nuxt prepare`), que nao teria como
# rodar aqui: o nuxt.config e o app/ so chegam no COPY seguinte. O `nuxt build`
# gera por conta propria o que o prepare geraria.
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

COPY . .

RUN npm run build

# Estagio final: so o Node e o `.output`.
#
# O Nitro empacota no `.output` tudo o que o servidor precisa, entao aqui nao
# entra `node_modules` nenhum — nem de producao, nem de desenvolvimento. Sao
# 27 MB de aplicacao sobre a imagem base; o `node_modules` de 400 MB fica no
# estagio de build e nao viaja para a VPS.
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
