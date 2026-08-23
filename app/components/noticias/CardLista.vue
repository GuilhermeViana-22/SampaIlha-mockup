<script setup lang="ts">
import type { Post } from '#shared/types/content'

/** Card horizontal usado no "Giro de Notícias". */
const props = defineProps<{ post: Post }>()
const destino = computed(() => caminhoDoPost(props.post))
</script>

<template>
  <article class="list-card">
    <NuxtLink :to="destino" class="list-card__thumb">
      <ComumCapa :capa="post.capa" :icone="post.icone" :imagem-url="post.imagemUrl" :alt="post.titulo" />
    </NuxtLink>
    <div class="list-card__body">
      <ComumBadge :post="post" />
      <NuxtLink :to="destino">
        <h3 class="list-card__title">{{ post.titulo }}</h3>
      </NuxtLink>
      <div class="list-card__meta">
        <span><i class="fas fa-calendar-alt" /> {{ formatarDataCurta(post.publicadoEm) }}</span>
        <span><i class="fas fa-pen" /> {{ post.autor }}</span>
      </div>
    </div>
  </article>
</template>
