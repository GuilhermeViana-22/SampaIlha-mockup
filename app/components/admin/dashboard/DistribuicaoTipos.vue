<script setup lang="ts">
import { InfoIcon, LightbulbIcon, NewspaperIcon } from '@lucide/vue'
import type { EstatisticasDashboard } from '#shared/types/content'

/** Notícias × Dicas × Informações — os três tipos de conteúdo do portal. */
const props = defineProps<{ dados: EstatisticasDashboard['porTipo'] }>()

const soma = computed(() => props.dados.noticia + props.dados.dica + props.dados.informacao)
const total = computed(() => Math.max(1, soma.value))

const linhas = computed(() => [
  { tipo: 'noticia', rotulo: 'Notícias', icone: NewspaperIcon, valor: props.dados.noticia, classe: 'bg-[#0a4fa8]' },
  { tipo: 'dica', rotulo: 'Dicas & Guias', icone: LightbulbIcon, valor: props.dados.dica, classe: 'bg-[#00b4d8]' },
  { tipo: 'informacao', rotulo: 'Informações', icone: InfoIcon, valor: props.dados.informacao, classe: 'bg-amber-500' },
])
</script>

<template>
  <Card class="h-full">
    <CardHeader>
      <CardTitle class="text-base">Por tipo de conteúdo</CardTitle>
      <CardDescription>Como o acervo está dividido entre as três seções.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <p v-if="!soma" class="py-6 text-center text-sm text-muted-foreground">
        Ainda não foram cadastrados conteúdos.
      </p>

      <template v-else>
      <div class="flex h-3 overflow-hidden rounded-full bg-muted">
        <div
          v-for="linha in linhas"
          :key="linha.tipo"
          :class="linha.classe"
          :style="{ width: `${(linha.valor / total) * 100}%` }"
        />
      </div>

      <div class="flex flex-col gap-2">
        <NuxtLink
          v-for="linha in linhas"
          :key="linha.tipo"
          :to="{ path: '/admin/posts', query: { tipo: linha.tipo } }"
          class="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
        >
          <span class="size-2.5 rounded-full" :class="linha.classe" />
          <component :is="linha.icone" class="size-4 text-muted-foreground" />
          <span class="flex-1 text-sm font-medium">{{ linha.rotulo }}</span>
          <span class="text-sm font-semibold tabular-nums">{{ linha.valor }}</span>
          <span class="w-12 text-right text-xs text-muted-foreground">
            {{ Math.round((linha.valor / total) * 100) }}%
          </span>
        </NuxtLink>
      </div>
      </template>
    </CardContent>
  </Card>
</template>
