<script setup lang="ts">
useSeoMeta({
  title: 'Grupo de Dança — Portal Sampa na Ilha',
  description: 'O corpo de dança do Sampa na Ilha leva a musicalidade e a coreografia do boi-bumbá para os palcos de São Paulo.',
})
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Grupo de Dança"
      descricao="O corpo de dança do Sampa na Ilha leva a musicalidade e a coreografia do boi-bumbá para os palcos de São Paulo."
      etiqueta="Cultura"
      etiqueta-icone="fas fa-music"
      etiqueta-cor="purple"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <ComumAviso>
            <strong>Página em construção:</strong> em breve, esta seção vai reunir o formulário de
            inscrição para o Grupo de Dança, o termo de participação e as fotos das atividades.
          </ComumAviso>

          <p>
            O Grupo de Dança é uma das frentes de Formação Cultural do projeto Sampa na Ilha: um espaço
            de preparação coreográfica e intercâmbio com a dança de boi-bumbá, aberto a quem quer viver
            a cultura amazônica na prática, em São Paulo.
          </p>

          <CulturaFrente />

          <ComumCabecalhoSecao titulo="Outras frentes do projeto" />
          <CulturaSubpaginas exceto="/cultura/grupo-danca" />
        </main>

        <SidebarPrincipal :tempo="false" />
      </div>
    </div>
  </div>
</template>
