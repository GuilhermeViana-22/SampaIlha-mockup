<script setup lang="ts">
useSeoMeta({
  title: 'Eventos & Atrações — Portal Sampa na Ilha',
  description: 'Ensaios abertos, mostras, exposições e shows com atrações do Amazonas — a agenda cultural do Sampa na Ilha em São Paulo.',
})

</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Eventos & Atrações"
      descricao="Ensaios abertos, mostras, exposições e shows com atrações do Amazonas — a agenda cultural do Sampa na Ilha em São Paulo."
      etiqueta="Cultura"
      etiqueta-icone="fas fa-calendar-day"
      etiqueta-cor="purple"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <ComumAviso>
            <strong>Página em construção:</strong> em breve, esta seção vai reunir o formulário de
            confirmação de presença, o termo de participação e as fotos dos eventos.
          </ComumAviso>

          <ComumCabecalhoSecao titulo="Próximos eventos" />
          <CulturaAgenda :limite="8" vazio="Nenhum evento confirmado na agenda ainda." />

          <ComumCabecalhoSecao titulo="Outras frentes do projeto" />
          <CulturaSubpaginas exceto="/cultura/eventos" />
        </main>

        <SidebarPrincipal :tempo="false" />
      </div>
    </div>
  </div>
</template>
