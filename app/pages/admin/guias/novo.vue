<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Novo guia',
  descricao: 'Crie um novo guia para o portal.',
  acao: null,
})

useSeoMeta({ title: 'Novo guia — Painel Sampa na Ilha', robots: 'noindex, nofollow' })
</script>

<template>
  <AdminGuiasFormulario />
</template>
