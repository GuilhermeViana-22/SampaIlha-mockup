<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Editar conteúdo',
  descricao: 'Ajuste o texto, a classificação e a publicação desta matéria.',
  acao: null,
})

const rota = useRoute()
const posts = usePostsStore()

const post = await posts.buscarPorId(rota.params.id as string)

if (!post) {
  throw createError({ statusCode: 404, statusMessage: 'Conteúdo não encontrado.', fatal: true })
}

useSeoMeta({ title: `Editando: ${post.titulo}`, robots: 'noindex, nofollow' })

</script>

<template>
  <AdminPostsFormulario :post="post" />
</template>
