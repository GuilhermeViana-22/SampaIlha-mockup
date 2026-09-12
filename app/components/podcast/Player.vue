<script setup lang="ts">
import type { Episodio } from '#shared/types/podcast'
import { PLATAFORMAS_EPISODIO } from '#shared/types/podcast'

/**
 * O player do episódio, embutido da própria plataforma.
 *
 * `loading="lazy"` não é detalhe: o feed empilha os cards, e cada player do
 * Spotify ou do YouTube carrega scripts próprios. Sem o adiamento, abrir a
 * página com dez episódios dispararia dez carregamentos de terceiros de uma
 * vez — a página levaria segundos para responder ao primeiro toque.
 *
 * Sem `embedUrl` não há moldura vazia: o card mostra o link para a plataforma,
 * que é como o leitor ainda alcança o episódio.
 */
const props = defineProps<{ episodio: Episodio }>()

const plataforma = computed(() => PLATAFORMAS_EPISODIO[props.episodio.plataforma])

/*
   A altura do player é decisão de cada plataforma, não nossa: o do Spotify é
   uma faixa (152px é a medida oficial do embed compacto), o do YouTube é um
   vídeo 16:9. Forçar a mesma caixa nos dois deixaria tarja preta em volta do
   vídeo ou espaço morto embaixo do áudio.
*/
const ehVideo = computed(() => props.episodio.plataforma === 'youtube')
</script>

<template>
  <div v-if="episodio.embedUrl" class="ep-player" :class="{ 'ep-player--video': ehVideo }">
    <iframe
      :src="episodio.embedUrl"
      :title="`Player do episódio: ${episodio.titulo}`"
      loading="lazy"
      frameborder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowfullscreen
    />
  </div>

  <a
    v-else
    class="ep-player__externo"
    :href="episodio.midiaUrl"
    target="_blank"
    rel="noopener"
  >
    <i :class="plataforma.icone" />
    <span>
      <strong>Ouvir o episódio</strong>
      <small>Abre em {{ plataforma.rotulo === 'Link externo' ? 'outra aba' : plataforma.rotulo }}</small>
    </span>
    <i class="fas fa-arrow-up-right-from-square" />
  </a>
</template>
