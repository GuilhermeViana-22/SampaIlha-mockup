<script setup lang="ts">
const rota = useRoute()
const { data, error } = await useMateria(() => rota.params.slug as string)

if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Página não encontrada.', fatal: true })
}

const post = computed(() => data.value!.post)

// Contagem de audiência: dispara sozinha quando o leitor demonstra estar lendo.
useRegistroLeitura(() => post.value.id)

useSeoMeta({
  title: () => `${post.value.titulo} — Portal Sampa na Ilha`,
  description: () => post.value.resumo,
})
</script>

<template>
  <div class="container">
    <nav class="post-breadcrumb">
      <NuxtLink to="/">Início</NuxtLink>
      <i class="fas fa-chevron-right" style="font-size:.6rem" />
      <NuxtLink to="/informacoes">Informações</NuxtLink>
    </nav>

    <div class="post-layout">
      <NoticiasCompartilhar :titulo="post.titulo" flutuante />
      <div>
        <NoticiasArtigo :post="post" />
        <NoticiasRelacionadas :posts="data!.relacionados" />
      </div>
      <SidebarPrincipal :tempo="false" />
    </div>
  </div>
</template>
