<script setup lang="ts">
import { FileTextIcon, LoaderCircleIcon } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Dicas & Guias',
  descricao: 'Crie, edite, publique e exclua guias do portal.',
})
useSeoMeta({ title: 'Dicas & Guias — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const guias = useGuiasStore()

const resumo = computed(() => [
  { rotulo: 'Todos', valor: guias.contagem.total, icone: FileTextIcon },
  { rotulo: 'Publicados', valor: guias.contagem.publicados, icone: FileTextIcon },
  { rotulo: 'Rascunhos', valor: guias.contagem.rascunhos, icone: FileTextIcon },
])

onMounted(() => {
  guias.carregar()
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="item in resumo"
        :key="item.rotulo"
        type="button"
        class="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
      >
        <component :is="item.icone" class="size-5 text-primary" />
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{{ item.rotulo }}</p>
          <p class="font-serif text-2xl font-bold leading-none">{{ item.valor }}</p>
        </div>
      </button>
    </div>

    <AdminGuiasFiltros />

    <p class="text-sm text-muted-foreground">
      Exibindo <strong class="text-foreground">{{ guias.listaFiltrada.length }}</strong>
      de {{ guias.contagem.total }} guias.
    </p>

    <AdminGuiasTabela />

    <div v-if="guias.temMais" class="flex justify-center">
      <Button variant="outline" :disabled="guias.carregando" @click="guias.carregarMais()">
        <LoaderCircleIcon v-if="guias.carregando" class="size-4 animate-spin" />
        Carregar mais ({{ guias.contagem.total - guias.itens.length }} restantes)
      </Button>
    </div>
  </div>
</template>
