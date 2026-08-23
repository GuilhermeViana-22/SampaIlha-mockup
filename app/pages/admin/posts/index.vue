<script setup lang="ts">
import { FileTextIcon, InfoIcon, LightbulbIcon, LoaderCircleIcon, NewspaperIcon } from '@lucide/vue'
import type { PostTipo } from '#shared/types/content'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Conteúdos',
  descricao: 'Crie, edite, publique e exclua tudo o que vai ao ar no portal.',
})
useSeoMeta({ title: 'Conteúdos — Painel Sampa na Ilha', robots: 'noindex, nofollow' })


const posts = usePostsStore()
const rota = useRoute()

// Permite chegar filtrado pelos atalhos do dashboard (?tipo=dica).
if (rota.query.tipo) posts.filtros.tipo = rota.query.tipo as PostTipo

const resumo = computed(() => [
  { rotulo: 'Todos', valor: posts.contagem.total, icone: FileTextIcon, tipo: 'todos' as const },
  { rotulo: 'Notícias', valor: posts.contagem.noticias, icone: NewspaperIcon, tipo: 'noticia' as const },
  { rotulo: 'Dicas', valor: posts.contagem.dicas, icone: LightbulbIcon, tipo: 'dica' as const },
  { rotulo: 'Informações', valor: posts.contagem.informacoes, icone: InfoIcon, tipo: 'informacao' as const },
])
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="item in resumo"
        :key="item.rotulo"
        type="button"
        class="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors"
        :class="posts.filtros.tipo === item.tipo ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-primary/40'"
        @click="posts.filtros.tipo = item.tipo"
      >
        <component :is="item.icone" class="size-5 text-primary" />
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{{ item.rotulo }}</p>
          <p class="font-serif text-2xl font-bold leading-none">{{ item.valor }}</p>
        </div>
      </button>
    </div>

    <AdminPostsFiltros />

    <p class="text-sm text-muted-foreground">
      Exibindo <strong class="text-foreground">{{ posts.listaFiltrada.length }}</strong>
      de {{ posts.contagem.total }} conteúdos.
    </p>

    <AdminPostsTabela />

    <div v-if="posts.temMais" class="flex justify-center">
      <Button variant="outline" :disabled="posts.carregando" @click="posts.carregarMais()">
        <LoaderCircleIcon v-if="posts.carregando" class="size-4 animate-spin" />
        Carregar mais ({{ posts.contagem.total - posts.itens.length }} restantes)
      </Button>
    </div>
  </div>
</template>
