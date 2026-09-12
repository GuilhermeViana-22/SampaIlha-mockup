<script setup lang="ts">
const rota = useRoute()
const portal = usePortalStore()

const categoria = computed(() => portal.categoria(rota.params.slug as string))
if (!categoria.value) {
  throw createError({ statusCode: 404, statusMessage: 'Categoria não encontrada.', fatal: true })
}

const {
  itens, total, temMais, carregando, carregandoMais, erroMais, carregarMais,
} = await useListaPaginada('categoria', () => ({
  categoria: rota.params.slug as string,
}), 24)

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
      etiqueta="Categoria"
      :etiqueta-icone="categoria!.icone"
    />

    <div class="container">
      <div class="layout">
        <main>
          <ComumCabecalhoSecao :titulo="`${total} conteúdos em ${categoria!.nome}`" />
          <NoticiasGrade v-if="itens.length" :posts="itens.slice(0, 6)" />
          <NoticiasLista v-if="itens.length > 6" :posts="itens.slice(6)" />

          <ComumVerMais
            :mostrando="itens.length"
            :total="total"
            :tem-mais="temMais"
            :carregando="carregandoMais"
            :erro="erroMais"
            substantivo="conteúdos"
            @carregar="carregarMais"
          />

          <ComumEstadoVazio
            v-if="!itens.length && !carregando"
            titulo="Nada publicado nesta categoria"
            :descricao="`Assim que houver conteúdo em ${categoria!.nome}, ele aparece aqui.`"
            :icone="categoria!.icone"
          />
        </main>
        <SidebarPrincipal />
      </div>
    </div>
  </div>
</template>
