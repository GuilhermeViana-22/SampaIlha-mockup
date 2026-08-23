<script setup lang="ts">
import type { Post } from '#shared/types/content'

defineProps<{ posts: Post[] }>()
</script>

<template>
  <section v-if="posts.length" class="post-related">
    <ComumCabecalhoSecao titulo="Leia também" />
    <NoticiasLista :posts="posts" />
  </section>
</template>
