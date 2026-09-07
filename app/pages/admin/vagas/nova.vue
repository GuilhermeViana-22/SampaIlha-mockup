<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Nova vaga',
  descricao: 'Cadastre uma oportunidade recebida pelo portal.',
  acao: null,
})
useSeoMeta({ title: 'Nova vaga — Painel Sampa na Ilha', robots: 'noindex, nofollow' })
</script>

<template>
  <AdminVagasFormulario />
</template>
