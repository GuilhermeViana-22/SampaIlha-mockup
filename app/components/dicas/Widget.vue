<script setup lang="ts">
/** Bloco compacto de dicas para a sidebar. */
const { data } = await useListaConteudo('dicas-widget', { tipo: 'dica', limite: 4 })
</script>

<template>
  <div v-if="data.itens.length" class="widget">
    <div class="widget-title">
      <i class="fas fa-lightbulb" /> Dicas & Guias
    </div>
    <div class="tip-widget-list">
      <NuxtLink
        v-for="post in data.itens"
        :key="post.id"
        class="tip-widget-item"
        :to="caminhoDoPost(post)"
      >
        <i :class="post.icone" />
        <div>
          <p>{{ post.titulo }}</p>
          <small>{{ post.tempoLeitura }} min de leitura</small>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
