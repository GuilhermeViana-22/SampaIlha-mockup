<script setup lang="ts">
import type { Post } from '#shared/types/content'

/** Corpo da matéria: capa, texto, tags e barra de compartilhamento. */
const props = defineProps<{ post: Post }>()

const corpo = computed(() => corpoDoPost(props.post.conteudo))
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

    <div class="post-cover">
      <ComumCapa :capa="post.capa" :icone="post.icone" :imagem-url="post.imagemUrl" :alt="post.titulo" />
    </div>

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
