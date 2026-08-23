<script setup lang="ts">
/** Ranking por número de leituras, alimentado pela API. */
const { data } = await useListaConteudo('mais-lidos', { ordenar: 'lidos', limite: 5 })
</script>

<template>
  <div class="widget">
    <div class="widget-title">
      <i class="fas fa-fire-alt" /> Mais Lidos
    </div>
    <p v-if="!data.itens.length" style="font-size:.85rem;color:var(--cinza-4);padding:4px 0 2px;">
      Ainda não foram cadastrados conteúdos.
    </p>
    <div v-else class="popular-list">
      <div v-for="(post, indice) in data.itens" :key="post.id" class="popular-item">
        <span class="popular-num">{{ String(indice + 1).padStart(2, '0') }}</span>
        <div>
          <NuxtLink :to="caminhoDoPost(post)">
            <p class="popular-item__title">{{ post.titulo }}</p>
          </NuxtLink>
          <p class="popular-item__meta">
            <i class="fas fa-eye" /> {{ formatarLeituras(post.leituras) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
