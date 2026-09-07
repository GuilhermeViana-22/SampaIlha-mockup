<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Editar guia',
  descricao: 'Ajuste o conteúdo deste guia.',
  acao: null,
})

const rota = useRoute()
const guias = useGuiasStore()

const guia = await guias.buscarPorId(rota.params.id as string)

if (!guia) {
  throw createError({ statusCode: 404, statusMessage: 'Guia não encontrado.', fatal: true })
}

useSeoMeta({ title: `Editando: ${guia.titulo}`, robots: 'noindex, nofollow' })
</script>

<template>
  <AdminGuiasFormulario :guia="guia" />
</template>
