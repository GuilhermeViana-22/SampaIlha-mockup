<script setup lang="ts">
import type { TagEmAlta } from '#shared/types/content'

/** Assuntos em alta — ranking de tags calculado pela API. */
const { data } = await useFetch<TagEmAlta[]>('/api/tags', {
  key: 'tags-widget',
  params: { limite: 12 },
  default: () => [],
})
</script>

<template>
  <div v-if="data.length" class="widget">
    <div class="widget-title">
      <i class="fas fa-hashtag" /> Assuntos em Alta
    </div>
    <div class="tags">
      <NuxtLink
        v-for="tag in data"
        :key="tag.slug"
        class="tag"
        :to="{ path: '/busca', query: { q: tag.nome } }"
      >
        <i class="fas fa-hashtag" /> {{ tag.nome }}
      </NuxtLink>
    </div>
  </div>
</template>
