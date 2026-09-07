<script setup lang="ts">
import { FilterXIcon, SearchIcon } from '@lucide/vue'
import { STATUS_VAGA } from '#shared/types/vaga'

/** Barra de filtros da listagem — escreve direto na store. */
const vagas = useVagasStore()

const temFiltro = computed(() => {
  const f = vagas.filtros
  return !!f.busca || f.status !== 'todos'
})
</script>

<template>
  <Card class="py-4">
    <CardContent class="flex flex-wrap items-center gap-3 px-4">
      <div class="relative min-w-[220px] flex-1">
        <SearchIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="vagas.filtros.busca"
          class="pl-9"
          placeholder="Buscar por título, empresa ou local…"
        />
      </div>

      <Select v-model="vagas.filtros.status">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem v-for="status in STATUS_VAGA" :key="status.valor" :value="status.valor">
            {{ status.rotulo }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button v-if="temFiltro" variant="ghost" size="sm" @click="vagas.limparFiltros()">
        <FilterXIcon class="size-4" /> Limpar
      </Button>
    </CardContent>
  </Card>
</template>
