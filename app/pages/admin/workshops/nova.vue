<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Nova oficina',
  descricao: 'Cadastre uma oficina da frente de Formação Cultural.',
  acao: null,
})
useSeoMeta({ title: 'Nova oficina — Painel Sampa na Ilha', robots: 'noindex, nofollow' })
</script>

<template>
  <AdminWorkshopsFormulario />
</template>
