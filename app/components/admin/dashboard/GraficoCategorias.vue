<script setup lang="ts">
import type { ContagemDashboard } from '#shared/types/content'

/** Barras horizontais de distribuição — serve editorias e regiões. */
const props = withDefaults(defineProps<{
  dados: ContagemDashboard[]
  titulo?: string
  descricao?: string
  /** Prefixo do link de cada linha; sem ele, a linha não vira link. */
  linkBase?: string
}>(), {
  titulo: 'Conteúdos por editoria',
  descricao: 'Distribuição de tudo o que está no banco do portal.',
  linkBase: '',
})

const maior = computed(() => Math.max(1, ...props.dados.map(d => d.total)))
</script>

<template>
  <Card class="h-full">
    <CardHeader>
      <CardTitle class="text-base">{{ titulo }}</CardTitle>
      <CardDescription>{{ descricao }}</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-3">
      <p v-if="!dados.length" class="py-6 text-center text-sm text-muted-foreground">
        Ainda não foram cadastrados conteúdos.
      </p>

      <div v-for="linha in dados" :key="linha.chave" class="grid grid-cols-[minmax(0,7rem)_1fr_2rem] items-center gap-3">
        <NuxtLink
          v-if="linkBase"
          :to="`${linkBase}${linha.chave}`"
          target="_blank"
          class="truncate text-sm font-medium hover:text-primary hover:underline"
        >
          {{ linha.nome }}
        </NuxtLink>
        <span v-else class="truncate text-sm font-medium">{{ linha.nome }}</span>
        <div class="h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-gradient-to-r from-[#0c560b] to-[#3fa03c] transition-[width] duration-500"
            :style="{ width: `${Math.round((linha.total / maior) * 100)}%` }"
          />
        </div>
        <span class="text-right text-sm font-semibold tabular-nums text-muted-foreground">{{ linha.total }}</span>
      </div>
    </CardContent>
  </Card>
</template>
