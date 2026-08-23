<script setup lang="ts">
import type { BadgeCor, Post } from '#shared/types/content'

/**
 * Etiqueta de editoria. Toda matéria já traz nome, ícone e cor da editoria
 * resolvidos pela API — não precisa consultar tabela nenhuma para renderizar.
 */
const props = defineProps<{
  post?: Post
  categoria?: string
  rotulo?: string
  icone?: string
  cor?: BadgeCor
}>()

const portal = usePortalStore()

const dados = computed(() => {
  if (props.post && !props.rotulo) {
    return {
      rotulo: props.post.categoriaNome,
      icone: props.icone ?? props.post.categoriaIcone,
      cor: props.cor ?? props.post.categoriaCor,
    }
  }

  const daTaxonomia = props.categoria ? portal.categoria(props.categoria) : undefined
  return {
    rotulo: props.rotulo ?? daTaxonomia?.nome ?? props.categoria ?? '',
    icone: props.icone ?? daTaxonomia?.icone ?? 'fas fa-tag',
    cor: props.cor ?? daTaxonomia?.cor ?? 'blue',
  }
})
</script>

<template>
  <span class="badge" :class="`badge--${dados.cor}`">
    <i :class="dados.icone" /> {{ dados.rotulo }}
  </span>
</template>
