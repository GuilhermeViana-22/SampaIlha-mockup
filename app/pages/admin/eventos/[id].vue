<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Editar evento',
  descricao: 'Ajuste o texto, a data, o cartaz e o link de inscrição deste evento.',
  acao: null,
})

const rota = useRoute()
const eventos = useEventosStore()

const evento = await eventos.buscarPorId(rota.params.id as string)

if (!evento) {
  throw createError({ statusCode: 404, statusMessage: 'Evento não encontrado.', fatal: true })
}

useSeoMeta({ title: `Editando: ${evento.titulo}`, robots: 'noindex, nofollow' })
</script>

<template>
  <AdminEventosFormulario :evento="evento" />
</template>
