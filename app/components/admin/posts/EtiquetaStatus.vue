<script setup lang="ts">
import type { PostStatus } from '#shared/types/content'

const props = defineProps<{ status: PostStatus }>()

const estilos: Record<PostStatus, { rotulo: string, classe: string }> = {
  publicado: { rotulo: 'Publicado', classe: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/25' },
  rascunho: { rotulo: 'Rascunho', classe: 'bg-muted text-muted-foreground border-border' },
  em_revisao: { rotulo: 'Em revisão', classe: 'bg-sky-500/12 text-sky-700 dark:text-sky-400 border-sky-500/30' },
  agendado: { rotulo: 'Agendado', classe: 'bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/30' },
}

const estilo = computed(() => estilos[props.status])
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
    :class="estilo.classe"
  >
    {{ estilo.rotulo }}
  </span>
</template>
