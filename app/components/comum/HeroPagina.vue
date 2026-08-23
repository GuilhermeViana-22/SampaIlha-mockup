<script setup lang="ts">
defineProps<{
  titulo: string
  descricao?: string
  etiqueta?: string
  etiquetaIcone?: string
  etiquetaCor?: string
}>()
</script>

<template>
  <section class="page-hero">
    <span v-if="etiqueta" class="badge" :class="`badge--${etiquetaCor ?? 'cyan'}`">
      <i :class="etiquetaIcone ?? 'fas fa-star'" /> {{ etiqueta }}
    </span>
    <h1>{{ titulo }}</h1>
    <p v-if="descricao">{{ descricao }}</p>
  </section>
</template>
