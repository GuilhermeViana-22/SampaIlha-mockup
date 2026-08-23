<script setup lang="ts">
withDefaults(defineProps<{ titulo?: string, descricao?: string }>(), {
  titulo: 'Anuncie no Portal Sampa na Ilha',
  descricao: 'Alcance milhares de leitores em todo o Brasil',
})
</script>

<template>
  <div class="widget ad-widget">
    <p><i class="fas fa-bullhorn" /> Publicidade</p>
    <h3>{{ titulo }}</h3>
    <small>{{ descricao }}</small>
    <div class="ad-placeholder">
      <i class="fas fa-image" />
      <span>300 × 250</span>
    </div>
  </div>
</template>
