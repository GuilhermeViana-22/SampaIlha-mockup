<script setup lang="ts">
import { CONTATO } from '~/utils/navegacao'

useSeoMeta({
  title: 'Informações & Serviço — Portal Sampa na Ilha',
  description: 'Institucional, contato, políticas e informações de serviço do Portal Sampa na Ilha.',
})

const { data } = await useListaConteudo('lista-informacoes', { tipo: 'informacao', limite: 30 })
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Informações & Serviço"
      descricao="Como falar com a redação e tudo o que você precisa saber sobre o portal e o projeto cultural."
      etiqueta="Institucional"
      etiqueta-icone="fas fa-circle-info"
      etiqueta-cor="gold"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <ComumCabecalhoSecao titulo="Páginas de informação" />
          <InformacoesGrade v-if="data.itens.length" :posts="data.itens" />
          <ComumEstadoVazio
            v-else
            titulo="Ainda não foram cadastradas páginas de informação"
            descricao="Conteúdos institucionais e de serviço publicados pela redação entram nesta lista."
            icone="fas fa-circle-info"
          />

          <ComumCabecalhoSecao titulo="Canais de Atendimento" />
          <ComumCanaisAtendimento />

          <ComumCabecalhoSecao titulo="Dados do portal" />
          <div class="eco-grid">
            <div class="eco-card">
              <i class="fas fa-building" />
              <h3>Razão social</h3>
              <p>{{ CONTATO.razaoSocial }} — CNPJ {{ CONTATO.cnpj }}</p>
            </div>
            <div class="eco-card">
              <i class="fas fa-lock" />
              <h3>Área da redação</h3>
              <p>Equipe do portal: acesse o painel em <NuxtLink to="/admin" style="color:var(--azul);font-weight:600;">/admin</NuxtLink>.</p>
            </div>
          </div>
        </main>

        <SidebarPrincipal :tempo="false" />
      </div>
    </div>
  </div>
</template>
