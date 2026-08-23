<script setup lang="ts">
defineProps<{
  rotulo: string
  valor: string | number
  descricao?: string
  icone?: unknown
  tom?: 'azul' | 'ciano' | 'verde' | 'ambar' | 'roxo'
}>()

const tons: Record<string, string> = {
  azul: 'bg-[#0a4fa8]/10 text-[#0a4fa8] dark:bg-[#0a4fa8]/25 dark:text-[#79b5ff]',
  ciano: 'bg-[#00b4d8]/12 text-[#0184a3] dark:bg-[#00b4d8]/25 dark:text-[#68dcf5]',
  verde: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  ambar: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  roxo: 'bg-purple-500/12 text-purple-600 dark:text-purple-400',
}
</script>

<template>
  <Card class="gap-0 py-5">
    <CardContent class="flex items-start gap-4 px-5">
      <div class="flex size-11 shrink-0 items-center justify-center rounded-xl" :class="tons[tom ?? 'azul']">
        <component :is="icone" class="size-5" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-medium text-muted-foreground">{{ rotulo }}</p>
        <p class="font-serif text-3xl font-bold leading-tight">{{ valor }}</p>
        <p v-if="descricao" class="mt-0.5 text-xs text-muted-foreground">{{ descricao }}</p>
      </div>
    </CardContent>
  </Card>
</template>
