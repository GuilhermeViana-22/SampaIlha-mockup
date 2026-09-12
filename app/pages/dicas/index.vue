<script setup lang="ts">
useSeoMeta({
  title: 'Dicas & Guias — Portal Sampa na Ilha',
  description: 'Guias práticos, roteiros e recomendações da redação do Portal Sampa na Ilha.',
})

const {
  itens, total, temMais, carregando, carregandoMais, erroMais, carregarMais,
} = await useListaPaginada('lista-dicas', { tipo: 'dica' }, 24)
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
          <ComumCabecalhoSecao :titulo="`${total} dicas publicadas`" />
          <DicasGrade v-if="itens.length" :posts="itens" />

          <ComumVerMais
            :mostrando="itens.length"
            :total="total"
            :tem-mais="temMais"
            :carregando="carregandoMais"
            :erro="erroMais"
            substantivo="dicas"
            @carregar="carregarMais"
          />

          <ComumEstadoVazio
            v-if="!itens.length && !carregando"
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
