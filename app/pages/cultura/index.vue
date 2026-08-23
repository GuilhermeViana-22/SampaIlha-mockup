<script setup lang="ts">
useSeoMeta({
  title: 'Cultura & Arte — Portal Sampa na Ilha',
  description: 'Cobertura jornalística e histórica da cultura amazônica, do Festival de Parintins e das tradições que o Sampa na Ilha traz para São Paulo.',
})

const { data } = await useListaConteudo('cultura', { categoria: 'cultura', limite: 12 })
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Cultura & Arte"
      descricao="Cobertura jornalística e histórica da cultura amazônica, do Festival de Parintins e das tradições que o Sampa na Ilha traz para São Paulo."
      etiqueta="Cultura"
      etiqueta-icone="fas fa-theater-masks"
      etiqueta-cor="purple"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <ComumCabecalhoSecao titulo="Matérias de Cultura & Arte" ver-todos-em="/categoria/cultura" />
          <NoticiasGrade v-if="data.itens.length" :posts="data.itens.slice(0, 3)" />
          <NoticiasLista v-if="data.itens.length > 3" :posts="data.itens.slice(3, 8)" />
          <ComumEstadoVazio
            v-if="!data.itens.length"
            titulo="Ainda não foram cadastrados conteúdos de cultura"
            descricao="As matérias da editoria Cultura & Arte aparecem aqui assim que forem publicadas."
            icone="fas fa-theater-masks"
          />

          <ComumCabecalhoSecao titulo="Explore o Ecossistema Cultural" />
          <CulturaSubpaginas exceto="/cultura" />
        </main>

        <SidebarPrincipal />
      </div>
    </div>
  </div>
</template>
