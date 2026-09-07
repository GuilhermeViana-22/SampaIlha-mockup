<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Editar vaga',
  descricao: 'Ajuste a descrição, a foto e o link desta oportunidade.',
  acao: null,
})

const rota = useRoute()
const vagas = useVagasStore()

const vaga = await vagas.buscarPorId(rota.params.id as string)

if (!vaga) {
  throw createError({ statusCode: 404, statusMessage: 'Vaga não encontrada.', fatal: true })
}

useSeoMeta({ title: `Editando: ${vaga.titulo}`, robots: 'noindex, nofollow' })
</script>

<template>
  <AdminVagasFormulario :vaga="vaga" />
</template>
