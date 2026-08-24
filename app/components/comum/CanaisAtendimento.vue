<script setup lang="ts">
/** Bloco de canais oficiais de atendimento (WhatsApp, e-mail e redes). */
import { CANAIS_ATENDIMENTO } from '~/utils/navegacao'
</script>

<template>
  <div class="eco-grid">
    <a
      v-for="canal in CANAIS_ATENDIMENTO"
      :key="canal.rotulo"
      class="eco-card"
      :href="canal.url"
      target="_blank"
      rel="noopener"
    >
      <i :class="canal.icone" />
      <h3>{{ canal.rotulo }}</h3>
      <p>{{ canal.valor }}</p>
    </a>
  </div>
</template>
