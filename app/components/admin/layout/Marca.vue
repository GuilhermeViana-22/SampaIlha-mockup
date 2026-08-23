<script setup lang="ts">
/**
 * Marca do painel. O bloco do ícone tem 2rem — a mesma coluna dos ícones da
 * navegação e do avatar —, para que todos os rótulos comecem no mesmo eixo.
 * `compacto` é a versão da barra superior, sem a linha de apoio.
 */
defineProps<{ compacto?: boolean }>()
</script>

<template>
  <NuxtLink to="/admin/dashboard" class="flex min-w-0 items-center gap-2.5">
    <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0a4fa8] to-[#00b4d8] text-sm text-white">
      <i class="fas fa-water" />
    </span>
    <span class="min-w-0 leading-tight">
      <span class="block truncate font-serif text-sm font-bold text-sidebar-foreground">Sampa na Ilha</span>
      <span v-if="!compacto" class="block truncate text-[10px] uppercase tracking-widest text-muted-foreground">
        Painel da redação
      </span>
    </span>
  </NuxtLink>
</template>
