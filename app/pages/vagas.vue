<script setup lang="ts">
useSeoMeta({
  title: 'Vagas de Emprego — Portal Sampa na Ilha',
  description: 'Vagas de emprego no Portal Sampa na Ilha e oportunidades de parceiros divulgadas pelo portal.',
})

const { data } = await useListaConteudo('vagas-conteudo', { categoria: 'vagas', limite: 6 })
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Vagas de Emprego"
      descricao="Um espaço para reunir e divulgar oportunidades de emprego recebidas diariamente pelo portal — de São Paulo e de todo o Brasil."
      etiqueta="Diferencial do Portal"
      etiqueta-icone="fas fa-briefcase"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <ComumCabecalhoSecao titulo="Vagas abertas" />
          <VagasLista />

          <template v-if="data.itens.length">
            <ComumCabecalhoSecao titulo="Como anunciar sua vaga" />
            <DicasGrade :posts="data.itens" />
          </template>
        </main>

        <SidebarPrincipal :tempo="false" />
      </div>
    </div>
  </div>
</template>
