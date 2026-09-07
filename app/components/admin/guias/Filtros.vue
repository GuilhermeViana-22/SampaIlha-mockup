<script setup lang="ts">
import { FilterXIcon, SearchIcon } from '@lucide/vue'

/** Barra de filtros da listagem — escreve direto na store. */
const guias = useGuiasStore()
const portal = usePortalStore()

const ordenacoes = [
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'antigos', rotulo: 'Mais antigos' },
  { valor: 'lidos', rotulo: 'Mais lidos' },
  { valor: 'titulo', rotulo: 'Título (A–Z)' },
]

const temFiltro = computed(() => {
  const f = guias.filtros
  return !!f.busca || f.status !== 'todos' || f.categoria !== 'todas' || f.ordenar !== 'recentes'
})
</script>

<template>
  <Card class="py-4">
    <CardContent class="flex flex-wrap items-center gap-3 px-4">
      <div class="relative min-w-[220px] flex-1">
        <SearchIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="guias.filtros.busca"
          class="pl-9"
          placeholder="Buscar por título, resumo, autor ou tag…"
        />
      </div>

      <Select v-model="guias.filtros.status">
        <SelectTrigger class="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="publicado">Publicado</SelectItem>
          <SelectItem value="rascunho">Rascunho</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="guias.filtros.categoria">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as categorias</SelectItem>
          <SelectItem v-for="categoria in portal.categorias" :key="categoria.slug" :value="categoria.slug">
            {{ categoria.nome }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="guias.filtros.ordenar">
        <SelectTrigger class="w-[160px]">
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opcao in ordenacoes" :key="opcao.valor" :value="opcao.valor">
            {{ opcao.rotulo }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button v-if="temFiltro" variant="ghost" size="sm" @click="guias.limparFiltros()">
        <FilterXIcon class="size-4" /> Limpar
      </Button>
    </CardContent>
  </Card>
</template>
