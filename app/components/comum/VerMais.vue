<script setup lang="ts">
/**
 * Rodapé de listagem: quanto já está na tela e o botão que traz o resto.
 *
 * O contador não é enfeite — foi o descompasso entre ele e a lista que revelou
 * o problema ("37 matérias publicadas", 24 na tela). Mantê-lo à vista deixa
 * claro que ainda falta conteúdo e quanto.
 */
const props = defineProps<{
  mostrando: number
  total: number
  temMais: boolean
  carregando?: boolean
  erro?: string | null
  /** Plural do que está sendo listado: "matérias", "dicas", "resultados". */
  substantivo?: string
}>()

defineEmits<{ carregar: [] }>()

const substantivo = computed(() => props.substantivo ?? 'itens')
const restantes = computed(() => Math.max(props.total - props.mostrando, 0))
</script>

<template>
  <div v-if="total > 0" class="ver-mais">
    <p class="ver-mais__contador" aria-live="polite">
      Mostrando <strong>{{ mostrando }}</strong> de <strong>{{ total }}</strong> {{ substantivo }}
    </p>

    <p v-if="erro" class="ver-mais__erro" role="alert">
      <i class="fas fa-triangle-exclamation" /> {{ erro }}
    </p>

    <button
      v-if="temMais"
      class="ver-mais__botao"
      type="button"
      :disabled="carregando"
      @click="$emit('carregar')"
    >
      <i class="fas" :class="carregando ? 'fa-circle-notch fa-spin' : 'fa-arrow-down'" />
      {{ carregando ? 'Carregando…' : `Ver mais (${restantes} ${restantes === 1 ? 'restante' : 'restantes'})` }}
    </button>

    <p v-else class="ver-mais__fim">
      Você chegou ao fim da lista.
    </p>
  </div>
</template>
