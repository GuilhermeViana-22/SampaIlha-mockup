<script setup lang="ts">
const rota = useRoute()
const portal = usePortalStore()

const termo = computed(() => (rota.query.q as string) ?? '')
portal.termoBusca = termo.value

const {
  itens, total, temMais, carregando, carregandoMais, erroMais, carregarMais,
} = await useListaPaginada('busca', () => ({
  busca: termo.value || undefined,
}), 20)

useSeoMeta({ title: () => `Busca por "${termo.value}" — Portal Sampa na Ilha` })
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Busca no portal"
      :descricao="termo ? `Resultados para “${termo}”` : 'Digite um termo para buscar matérias, dicas e informações.'"
      etiqueta="Busca"
      etiqueta-icone="fas fa-search"
    />

    <div class="container">
      <div class="layout">
        <main>
          <ComumCabecalhoSecao :titulo="`${total} resultado(s)`" />
          <NoticiasLista v-if="itens.length" :posts="itens" />

          <ComumVerMais
            :mostrando="itens.length"
            :total="total"
            :tem-mais="temMais"
            :carregando="carregandoMais"
            :erro="erroMais"
            substantivo="resultados"
            @carregar="carregarMais"
          />

          <ComumEstadoVazio
            v-if="!itens.length && !carregando"
            titulo="Nenhum resultado encontrado"
            descricao="Tente outro termo, ou navegue pelas categorias na barra azul do topo."
            icone="fas fa-search"
          />
        </main>
        <SidebarPrincipal :tempo="false" />
      </div>
    </div>
  </div>
</template>
