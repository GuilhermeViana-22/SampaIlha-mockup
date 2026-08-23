<script setup lang="ts">
import type { Post } from '#shared/types/content'

/** Card de dica/guia — visual próprio, com faixa ciano no topo. */
const props = defineProps<{ post: Post }>()
const destino = computed(() => caminhoDoPost(props.post))
</script>

<template>
  <article class="tip-card">
    <div class="tip-card__icon">
      <i :class="post.icone" />
    </div>
    <NuxtLink :to="destino">
      <h3 class="tip-card__title">{{ post.titulo }}</h3>
    </NuxtLink>
    <p class="tip-card__excerpt">{{ post.resumo }}</p>
    <div class="tip-card__meta">
      <span><i class="fas fa-clock" /> {{ post.tempoLeitura }} min</span>
      <span><i class="fas fa-eye" /> {{ formatarLeituras(post.leituras) }}</span>
    </div>
  </article>
</template>
