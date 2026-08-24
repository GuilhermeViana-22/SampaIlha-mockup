<script setup lang="ts">
import { CalendarCheckIcon, FileEditIcon, GraduationCapIcon, LoaderCircleIcon } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Workshops',
  descricao: 'As oficinas de Formação Cultural que aparecem em /cultura/workshops.',
  acao: { rotulo: 'Nova oficina', para: '/admin/workshops/nova' },
})
useSeoMeta({ title: 'Workshops — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const workshops = useWorkshopsStore()

await workshops.carregar(true)

const resumo = computed(() => [
  { rotulo: 'Todas', valor: workshops.contagem.total, icone: GraduationCapIcon },
  { rotulo: 'Próximas no ar', valor: workshops.contagem.proximas, icone: CalendarCheckIcon },
  { rotulo: 'Rascunhos', valor: workshops.contagem.rascunhos, icone: FileEditIcon },
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

    <AdminWorkshopsFiltros />

    <p class="text-sm text-muted-foreground">
      Exibindo <strong class="text-foreground">{{ workshops.listaFiltrada.length }}</strong>
      de {{ workshops.contagem.total }} oficinas.
    </p>

    <div v-if="workshops.carregando" class="flex justify-center py-10">
      <LoaderCircleIcon class="size-6 animate-spin text-muted-foreground" />
    </div>
    <AdminWorkshopsTabela v-else />
  </div>
</template>
