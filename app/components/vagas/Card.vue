<script setup lang="ts">
import type { Vaga } from '#shared/types/content'

const props = defineProps<{ vaga: Vaga }>()

const linkCandidatura = computed(() => {
  const email = props.vaga.emailCandidatura ?? 'contato@portalsampanailha.com.br'
  return `mailto:${email}?subject=${encodeURIComponent(props.vaga.titulo)}`
})
</script>

<template>
  <article class="job-card">
    <div>
      <h3 class="job-card__title">{{ vaga.titulo }}</h3>
      <div class="job-card__meta">
        <span><i class="fas fa-building" /> {{ vaga.empresa }}</span>
        <span><i class="fas fa-map-marker-alt" /> {{ vaga.local }}</span>
        <span><i class="fas fa-file-contract" /> {{ vaga.regime }} · {{ vaga.modelo }}</span>
        <span><i class="fas fa-calendar-alt" /> {{ formatarDataCurta(vaga.publicadoEm) }}</span>
      </div>
      <p v-if="vaga.descricao" style="font-size:.85rem;color:var(--cinza-4);margin-top:8px;">
        {{ vaga.descricao }}
      </p>
    </div>
    <a class="job-card__cta" :href="linkCandidatura">Ver detalhes</a>
  </article>
</template>
