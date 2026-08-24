<script setup lang="ts">
import type { Workshop } from '#shared/types/workshop'

/**
 * Cartão de uma oficina na página pública.
 *
 * `realizada` muda o tom sem esconder o conteúdo: o histórico serve de prova
 * do trabalho da frente de Formação Cultural, mas não pode competir com o que
 * ainda está com inscrições abertas.
 *
 * O botão de inscrição só existe quando há link — a inscrição acontece em
 * outro site, e o portal apenas leva até lá. `rel="noopener noreferrer"` é
 * obrigatório: o destino é externo e não é nosso.
 */
const props = withDefaults(
  defineProps<{ oficina: Workshop, realizada?: boolean }>(),
  { realizada: false },
)

/** Data por extenso; oficina sem dia marcado aparece como "a definir". */
const quando = computed(() => {
  const iso = props.oficina.acontecemEm
  if (!iso) return 'Data a definir'

  // Monta por partes: `new Date('2026-09-15')` seria lido como UTC e puxaria o
  // dia para trás em São Paulo.
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
})
</script>

<template>
  <article class="workshop-card" :class="{ 'workshop-card--realizada': realizada }">
    <div v-if="oficina.imagemUrl" class="workshop-card__foto">
      <img :src="oficina.imagemUrl" :alt="`Cartaz da oficina ${oficina.titulo}`" loading="lazy">
    </div>

    <div class="workshop-card__corpo">
      <p class="workshop-card__meta">
        <span><i class="fas fa-calendar-day" /> {{ quando }}</span>
        <span v-if="oficina.local"><i class="fas fa-location-dot" /> {{ oficina.local }}</span>
        <span v-if="realizada" class="workshop-card__selo">Já realizada</span>
      </p>

      <h3>{{ oficina.titulo }}</h3>

      <p v-if="oficina.resumo" class="workshop-card__resumo">{{ oficina.resumo }}</p>

      <!--
        O corpo vem do editor visual e já chega higienizado pela API (mesmo
        sanitizador do texto das matérias), por isso pode ser renderizado.
      -->
      <div v-if="oficina.conteudo" class="workshop-card__texto" v-html="oficina.conteudo" />

      <a
        v-if="oficina.inscricaoUrl && !realizada"
        class="workshop-card__botao"
        :href="oficina.inscricaoUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        Inscreva-se <i class="fas fa-arrow-up-right-from-square" />
      </a>
    </div>
  </article>
</template>

<style scoped>
.workshop-card {
  background: var(--branco);
  border-radius: var(--raio);
  box-shadow: var(--sombra-sm);
  overflow: hidden;
  margin: 20px 0;
}

.workshop-card__foto img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 7;
  object-fit: cover;
}

.workshop-card__corpo { padding: 22px; }

.workshop-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: .82rem;
  color: var(--cinza-4);
  margin: 0 0 10px;
}
.workshop-card__meta i { margin-right: 5px; }

.workshop-card__selo {
  background: var(--cinza-2, #eef1f5);
  border-radius: 999px;
  padding: 2px 10px;
  font-weight: 600;
}

.workshop-card h3 {
  font-family: var(--fonte-serif);
  font-size: 1.3rem;
  margin: 0 0 8px;
}

.workshop-card__resumo {
  font-size: .95rem;
  color: var(--cinza-4);
  margin: 0 0 12px;
}

/* O texto vem do editor: herda a tipografia do conteúdo das páginas. */
.workshop-card__texto :deep(p) { margin: 0 0 1em; }
.workshop-card__texto :deep(h2),
.workshop-card__texto :deep(h3) { font-family: var(--fonte-serif); margin: 1.2em 0 .4em; }
.workshop-card__texto :deep(img) { max-width: 100%; height: auto; border-radius: 8px; }
.workshop-card__texto :deep(ul),
.workshop-card__texto :deep(ol) { padding-left: 1.3em; margin: 0 0 1em; }

.workshop-card__botao {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 11px 22px;
  border-radius: 999px;
  background: var(--azul);
  color: #fff;
  font-weight: 600;
  font-size: .92rem;
  transition: transform .18s, opacity .18s;
}
.workshop-card__botao:hover { transform: translateY(-2px); opacity: .92; }

/* Histórico: presente na página, mas sem disputar atenção com o que está aberto. */
.workshop-card--realizada { opacity: .78; }
.workshop-card--realizada .workshop-card__foto img { filter: grayscale(.35); }
</style>
