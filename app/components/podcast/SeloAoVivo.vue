<script setup lang="ts">
/**
 * Selo de status da transmissão. Enquanto não existe integração com o YouTube
 * ou a Twitch, quem controla é a prop `aoVivo` — o selo já alterna entre os
 * dois estados, então basta ligá-la à origem real no lançamento.
 */
defineProps<{ aoVivo: boolean }>()
</script>

<template>
  <span v-if="aoVivo" class="live-badge">
    <span class="live-dot" /> No Ar
  </span>
  <span v-else class="live-badge live-badge--off">
    <span class="live-dot live-dot--off" /> Fora do ar
  </span>
</template>
