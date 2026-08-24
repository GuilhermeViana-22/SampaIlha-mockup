<script setup lang="ts">
/**
 * Frente de Formação Cultural — as oficinas abertas à comunidade.
 *
 * A listagem vem inteira do painel — a página não tem texto próprio. Sem
 * oficina cadastrada e no ar, o conteúdo fica vazio: é melhor não dizer nada do
 * que anunciar seções que ainda não existem.
 *
 * O que está publicado e ainda vai acontecer aparece em destaque; o que já
 * passou vai para um bloco de histórico. A inscrição mora sempre em outro site;
 * aqui só existe a ponte.
 */
const workshops = useWorkshopsStore()

await workshops.carregar(true)

useSeoMeta({
  title: 'Workshops & Artesanato — Portal Sampa na Ilha',
  description: 'Oficinas de confecção de adereços, artesanato amazônico e formação artística abertas à comunidade paulistana.',
  ogTitle: 'Workshops & Artesanato — Portal Sampa na Ilha',
  ogDescription: 'Oficinas de confecção de adereços, artesanato amazônico e formação artística em São Paulo.',
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
          <!--
            Sem texto fixo: a página é só o que a redação cadastrou. Sem
            oficinas no ar, o conteúdo fica vazio em vez de anunciar seções que
            não existem.
          -->
          <template v-if="workshops.noAr.length">
            <ComumCabecalhoSecao titulo="Próximas oficinas" />
            <CulturaWorkshopCartao
              v-for="oficina in workshops.noAr"
              :key="oficina.id"
              :oficina="oficina"
            />
          </template>

          <template v-if="workshops.realizadas.length">
            <ComumCabecalhoSecao titulo="Oficinas já realizadas" />
            <CulturaWorkshopCartao
              v-for="oficina in workshops.realizadas"
              :key="oficina.id"
              :oficina="oficina"
              realizada
            />
          </template>
        </main>

        <SidebarPrincipal :tempo="false" />
      </div>
    </div>
  </div>
</template>
