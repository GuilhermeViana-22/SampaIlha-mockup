<script setup lang="ts">
import type { Post } from '#shared/types/content'

defineProps<{ posts: Post[] }>()
</script>

<template>
  <div class="info-grid">
    <InformacoesCard v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>
