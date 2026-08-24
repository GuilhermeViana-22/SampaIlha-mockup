<script setup lang="ts">
import { FilterXIcon, SearchIcon } from '@lucide/vue'
import { PERIODOS_WORKSHOP, STATUS_WORKSHOP } from '#shared/types/workshop'

/** Barra de filtros da listagem — escreve direto na store. */
const workshops = useWorkshopsStore()

const temFiltro = computed(() => {
  const f = workshops.filtros
  return !!f.busca || f.status !== 'todos' || f.periodo !== 'todos'
})
</script>

<template>
  <Card class="py-4">
    <CardContent class="flex flex-wrap items-center gap-3 px-4">
      <div class="relative min-w-[220px] flex-1">
        <SearchIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="workshops.filtros.busca"
          class="pl-9"
          placeholder="Buscar por título, resumo ou local…"
        />
      </div>

      <Select v-model="workshops.filtros.status">
        <SelectTrigger class="w-[170px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem v-for="status in STATUS_WORKSHOP" :key="status.valor" :value="status.valor">
            {{ status.rotulo }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="workshops.filtros.periodo">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="periodo in PERIODOS_WORKSHOP" :key="periodo.valor" :value="periodo.valor">
            {{ periodo.rotulo }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button v-if="temFiltro" variant="ghost" size="sm" @click="workshops.limparFiltros()">
        <FilterXIcon class="size-4" /> Limpar
      </Button>
    </CardContent>
  </Card>
</template>
