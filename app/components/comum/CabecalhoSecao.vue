<script setup lang="ts">
defineProps<{
  titulo: string
  verTodosEm?: string
  verTodosRotulo?: string
}>()
</script>

<template>
  <div class="section-header">
    <h2 class="section-title">
      {{ titulo }}
    </h2>
    <NuxtLink v-if="verTodosEm" :to="verTodosEm" class="see-all">
      {{ verTodosRotulo ?? 'Ver todas' }} <i class="fas fa-arrow-right" />
    </NuxtLink>
  </div>
</template>
