<script setup lang="ts">
const rota = useRoute()
const portal = usePortalStore()

const categoria = computed(() => portal.categoria(rota.params.slug as string))
if (!categoria.value) {
  throw createError({ statusCode: 404, statusMessage: 'Editoria não encontrada.', fatal: true })
}

const { data, status } = await useListaConteudo('categoria', () => ({
  categoria: rota.params.slug as string,
  limite: 30,
}))

useSeoMeta({
  title: () => `${categoria.value!.nome} — Portal Sampa na Ilha`,
  description: () => categoria.value!.descricao,
})
</script>

<template>
  <div>
    <ComumHeroPagina
      :titulo="categoria!.nome"
      :descricao="categoria!.descricao"
      etiqueta="Editoria"
      :etiqueta-icone="categoria!.icone"
    />

    <div class="container">
      <div class="layout">
        <main>
          <ComumCabecalhoSecao :titulo="`${data.total} conteúdos em ${categoria!.nome}`" />
          <NoticiasGrade v-if="data.itens.length" :posts="data.itens.slice(0, 6)" />
          <NoticiasLista v-if="data.itens.length > 6" :posts="data.itens.slice(6)" />
          <ComumEstadoVazio
            v-if="!data.itens.length && status !== 'pending'"
            titulo="Nada publicado nesta editoria"
            :descricao="`Assim que houver conteúdo em ${categoria!.nome}, ele aparece aqui.`"
            :icone="categoria!.icone"
          />
        </main>
        <SidebarPrincipal />
      </div>
    </div>
  </div>
</template>
