# Portal Sampa na Ilha — Frontend (Nuxt 4 SSR → Node/Nitro)
#
# Diferente do client_training (Vue+Vite estatico servido por nginx), este app
# tem rotas em server/api/ que guardam o token em cookie httpOnly. Precisa de
# um runtime Node — build estatico quebraria o login do painel.

FROM node:22-alpine AS build-stage

WORKDIR /app

COPY package.json package-lock.json ./
COPY . .

RUN npm ci && npm run build

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
