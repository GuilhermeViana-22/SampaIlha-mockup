<script setup lang="ts">
import { CalendarCheckIcon, CalendarDaysIcon, FileEditIcon, LoaderCircleIcon } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Eventos',
  descricao: 'A agenda cultural que aparece em /cultura/eventos.',
  acao: { rotulo: 'Novo evento', para: '/admin/eventos/novo' },
})
useSeoMeta({ title: 'Eventos — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const eventos = useEventosStore()

await eventos.carregar(true)

const resumo = computed(() => [
  { rotulo: 'Todos', valor: eventos.contagem.total, icone: CalendarDaysIcon },
  { rotulo: 'Próximos no ar', valor: eventos.contagem.proximos, icone: CalendarCheckIcon },
  { rotulo: 'Rascunhos', valor: eventos.contagem.rascunhos, icone: FileEditIcon },
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

    <AdminEventosFiltros />

    <p class="text-sm text-muted-foreground">
      Exibindo <strong class="text-foreground">{{ eventos.listaFiltrada.length }}</strong>
      de {{ eventos.contagem.total }} eventos.
    </p>

    <div v-if="eventos.carregando" class="flex justify-center py-10">
      <LoaderCircleIcon class="size-6 animate-spin text-muted-foreground" />
    </div>
    <AdminEventosTabela v-else />
  </div>
</template>
