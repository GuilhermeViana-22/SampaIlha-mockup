<script setup lang="ts">
import { FilterXIcon, SearchIcon } from '@lucide/vue'

/** Barra de filtros da equipe — escreve direto na store, como a de conteúdos. */
const redacao = useRedacaoStore()
</script>

<template>
  <Card class="py-4">
    <CardContent class="flex flex-wrap items-center gap-3 px-4">
      <div class="relative min-w-[220px] flex-1">
        <SearchIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="redacao.filtros.busca" class="pl-9" placeholder="Buscar por nome ou e-mail…" />
      </div>

      <Select v-model="redacao.filtros.papel">
        <SelectTrigger class="w-[190px]">
          <SelectValue placeholder="Papel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os papéis</SelectItem>
          <SelectItem value="editor-chefe">Editor-chefe</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="redacao.filtros.situacao">
        <SelectTrigger class="w-[195px]">
          <SelectValue placeholder="Situação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as situações</SelectItem>
          <SelectItem value="ativos">Somente ativos</SelectItem>
          <SelectItem value="inativos">Somente inativos</SelectItem>
        </SelectContent>
      </Select>

      <Button v-if="redacao.temFiltro" variant="ghost" size="sm" @click="redacao.limparFiltros()">
        <FilterXIcon class="size-4" /> Limpar
      </Button>
    </CardContent>
  </Card>
</template>
