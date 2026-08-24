<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Editar oficina',
  descricao: 'Ajuste o texto, a data e o link de inscrição desta oficina.',
  acao: null,
})

const rota = useRoute()
const workshops = useWorkshopsStore()

const oficina = await workshops.buscarPorId(rota.params.id as string)

if (!oficina) {
  throw createError({ statusCode: 404, statusMessage: 'Oficina não encontrada.', fatal: true })
}

useSeoMeta({ title: `Editando: ${oficina.titulo}`, robots: 'noindex, nofollow' })
</script>

<template>
  <AdminWorkshopsFormulario :oficina="oficina" />
</template>
