<script setup lang="ts">
useSeoMeta({
  title: 'Workshops & Artesanato — Portal Sampa na Ilha',
  description: 'Oficinas de confecção de adereços, artesanato amazônico e formação artística abertas à comunidade paulistana.',
})
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Workshops & Artesanato"
      descricao="Oficinas de confecção de adereços, artesanato amazônico e formação artística abertas à comunidade paulistana."
      etiqueta="Cultura"
      etiqueta-icone="fas fa-hands-helping"
      etiqueta-cor="purple"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <ComumAviso>
            <strong>Página em construção:</strong> em breve, esta seção vai reunir o formulário de
            inscrição para os workshops, o termo de participação e as fotos das atividades.
          </ComumAviso>

          <p>
            Os Workshops & Artesanato são a frente de Formação Cultural e Projeto Social do Sampa na
            Ilha voltada à confecção de adereços, penachos, indumentárias e demais peças utilizadas no
            Festival de Parintins — democratizando o acesso à arte e à renda para quem participa.
          </p>

          <CulturaFrente />

          <ComumCabecalhoSecao titulo="Outras frentes do projeto" />
          <CulturaSubpaginas exceto="/cultura/workshops" />
        </main>

        <SidebarPrincipal :tempo="false" />
      </div>
    </div>
  </div>
</template>
