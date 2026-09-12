<script setup lang="ts">
import type { Episodio } from '#shared/types/podcast'

/**
 * Feed do podcast.
 *
 * O layout é o de rede social, a pedido do cliente: uma coluna só, um card
 * embaixo do outro, do episódio mais recente para o mais antigo. Diferente das
 * notícias, que abrem em grade de três colunas — aqui cada item precisa da
 * largura inteira porque o player mora dentro dele.
 *
 * Só episódios: a faixa de transmissão ao vivo saiu a pedido do cliente, e com
 * ela o selo "No Ar", que nunca teve origem de dados.
 */
useSeoMeta({
  title: 'Podcast — Portal Sampa na Ilha',
  description: 'Os episódios do podcast Sampa na Ilha: conversas sobre cultura amazônica, Parintins e a vida entre São Paulo e o Norte.',
  ogTitle: 'Podcast — Portal Sampa na Ilha',
})

const {
  itens, total, temMais, carregando, carregandoMais, erroMais, carregarMais,
} = await useListaPaginada<Episodio>('podcast-feed', {}, 10, '/api/podcast')
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Podcast Sampa na Ilha"
      descricao="Conversas sobre cultura amazônica, Parintins e a vida entre São Paulo e o Norte. Ouça por aqui mesmo, sem sair da página."
      etiqueta="Podcast"
      etiqueta-icone="fas fa-microphone-lines"
      etiqueta-cor="green"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <ComumCabecalhoSecao :titulo="total === 1 ? '1 episódio publicado' : `${total} episódios publicados`" />

          <!-- O feed: uma coluna, um card embaixo do outro. -->
          <div v-if="itens.length" class="ep-feed">
            <PodcastCard v-for="episodio in itens" :key="episodio.id" :episodio="episodio" />
          </div>

          <ComumVerMais
            :mostrando="itens.length"
            :total="total"
            :tem-mais="temMais"
            :carregando="carregandoMais"
            :erro="erroMais"
            substantivo="episódios"
            @carregar="carregarMais"
          />

          <ComumEstadoVazio
            v-if="!itens.length && !carregando"
            titulo="Nenhum episódio publicado ainda"
            descricao="Assim que o primeiro episódio for cadastrado no painel, ele aparece aqui — com o player do Spotify, do YouTube ou do Deezer embutido."
            icone="fas fa-microphone-lines"
          />
        </main>

        <SidebarPrincipal :tempo="false" :dicas="false" />
      </div>
    </div>
  </div>
</template>
