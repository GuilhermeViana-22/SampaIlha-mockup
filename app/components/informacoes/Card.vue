<script setup lang="ts">
import type { Post } from '#shared/types/content'

/** Card de informação/serviço — faixa dourada à esquerda. */
const props = defineProps<{ post: Post }>()
const destino = computed(() => caminhoDoPost(props.post))
</script>

<template>
  <NuxtLink :to="destino" class="info-card">
    <i :class="post.icone" />
    <div>
      <h3>{{ post.titulo }}</h3>
      <p>{{ post.resumo }}</p>
    </div>
  </NuxtLink>
</template>
