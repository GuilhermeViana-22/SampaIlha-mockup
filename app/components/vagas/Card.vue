<script setup lang="ts">
import type { Vaga } from '#shared/types/vaga'

const props = defineProps<{ vaga: Vaga }>()

/**
 * Para onde vai o botão da vaga.
 *
 * O link cadastrado tem precedência: é a página de quem contrata, e é lá que a
 * candidatura acontece de verdade. Sem link, cai no e-mail informado, já com o
 * assunto preenchido. Sem nenhum dos dois não há botão — melhor do que mandar
 * o candidato para um endereço genérico do portal, que não sabe da vaga.
 */
const candidatura = computed(() => {
  if (props.vaga.linkDaVaga) {
    return { href: props.vaga.linkDaVaga, externo: true, rotulo: 'Ver a vaga' }
  }

  if (props.vaga.emailCandidatura) {
    const assunto = encodeURIComponent(`Candidatura: ${props.vaga.titulo}`)
    return { href: `mailto:${props.vaga.emailCandidatura}?subject=${assunto}`, externo: false, rotulo: 'Candidatar-se' }
  }

  return null
})
</script>

<template>
  <article class="job-card">
    <img
      v-if="vaga.imagemUrl"
      class="job-card__foto"
      :src="vaga.imagemUrl"
      :alt="`Foto da vaga: ${vaga.titulo}`"
      loading="lazy"
    >

    <div class="job-card__corpo">
      <h3 class="job-card__title">{{ vaga.titulo }}</h3>

      <div class="job-card__meta">
        <span><i class="fas fa-building" /> {{ vaga.empresa }}</span>
        <span><i class="fas fa-map-marker-alt" /> {{ vaga.local }}</span>
        <span><i class="fas fa-file-contract" /> {{ vaga.regime }} · {{ vaga.modelo }}</span>
        <span>
          <i class="fas fa-calendar-alt" />
          <time :datetime="vaga.publicadoEm">Publicada em {{ formatarDataCurta(vaga.publicadoEm) }}</time>
        </span>
      </div>

      <p v-if="vaga.descricao" class="job-card__descricao">{{ vaga.descricao }}</p>
    </div>

    <a
      v-if="candidatura"
      class="job-card__cta"
      :href="candidatura.href"
      :target="candidatura.externo ? '_blank' : undefined"
      :rel="candidatura.externo ? 'noopener noreferrer' : undefined"
    >
      {{ candidatura.rotulo }}
      <i v-if="candidatura.externo" class="fas fa-arrow-up-right-from-square" />
    </a>
  </article>
</template>
