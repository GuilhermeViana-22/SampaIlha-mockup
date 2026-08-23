<script setup lang="ts">
import type { Post } from '#shared/types/content'

/** Vitrine da home: 1 destaque principal + 2 secundários. */
const props = defineProps<{ posts: Post[] }>()

const principal = computed(() => props.posts[0])
const secundarios = computed(() => props.posts.slice(1, 3))
</script>

<template>
  <div v-if="principal" class="hero-grid">
    <article class="hero-main">
      <ComumCapa :capa="principal.capa" :icone="principal.icone" :imagem-url="principal.imagemUrl" :alt="principal.titulo" />
      <div class="card-overlay" />
      <div class="hero-main__content">
        <ComumBadge rotulo="Destaque" icone="fas fa-star" cor="cyan" />
        <NuxtLink :to="caminhoDoPost(principal)">
          <h1 class="hero-main__title">{{ principal.titulo }}</h1>
        </NuxtLink>
        <div class="meta">
          <span><i class="fas fa-calendar-alt" /> {{ formatarData(principal.publicadoEm) }}</span>
          <span><i class="fas fa-eye" /> {{ formatarLeituras(principal.leituras) }}</span>
          <span><i class="fas fa-pen" /> {{ principal.autor }}</span>
        </div>
      </div>
    </article>

    <article v-for="post in secundarios" :key="post.id" class="hero-secondary">
      <ComumCapa :capa="post.capa" :icone="post.icone" :imagem-url="post.imagemUrl" :alt="post.titulo" />
      <div class="card-overlay card-overlay--light" />
      <div class="hero-secondary__content">
        <ComumBadge :post="post" />
        <NuxtLink :to="caminhoDoPost(post)">
          <h2 class="hero-secondary__title">{{ post.titulo }}</h2>
        </NuxtLink>
        <div class="meta">
          <span><i class="fas fa-calendar-alt" /> {{ formatarDataCurta(post.publicadoEm) }}</span>
          <span><i class="fas fa-clock" /> {{ post.tempoLeitura }} min</span>
        </div>
      </div>
    </article>
  </div>
</template>
