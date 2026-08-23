<script setup lang="ts">
import type { Post } from '#shared/types/content'

defineProps<{ posts: Post[] }>()
</script>

<template>
  <div class="news-grid">
    <NoticiasCard v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>
