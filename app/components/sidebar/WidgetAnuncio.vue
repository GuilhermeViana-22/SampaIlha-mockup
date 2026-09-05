<script setup lang="ts">
import type { Publicidade } from '#shared/types/content'

/**
 * Publicidade da coluna lateral.
 *
 * Só existe card quando existe anunciante. A API devolve apenas os anúncios
 * publicados e dentro da janela contratada, e a lista vazia é resposta
 * esperada: sem nada no ar, este componente não desenha nada — nem moldura
 * cinza, nem convite para anunciar. O leitor não precisa ver que há um espaço
 * à venda ali.
 */
const { data } = await useFetch<Publicidade[]>('/api/publicidade', {
  key: 'publicidade-sidebar',
  default: () => [],
})
</script>

<template>
  <div v-for="anuncio in data" :key="anuncio.id" class="widget ad-widget">
    <p><i class="fas fa-bullhorn" /> Publicidade</p>
    <h3>{{ anuncio.titulo }}</h3>
    <small v-if="anuncio.descricao">{{ anuncio.descricao }}</small>

    <!--
      `sponsored` é o que diz aos buscadores que este link é pago — sem ele, o
      portal estaria passando reputação para o anunciante sem querer.
    -->
    <a
      v-if="anuncio.linkUrl"
      :href="anuncio.linkUrl"
      target="_blank"
      rel="noopener noreferrer sponsored"
      class="ad-banner-link"
    >
      <img class="ad-banner" :src="anuncio.imagemUrl" :alt="anuncio.titulo" loading="lazy">
    </a>
    <img v-else class="ad-banner" :src="anuncio.imagemUrl" :alt="anuncio.titulo" loading="lazy">
  </div>
</template>
