#!/usr/bin/env bash
#
# Constroi a imagem do front aqui e publica no registro. A VPS so faz `pull`.
#
# Por que nao buildar la: a VPS tem 1 nucleo e 4 GB. O build do Nuxt pede
# ~1,7 GB de RAM (com o teto do Dockerfile) e ocupa o unico nucleo por minutos —
# nesse intervalo Traefik, MySQL e o SSH ficam sem CPU, e a maquina parece
# travada. Aqui a mesma coisa leva ~40 s e nao atrapalha ninguem.
#
# Uso:
#   ./scripts/publicar-imagem.sh              # publica :latest
#   ./scripts/publicar-imagem.sh v2026-09-06  # publica :latest e :v2026-09-06
#
# Antes da primeira vez, autentique-se uma unica vez no GHCR com um token que
# tenha `write:packages`:
#
#   echo "$GITHUB_TOKEN" | docker login ghcr.io -u GuilhermeViana-22 --password-stdin

set -euo pipefail

# Minusculas obrigatoriamente: o GHCR recusa maiuscula no nome do repositorio.
IMAGEM="${IMAGEM_WEB:-ghcr.io/guilhermeviana-22/sampailha-web}"
ETIQUETA_EXTRA="${1:-}"

cd "$(dirname "$0")/.."

echo "==> Construindo ${IMAGEM}:latest"
# `--target production-stage` para nao publicar o estagio de build junto: o que
# sobe e a imagem de 188 MB (Node + .output), sem node_modules nenhum.
docker build --target production-stage -t "${IMAGEM}:latest" .

if [ -n "$ETIQUETA_EXTRA" ]; then
    docker tag "${IMAGEM}:latest" "${IMAGEM}:${ETIQUETA_EXTRA}"
fi

echo "==> Publicando"
docker push "${IMAGEM}:latest"
[ -n "$ETIQUETA_EXTRA" ] && docker push "${IMAGEM}:${ETIQUETA_EXTRA}"

echo
echo "Pronto. Tamanho publicado:"
docker images --format '  {{.Repository}}:{{.Tag}}  {{.Size}}' "${IMAGEM}"
echo
echo "Agora e so mandar o Dokploy fazer o deploy — ele vai puxar a imagem"
echo "em vez de compilar. Nada de build na VPS."
