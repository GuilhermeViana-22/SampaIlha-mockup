<script setup lang="ts">
import type { Post } from '#shared/types/content'

/** Ticker "Urgente" — alimentado pelas últimas notícias publicadas. */
const { data } = await useListaConteudo('breaking', { tipo: 'noticia', limite: 5 })

/** Sem notícia publicada não há o que noticiar: a faixa some por completo. */
const manchetes = computed<string[]>(() => data.value.itens.map((post: Post) => post.titulo))
</script>

<template>
  <div v-if="manchetes.length" class="breaking">
    <div class="breaking__label">
      <i class="fas fa-bolt" /> Urgente
    </div>
    <div class="breaking__ticker">
      <span>
        <template v-for="(manchete, i) in manchetes" :key="i">
          {{ manchete }}<template v-if="i < manchetes.length - 1"> &nbsp;&bull;&nbsp; </template>
        </template>
      </span>
    </div>
  </div>
</template>
