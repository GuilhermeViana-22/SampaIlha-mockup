<script setup lang="ts">
defineProps<{ titulo: string, descricao: string }>()
</script>

<template>
  <div class="podcast-player">
    <div class="podcast-player__icon">
      <i class="fas fa-microphone-lines" />
    </div>
    <div>
      <h4>{{ titulo }}</h4>
      <p>{{ descricao }}</p>
    </div>
  </div>
</template>
