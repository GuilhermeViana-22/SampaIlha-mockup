<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

/**
 * Atalho de volta ao topo. As listas do portal são longas no celular e o
 * cabeçalho fica fixo, mas a barra de editorias não — quem desceu 30 matérias
 * precisava de muitos gestos para voltar à navegação.
 */
const { y } = useWindowScroll()
const visivel = computed(() => y.value > 900)

function subir() {
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' })
}
</script>

<template>
  <Transition name="voltar-topo">
    <button
      v-show="visivel"
      class="voltar-topo"
      type="button"
      title="Voltar ao topo"
      aria-label="Voltar ao topo"
      @click="subir"
    >
      <i class="fas fa-arrow-up" />
    </button>
  </Transition>
</template>
