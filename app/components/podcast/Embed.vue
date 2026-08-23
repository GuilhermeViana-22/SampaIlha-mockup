<script setup lang="ts">
defineProps<{ rotulo: string, icone?: string }>()
</script>

<template>
  <div class="embed-block">
    <i :class="icone ?? 'fas fa-play-circle'" />
    <span>{{ rotulo }}</span>
  </div>
</template>
