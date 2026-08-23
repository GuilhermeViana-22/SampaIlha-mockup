<script setup lang="ts">
import type { Post } from '#shared/types/content'

/** Card padrão da grade de notícias (3 colunas). */
const props = defineProps<{ post: Post }>()
const destino = computed(() => caminhoDoPost(props.post))
</script>

<template>
  <article class="news-card">
    <NuxtLink :to="destino" class="news-card__thumb">
      <ComumCapa :capa="post.capa" :icone="post.icone" :imagem-url="post.imagemUrl" :alt="post.titulo" />
    </NuxtLink>
    <div class="news-card__body">
      <ComumBadge :post="post" />
      <NuxtLink :to="destino">
        <h3 class="news-card__title">{{ post.titulo }}</h3>
      </NuxtLink>
      <p class="news-card__excerpt">{{ post.resumo }}</p>
      <div class="news-card__meta">
        <span><i class="fas fa-calendar-alt" /> {{ formatarDataCurta(post.publicadoEm) }}</span>
        <span><i class="fas fa-clock" /> {{ post.tempoLeitura }} min</span>
      </div>
    </div>
  </article>
</template>
