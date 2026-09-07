<script setup lang="ts">
import { BriefcaseIcon, FileEditIcon, LoaderCircleIcon, SquareCheckIcon } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Vagas',
  descricao: 'As oportunidades de emprego que aparecem em /vagas.',
  acao: { rotulo: 'Nova vaga', para: '/admin/vagas/nova' },
})
useSeoMeta({ title: 'Vagas — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const vagas = useVagasStore()

await vagas.carregar(true)

const resumo = computed(() => [
  { rotulo: 'Todas', valor: vagas.contagem.total, icone: BriefcaseIcon },
  { rotulo: 'Abertas no site', valor: vagas.contagem.abertas, icone: SquareCheckIcon },
  { rotulo: 'Rascunhos', valor: vagas.contagem.rascunhos, icone: FileEditIcon },
])
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-3 sm:grid-cols-3">
      <div
        v-for="item in resumo"
        :key="item.rotulo"
        class="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
      >
        <component :is="item.icone" class="size-5 text-primary" />
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{{ item.rotulo }}</p>
          <p class="font-serif text-2xl font-bold leading-none">{{ item.valor }}</p>
        </div>
      </div>
    </div>

    <AdminVagasFiltros />

    <p class="text-sm text-muted-foreground">
      Exibindo <strong class="text-foreground">{{ vagas.listaFiltrada.length }}</strong>
      de {{ vagas.contagem.total }} vagas.
    </p>

    <div v-if="vagas.carregando" class="flex justify-center py-10">
      <LoaderCircleIcon class="size-6 animate-spin text-muted-foreground" />
    </div>
    <AdminVagasTabela v-else />
  </div>
</template>
