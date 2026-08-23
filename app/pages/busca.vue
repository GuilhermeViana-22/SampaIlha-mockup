<script setup lang="ts">
const rota = useRoute()
const portal = usePortalStore()

const termo = computed(() => (rota.query.q as string) ?? '')
portal.termoBusca = termo.value

const { data, status } = await useListaConteudo('busca', () => ({
  busca: termo.value || undefined,
  limite: 40,
}))

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
          <ComumCabecalhoSecao :titulo="`${data.total} resultado(s)`" />
          <NoticiasLista v-if="data.itens.length" :posts="data.itens" />
          <ComumEstadoVazio
            v-else-if="status !== 'pending'"
            titulo="Nenhum resultado encontrado"
            descricao="Tente outro termo, ou navegue pelas editorias na barra azul do topo."
            icone="fas fa-search"
          />
        </main>
        <SidebarPrincipal :tempo="false" />
      </div>
    </div>
  </div>
</template>
