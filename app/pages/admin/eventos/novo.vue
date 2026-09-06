<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Novo evento',
  descricao: 'Cadastre um evento da agenda cultural.',
  acao: null,
})
useSeoMeta({ title: 'Novo evento — Painel Sampa na Ilha', robots: 'noindex, nofollow' })
</script>

<template>
  <AdminEventosFormulario />
</template>
