<script setup lang="ts">
const portal = usePortalStore()
</script>

<template>
  <div class="search-bar" :class="{ 'is-open': portal.buscaAberta }">
    <form class="search-bar__inner" @submit.prevent="portal.buscar()">
      <input
        v-model="portal.termoBusca"
        type="search"
        placeholder="Buscar por matérias, dicas, editorias ou tags…"
        aria-label="Buscar no portal"
      >
      <button class="btn-subscribe" type="submit">
        <i class="fas fa-search" /> Buscar
      </button>
    </form>
  </div>
</template>
