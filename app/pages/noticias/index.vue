<script setup lang="ts">
useSeoMeta({
  title: 'Notícias — Portal Sampa na Ilha',
  description: 'Todas as notícias do Portal Sampa na Ilha: São Paulo, Amazônia e as cinco regiões do Brasil.',
})

const portal = usePortalStore()
const categoriaAtiva = ref<string>('')

const { data, status } = await useListaConteudo('lista-noticias', () => ({
  tipo: 'noticia',
  categoria: categoriaAtiva.value || undefined,
  limite: 24,
}))
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Notícias"
      descricao="A cobertura completa do portal — de São Paulo às cinco regiões do Brasil."
      etiqueta="Editorias"
      etiqueta-icone="fas fa-newspaper"
    />

    <div class="container">
      <div class="layout">
        <main>
          <div class="tags" style="margin:24px 0 20px;">
            <button
              class="tag"
              :style="categoriaAtiva === '' ? 'background:var(--azul);border-color:var(--azul);color:#fff' : ''"
              @click="categoriaAtiva = ''"
            >
              <i class="fas fa-th-large" /> Todas
            </button>
            <button
              v-for="categoria in portal.categorias"
              :key="categoria.slug"
              class="tag"
              :style="categoriaAtiva === categoria.slug ? 'background:var(--azul);border-color:var(--azul);color:#fff' : ''"
              @click="categoriaAtiva = categoria.slug"
            >
              <i :class="categoria.icone" /> {{ categoria.nome }}
            </button>
          </div>

          <ComumCabecalhoSecao :titulo="`${data.total} matérias publicadas`" />

          <NoticiasGrade v-if="data.itens.length" :posts="data.itens.slice(0, 6)" />
          <NoticiasLista v-if="data.itens.length > 6" :posts="data.itens.slice(6)" />

          <ComumEstadoVazio
            v-if="!data.itens.length && status !== 'pending'"
            titulo="Nenhuma matéria nesta editoria ainda"
            descricao="Assim que uma matéria for publicada nesta editoria, ela aparece aqui."
            icone="fas fa-newspaper"
          />
        </main>

        <SidebarPrincipal />
      </div>
    </div>
  </div>
</template>
