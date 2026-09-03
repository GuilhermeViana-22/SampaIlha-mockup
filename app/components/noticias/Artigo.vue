<script setup lang="ts">
import type { Post } from '#shared/types/content'

/** Corpo da matéria: capa, texto, tags e barra de compartilhamento. */
const props = defineProps<{ post: Post }>()

const corpo = computed(() => corpoDoPost(props.post.conteudo))

/**
 * A foto que está na capa, para sabermos de quem é o crédito.
 *
 * `imagemUrl` tanto pode vir de `image_url` (campo solto da API) quanto da
 * galeria, então só o casamento pela URL diz qual das fotos está em cima. Sem
 * ele, uma matéria com várias fotos mostraria sob a capa o crédito da
 * primeira da lista — que é justamente o erro que ninguém percebe na revisão.
 */
const fotoDaCapa = computed(() => {
  const imagens = props.post.imagens ?? []
  return imagens.find(imagem => imagem.url === props.post.imagemUrl)
    ?? imagens.find(imagem => imagem.capa)
    ?? null
})
</script>

<template>
  <article class="post-body">
    <ComumBadge :post="post" />
    <h1>{{ post.titulo }}</h1>

    <div class="meta">
      <span><i class="fas fa-calendar-alt" /> {{ formatarData(post.publicadoEm) }}</span>
      <span><i class="fas fa-pen" /> {{ post.autor }}</span>
      <span><i class="fas fa-clock" /> {{ post.tempoLeitura }} min de leitura</span>
      <span><i class="fas fa-eye" /> {{ formatarLeituras(post.leituras) }}</span>
    </div>

    <figure class="post-capa">
      <div class="post-cover">
        <ComumCapa
          :capa="post.capa"
          :icone="post.icone"
          :imagem-url="post.imagemUrl"
          :alt="fotoDaCapa?.legenda || post.titulo"
        />
      </div>
      <figcaption v-if="fotoDaCapa && (fotoDaCapa.legenda || fotoDaCapa.credito)" class="foto-texto">
        <span v-if="fotoDaCapa.legenda">{{ fotoDaCapa.legenda }}</span>
        <span v-if="fotoDaCapa.credito" class="foto-texto__credito">{{ fotoDaCapa.credito }}</span>
      </figcaption>
    </figure>

    <blockquote v-if="post.resumo">
      {{ post.resumo }}
    </blockquote>

    <!-- eslint-disable-next-line vue/no-v-html -- HTML do editor, já filtrado na API ao salvar -->
    <div class="post-conteudo" v-html="corpo" />

    <div v-if="post.tags.length" class="post-tags">
      <NuxtLink v-for="tag in post.tags" :key="tag" class="tag" :to="{ path: '/busca', query: { q: tag } }">
        <i class="fas fa-hashtag" /> {{ tag }}
      </NuxtLink>
    </div>

    <NoticiasCompartilhar :titulo="post.titulo" />
  </article>
</template>
