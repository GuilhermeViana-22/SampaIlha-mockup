<script setup lang="ts">
/**
 * Faixa de avisos do topo.
 *
 * Antes ela ficava sempre no ar, rotulando as últimas notícias como "Urgente"
 * mesmo num dia em que nada urgente havia acontecido. Agora mostra o que a
 * redação escreveu, e só no dia em que escreveu — sem aviso do dia, a faixa
 * não existe.
 */
const avisos = useAvisosStore()
await avisos.carregarDoDia()

/** O rótulo da faixa segue o aviso mais grave que estiver no ar. */
const destaque = computed(() => avisos.doDia[0] ?? null)
const aparencia = computed(() => (destaque.value ? tipoDeAviso(destaque.value.tipo) : null))
</script>

<template>
  <div v-if="destaque && aparencia" class="breaking" :class="`breaking--${destaque.tipo}`">
    <div class="breaking__label">
      <i :class="aparencia.icone" /> {{ aparencia.rotulo }}
    </div>
    <div class="breaking__ticker">
      <span>
        <template v-for="(aviso, i) in avisos.doDia" :key="aviso.id">
          {{ aviso.mensagem }}<template v-if="i < avisos.doDia.length - 1"> &nbsp;&bull;&nbsp; </template>
        </template>
      </span>
    </div>
  </div>
</template>
