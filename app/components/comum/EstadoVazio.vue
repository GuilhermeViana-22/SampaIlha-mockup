<script setup lang="ts">
defineProps<{ titulo: string, descricao?: string, icone?: string }>()
</script>

<template>
  <div style="background:var(--branco);border-radius:var(--raio);box-shadow:var(--sombra-sm);padding:40px 24px;text-align:center;color:var(--cinza-4);">
    <i :class="icone ?? 'fas fa-inbox'" style="font-size:2rem;color:var(--cinza-3);margin-bottom:12px;display:block;" />
    <h3 style="font-family:var(--fonte-serif);font-size:1.1rem;color:var(--escuro);margin-bottom:6px;">
      {{ titulo }}
    </h3>
    <p v-if="descricao" style="font-size:.88rem;">
      {{ descricao }}
    </p>
    <slot />
  </div>
</template>
