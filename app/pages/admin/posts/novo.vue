<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Novo conteúdo',
  descricao: 'Notícia, dica ou página de informação — tudo pelo mesmo formulário.',
  acao: null,
})
useSeoMeta({ title: 'Novo conteúdo — Painel Sampa na Ilha', robots: 'noindex, nofollow' })


</script>

<template>
  <AdminPostsFormulario />
</template>
