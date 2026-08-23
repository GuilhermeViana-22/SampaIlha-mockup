<script setup lang="ts">
/** Aviso amarelo de conteúdo pendente/placeholder herdado do mockup. */
defineProps<{ icone?: string }>()
</script>

<template>
  <div class="placeholder-notice">
    <i :class="icone ?? 'fas fa-triangle-exclamation'" />
    <div><slot /></div>
  </div>
</template>
