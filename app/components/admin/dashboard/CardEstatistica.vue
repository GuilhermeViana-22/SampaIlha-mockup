<script setup lang="ts">
defineProps<{
  rotulo: string
  valor: string | number
  descricao?: string
  icone?: unknown
  tom?: 'marca' | 'destaque' | 'verde' | 'ambar' | 'roxo'
}>()

const tons: Record<string, string> = {
  marca: 'bg-[#0c560b]/10 text-[#0c560b] dark:bg-[#0c560b]/30 dark:text-[#7cc47a]',
  destaque: 'bg-[#d9a441]/15 text-[#8a6414] dark:bg-[#d9a441]/25 dark:text-[#e9c37c]',
  verde: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  ambar: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  roxo: 'bg-purple-500/12 text-purple-600 dark:text-purple-400',
}
</script>

<template>
  <Card class="gap-0 py-5">
    <CardContent class="flex items-start gap-4 px-5">
      <div class="flex size-11 shrink-0 items-center justify-center rounded-xl" :class="tons[tom ?? 'marca']">
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
