<script setup lang="ts">
const rota = useRoute()
const portal = usePortalStore()

const regiao = computed(() => portal.regiao(rota.params.slug as string))
if (!regiao.value) {
  throw createError({ statusCode: 404, statusMessage: 'Região não encontrada.', fatal: true })
}

const { data, status } = await useListaConteudo('regiao', () => ({
  regiao: rota.params.slug as string,
  limite: 30,
}))

useSeoMeta({
  title: () => `Região ${regiao.value!.nome} — Portal Sampa na Ilha`,
  description: () => regiao.value!.descricao,
})
</script>

<template>
  <div>
    <ComumHeroPagina
      :titulo="regiao!.nome"
      :descricao="regiao!.descricao"
      etiqueta="Região"
      :etiqueta-icone="regiao!.icone"
    />

    <div class="container">
      <div class="layout">
        <main>
          <ComumCabecalhoSecao :titulo="`Matérias da região ${regiao!.nome}`" />
          <NoticiasGrade v-if="data.itens.length" :posts="data.itens.slice(0, 6)" />
          <NoticiasLista v-if="data.itens.length > 6" :posts="data.itens.slice(6)" />
          <ComumEstadoVazio
            v-if="!data.itens.length && status !== 'pending'"
            titulo="Sem matérias nesta região por enquanto"
            descricao="Esta página reúne automaticamente tudo o que for publicado com a região selecionada."
            :icone="regiao!.icone"
          />
        </main>
        <SidebarPrincipal />
      </div>
    </div>
  </div>
</template>
