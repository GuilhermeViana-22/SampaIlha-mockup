<script setup lang="ts">
useSeoMeta({
  title: 'O Projeto Sampa na Ilha — Portal Sampa na Ilha',
  description: 'O Projeto Sampa na Ilha — ecossistema cultural amazônico em São Paulo: comunicação, formação cultural, projeto social e eventos.',
})
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="O Projeto Sampa na Ilha"
      descricao="Ecossistema Cultural Amazônico em São Paulo"
      etiqueta="Institucional"
      etiqueta-icone="fas fa-seedling"
      etiqueta-cor="green"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <p>
            Seja bem-vindo ao Portal Sampa na Ilha, um projeto cultural, social e educacional
            desenvolvido para promover a riqueza da cultura amazônica na capital paulista através da
            comunicação, da formação artística e de experiências culturais únicas.
          </p>
          <p>
            Nascemos com o propósito de fortalecer a presença do Festival de Parintins fora da região
            Norte, aproximando o público paulista da arte, da musicalidade, das tradições e da
            ancestralidade da floresta. Sob a ótica de uma curadoria cultural dedicada, conectamos São
            Paulo à Amazônia utilizando a arte como ferramenta de transformação e inclusão social.
          </p>

          <ComumCabecalhoSecao titulo="Os Eixos do Nosso Movimento" />
          <p>O nosso ecossistema atua de forma integrada em quatro grandes pilares fundamentais:</p>
          <CulturaEixos />

          <ComumCabecalhoSecao titulo="Nossas Frentes de Atuação" />
          <CulturaSubpaginas exceto="/cultura/o-projeto" />
        </main>

        <SidebarPrincipal :tempo="false" />
      </div>
    </div>
  </div>
</template>
