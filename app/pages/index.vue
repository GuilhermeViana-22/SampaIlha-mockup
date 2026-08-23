<script setup lang="ts">
useSeoMeta({
  title: 'Portal Sampa na Ilha — Notícias, Cultura e Destaques do Brasil',
  description: 'Notícias, cultura e destaques de São Paulo e de todo o Brasil, com uma curadoria cultural que conecta a capital paulista à Amazônia.',
})

const { data: destaques } = await useListaConteudo('home-destaques', { destaque: true, limite: 3 })
const { data: ultimas } = await useListaConteudo('home-ultimas', { tipo: 'noticia', limite: 6 })
const { data: giro } = await useListaConteudo('home-giro', { tipo: 'noticia', limite: 10 })
const { data: dicas } = await useListaConteudo('home-dicas', { tipo: 'dica', limite: 3 })

// Cada matéria aparece uma única vez na home: a vitrine tem prioridade,
// depois "Últimas Notícias" e por fim o "Giro de Notícias".
const idsDestaque = computed(() => new Set(destaques.value.itens.map(p => p.id)))

const ultimasFiltradas = computed(() =>
  ultimas.value.itens.filter(p => !idsDestaque.value.has(p.id)).slice(0, 3))

const giroFiltrado = computed(() => {
  const usados = new Set([...idsDestaque.value, ...ultimasFiltradas.value.map(p => p.id)])
  return giro.value.itens.filter(p => !usados.has(p.id)).slice(0, 4)
})

/** Portal recém-instalado (ou banco zerado): nenhuma seção tem o que mostrar. */
const semConteudo = computed(() =>
  !destaques.value.itens.length
  && !ultimas.value.itens.length
  && !dicas.value.itens.length
  && !giro.value.itens.length)
</script>

<template>
  <div class="container">
    <div class="layout">
      <main>
        <ComumEstadoVazio
          v-if="semConteudo"
          titulo="Ainda não foram cadastrados conteúdos"
          descricao="Assim que a redação publicar a primeira matéria, ela aparece aqui na home do portal."
          icone="fas fa-newspaper"
        />

        <template v-else>
          <NoticiasHero :posts="destaques.itens" />

          <ComumCabecalhoSecao titulo="Últimas Notícias" ver-todos-em="/noticias" />
          <NoticiasGrade v-if="ultimasFiltradas.length" :posts="ultimasFiltradas" />
          <ComumEstadoVazio
            v-else
            titulo="Nenhuma notícia publicada ainda"
            descricao="As matérias mais recentes da redação entram nesta faixa."
            icone="fas fa-newspaper"
          />

          <ComumCabecalhoSecao titulo="Dicas & Guias" ver-todos-em="/dicas" ver-todos-rotulo="Ver todas as dicas" />
          <DicasGrade v-if="dicas.itens.length" :posts="dicas.itens" />
          <ComumEstadoVazio
            v-else
            titulo="Nenhuma dica publicada ainda"
            descricao="Guias e roteiros aparecem aqui assim que forem publicados."
            icone="fas fa-lightbulb"
          />

          <ComumCabecalhoSecao titulo="Giro de Notícias" ver-todos-em="/noticias" />
          <NoticiasLista v-if="giroFiltrado.length" :posts="giroFiltrado" />
          <ComumEstadoVazio
            v-else
            titulo="Sem outras matérias no momento"
            descricao="O giro reúne as notícias que não estão na vitrine nem nas últimas."
            icone="fas fa-list"
          />
        </template>
      </main>

      <SidebarPrincipal />
    </div>
  </div>
</template>
