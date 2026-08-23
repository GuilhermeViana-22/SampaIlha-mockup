<script setup lang="ts">
useSeoMeta({
  title: 'Dicas & Guias — Portal Sampa na Ilha',
  description: 'Guias práticos, roteiros e recomendações da redação do Portal Sampa na Ilha.',
})

const { data, status } = await useListaConteudo('lista-dicas', { tipo: 'dica', limite: 30 })
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Dicas & Guias"
      descricao="Roteiros, passo a passo e recomendações práticas da redação para quem vive, viaja e trabalha entre São Paulo e o resto do Brasil."
      etiqueta="Serviço"
      etiqueta-icone="fas fa-lightbulb"
    />

    <div class="container">
      <div class="layout">
        <main>
          <ComumCabecalhoSecao :titulo="`${data.total} dicas publicadas`" />
          <DicasGrade v-if="data.itens.length" :posts="data.itens" />
          <ComumEstadoVazio
            v-else-if="status !== 'pending'"
            titulo="Ainda não há dicas publicadas"
            descricao="Novos guias entram no ar assim que forem publicados pela redação."
            icone="fas fa-lightbulb"
          />
        </main>

        <SidebarPrincipal :dicas="false" />
      </div>
    </div>
  </div>
</template>
