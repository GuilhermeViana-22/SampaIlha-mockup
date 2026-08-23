<script setup lang="ts">
useSeoMeta({
  title: 'Turismo — Portal Sampa na Ilha',
  description: 'Turismo no Portal Sampa na Ilha — cobertura completa do Festival de Parintins e roteiros culturais entre São Paulo e a Amazônia.',
})

const { data } = await useListaConteudo('turismo', { categoria: 'turismo', limite: 12 })
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Turismo & Festival de Parintins"
      descricao="Roteiros, curiosidades e a cobertura completa do maior festival folclórico da Amazônia — direto de São Paulo para todo o Brasil."
      etiqueta="Turismo"
      etiqueta-icone="fas fa-suitcase-rolling"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <ComumAviso>
            <strong>Conteúdo em migração:</strong> esta página vai receber toda a estrutura e o conteúdo
            que hoje constam na aba “Festival de Parintins” do site atual do cliente (textos, fotos e
            histórico). Assim que o material for enviado, ele substitui os blocos de exemplo abaixo.
          </ComumAviso>

          <ComumCabecalhoSecao titulo="Cronograma do Festival de Parintins" />
          <TurismoCronograma />

          <ComumCabecalhoSecao titulo="Matérias sobre o Festival" ver-todos-em="/categoria/turismo" />
          <NoticiasGrade v-if="data.itens.length" :posts="data.itens.slice(0, 3)" />
          <NoticiasLista v-if="data.itens.length > 3" :posts="data.itens.slice(3, 7)" />
          <ComumEstadoVazio
            v-if="!data.itens.length"
            titulo="Ainda não foram cadastradas matérias de turismo"
            descricao="A cobertura do Festival de Parintins aparece aqui assim que for publicada."
            icone="fas fa-suitcase-rolling"
          />
        </main>

        <SidebarPrincipal />
      </div>
    </div>
  </div>
</template>
