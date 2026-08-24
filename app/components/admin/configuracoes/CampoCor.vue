<script setup lang="ts">
/**
 * Seletor de cor do painel: a amostra abre o color picker nativo do sistema e
 * o campo de texto aceita o hexadecimal digitado/colado (útil para bater com
 * um manual de marca). Só emite quando o valor é um hex válido.
 *
 * Com `permite-herdar`, o campo vazio significa "herda a cor padrão" — é assim
 * que os níveis h1…h6 seguem a cor geral de títulos até serem sobrescritos.
 */
import { RotateCcwIcon } from '@lucide/vue'

const props = defineProps<{
  rotulo: string
  descricao?: string
  /** Hex (`#rrggbb`) ou `''` quando herda. */
  modelValue: string
  permiteHerdar?: boolean
  /** Cor mostrada na amostra quando o campo herda. */
  herdadaDe?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [valor: string] }>()

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

const texto = ref(props.modelValue)
watch(() => props.modelValue, valor => { texto.value = valor })

const herda = computed(() => props.permiteHerdar === true && !props.modelValue)
/** O <input type="color"> não aceita vazio: mostra a cor herdada. */
const amostra = computed(() => props.modelValue || props.herdadaDe || '#000000')

function aplicar(valor: string) {
  const limpo = valor.trim()
  if (props.permiteHerdar && limpo === '') return emit('update:modelValue', '')
  if (HEX.test(limpo)) emit('update:modelValue', limpo.toLowerCase())
}
</script>

<template>
  <div class="flex items-center gap-3">
    <label class="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border shadow-sm">
      <span class="block size-full" :style="{ background: amostra }" />
      <input
        type="color"
        class="absolute inset-0 cursor-pointer opacity-0"
        :value="amostra"
        :aria-label="rotulo"
        @input="aplicar(($event.target as HTMLInputElement).value)"
      >
    </label>

    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium leading-tight">{{ rotulo }}</p>
      <p v-if="descricao" class="truncate text-xs text-muted-foreground">{{ descricao }}</p>
    </div>

    <Input
      v-model="texto"
      class="w-28 font-mono text-xs uppercase"
      :placeholder="herda ? 'herda' : '#000000'"
      spellcheck="false"
      @blur="aplicar(texto)"
      @keyup.enter="aplicar(texto)"
    />

    <Button
      v-if="permiteHerdar"
      variant="ghost"
      size="icon"
      class="size-8 shrink-0"
      :disabled="herda"
      title="Voltar a herdar a cor padrão de títulos"
      @click="emit('update:modelValue', '')"
    >
      <RotateCcwIcon class="size-3.5" />
    </Button>
  </div>
</template>
