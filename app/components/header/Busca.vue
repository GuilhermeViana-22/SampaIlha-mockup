<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'

const portal = usePortalStore()
const campo = ref<HTMLInputElement | null>(null)

/** Abrir a busca já entrega o cursor no campo — sem um toque a mais. */
watch(() => portal.buscaAberta, async (aberta) => {
  if (!aberta) return
  await nextTick()
  campo.value?.focus()
})

onKeyStroke('Escape', () => {
  if (portal.buscaAberta) portal.alternarBusca()
})
</script>

<template>
  <div id="busca-portal" class="search-bar" :class="{ 'is-open': portal.buscaAberta }">
    <form class="search-bar__inner" role="search" @submit.prevent="portal.buscar()">
      <input
        ref="campo"
        v-model="portal.termoBusca"
        type="search"
        placeholder="Buscar por matérias, dicas, editorias ou tags…"
        aria-label="Buscar no portal"
        enterkeyhint="search"
      >
      <button class="btn-subscribe" type="submit" :disabled="!portal.termoBusca.trim()">
        <i class="fas fa-search" /> <span class="btn-subscribe__rotulo">Buscar</span>
      </button>
    </form>
  </div>
</template>
