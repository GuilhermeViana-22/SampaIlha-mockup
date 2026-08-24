<script setup lang="ts">
import { CONTATO } from '~/utils/navegacao'

useSeoMeta({
  title: 'Quem Somos — Portal Sampa na Ilha',
  description: 'Ecossistema de informação, utilidade pública e cultura amazônica em São Paulo: quem somos, nossos eixos de atuação e os canais oficiais de atendimento.',
  ogTitle: 'Quem Somos — Portal Sampa na Ilha',
  ogDescription: 'Ecossistema de informação, utilidade pública e cultura amazônica em São Paulo.',
})
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Portal Sampa na Ilha"
      descricao="Ecossistema de Informação, Utilidade Pública e Cultura Amazônica em São Paulo"
      etiqueta="Quem Somos"
      etiqueta-icone="fas fa-users"
      etiqueta-cor="green"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <p>
            Seja bem-vindo ao Portal Sampa na Ilha, um projeto cultural, social, educacional e de
            comunicação desenvolvido para promover a riqueza da cultura amazônica na capital paulista
            e levar informação de qualidade para todo o Brasil e o mundo.
          </p>
          <p>
            Nascemos com o propósito de fortalecer a presença do Festival de Parintins fora da região
            Norte, aproximando o público paulista da arte, da musicalidade, das tradições e da
            ancestralidade da floresta. Sob a ótica de uma curadoria cultural dedicada, conectamos São
            Paulo à Amazônia utilizando a arte como ferramenta de transformação, inclusão social e
            fomento cultural.
          </p>

          <ComumCabecalhoSecao titulo="Os Eixos do Nosso Movimento" />
          <p>
            O nosso ecossistema atua de forma integrada através de grandes pilares fundamentais, que
            agora se expandem para abraçar a informação global e a utilidade pública:
          </p>
          <CulturaEixos />

          <p style="margin-top:24px;">
            O Sampa na Ilha é a união perfeita entre informação em tempo real, utilidade diária e a
            celebração da nossa ancestralidade.
          </p>

          <ComumCabecalhoSecao titulo="Canais de Atendimento" />
          <p>
            Falar com a gente é direto: o WhatsApp <strong>{{ CONTATO.whatsapp }}</strong> é o canal
            oficial de atendimento, e as redes sociais concentram a agenda e os bastidores do projeto.
          </p>
          <ComumCanaisAtendimento />

          <ComumCabecalhoSecao titulo="Nossas Frentes de Atuação" />
          <CulturaSubpaginas />
        </main>

        <SidebarPrincipal :tempo="false" />
      </div>
    </div>
  </div>
</template>
