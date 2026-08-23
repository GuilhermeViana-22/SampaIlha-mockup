<script setup lang="ts">
import type { CapaGradiente } from '#shared/types/content'

/** Capa do conteúdo: imagem real quando houver, gradiente + ícone como fallback. */
const props = withDefaults(defineProps<{
  capa?: CapaGradiente
  icone?: string
  imagemUrl?: string | null
  alt?: string
}>(), {
  capa: 'bg-1',
  icone: 'fas fa-newspaper',
  imagemUrl: null,
  alt: '',
})
</script>

<template>
  <div class="img-bg" :class="props.capa">
    <img
      v-if="props.imagemUrl"
      :src="props.imagemUrl"
      :alt="props.alt"
      style="width:100%;height:100%;object-fit:cover;"
    >
    <i v-else :class="props.icone" />
  </div>
</template>
