<script setup lang="ts">
const rota = useRoute()
const { data, error } = await useMateria(() => rota.params.slug as string)

if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Dica não encontrada.', fatal: true })
}

const post = computed(() => data.value!.post)

// Contagem de audiência: dispara sozinha quando o leitor demonstra estar lendo.
useRegistroLeitura(() => post.value.id)

useSeoConteudo(() => ({
  titulo: post.value.titulo,
  tituloPagina: `${post.value.titulo} — Dicas & Guias`,
  resumo: post.value.resumo,
  imagem: post.value.imagemUrl,
  tipo: 'article',
  publicadoEm: post.value.publicadoEm,
  atualizadoEm: post.value.atualizadoEm,
  autor: post.value.autor,
  secao: post.value.categoriaNome,
}))
</script>

<template>
  <div class="container">
    <nav class="post-breadcrumb">
      <NuxtLink to="/">Início</NuxtLink>
      <i class="fas fa-chevron-right" style="font-size:.6rem" />
      <NuxtLink to="/dicas">Dicas & Guias</NuxtLink>
    </nav>

    <div class="post-layout">
      <NoticiasCompartilhar :titulo="post.titulo" flutuante />
      <div>
        <NoticiasArtigo :post="post" />
        <NoticiasRelacionadas :posts="data!.relacionados" />
      </div>
      <SidebarPrincipal :tempo="false" :dicas="false" />
    </div>
  </div>
</template>
