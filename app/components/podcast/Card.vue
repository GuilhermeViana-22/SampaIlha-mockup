<script setup lang="ts">
import type { Episodio } from '#shared/types/podcast'
import { PLATAFORMAS_EPISODIO } from '#shared/types/podcast'

/**
 * Um episódio no feed.
 *
 * O formato é o de rede social de propósito: cabeçalho com quem publicou e
 * quando, o texto, e o player ocupando a largura inteira embaixo. É o que o
 * cliente pediu ao falar em "um post em cima do outro" — a leitura desce numa
 * coluna só, e o episódio já toca ali, sem tirar ninguém da página.
 *
 * A capa só aparece quando não há player: o embed do Spotify e o do YouTube já
 * trazem a arte do episódio dentro deles, e repetir a imagem em cima
 * empurraria o botão de tocar para baixo da dobra no celular.
 */
const props = defineProps<{ episodio: Episodio }>()

const plataforma = computed(() => PLATAFORMAS_EPISODIO[props.episodio.plataforma])

const quando = computed(() =>
  new Date(props.episodio.publicadoEm).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }),
)
</script>

<template>
  <article class="ep-card">
    <header class="ep-card__topo">
      <div class="ep-card__avatar" :style="{ background: plataforma.cor }">
        <i class="fas fa-microphone-lines" />
      </div>
      <div class="ep-card__quem">
        <strong>Podcast Sampa na Ilha</strong>
        <span class="ep-card__meta">
          <time :datetime="episodio.publicadoEm">{{ quando }}</time>
          <template v-if="episodio.duracao"> · {{ episodio.duracao }}</template>
          <template v-if="episodio.plataforma !== 'outro'"> · {{ plataforma.rotulo }}</template>
        </span>
      </div>
      <span v-if="episodio.numero !== null" class="ep-card__numero">EP {{ episodio.numero }}</span>
    </header>

    <div class="ep-card__corpo">
      <h3 class="ep-card__titulo">
        {{ episodio.titulo }}
      </h3>
      <p v-if="episodio.descricao" class="ep-card__texto">
        {{ episodio.descricao }}
      </p>
    </div>

    <img
      v-if="episodio.capaUrl && !episodio.embedUrl"
      class="ep-card__capa"
      :src="episodio.capaUrl"
      :alt="`Capa do episódio ${episodio.titulo}`"
      loading="lazy"
    >

    <PodcastPlayer :episodio="episodio" />
  </article>
</template>
