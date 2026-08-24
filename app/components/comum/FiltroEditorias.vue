<script setup lang="ts">
/**
 * Trilho de filtro por editoria.
 *
 * No desktop as pastilhas quebram em linhas, como antes. No celular elas viram
 * um trilho horizontal: a lista inteira num scroll só, com sombra nas bordas
 * indicando que há mais coisa fora da tela e setas para quem está no desktop
 * estreito. A pastilha ativa é trazida para a área visível — ao voltar para a
 * página com um filtro na URL, o leitor vê qual editoria está selecionada sem
 * precisar arrastar o trilho até achá-la.
 */
interface Opcao {
  slug: string
  nome: string
  icone: string
}

const props = defineProps<{
  /** Slug da editoria ativa; string vazia representa "Todas". */
  modelValue: string
  opcoes: Opcao[]
  /** Rótulo da pastilha que limpa o filtro. */
  rotuloTodas?: string
  /** Descrição do grupo para leitores de tela. */
  legenda?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const raiz = ref<HTMLElement | null>(null)
const trilho = ref<HTMLElement | null>(null)
const temAntes = ref(false)
const temDepois = ref(false)

/** Liga as sombras de borda conforme sobra conteúdo para cada lado. */
function medir() {
  const el = trilho.value
  if (!el) return
  const folga = el.scrollWidth - el.clientWidth - el.scrollLeft
  temAntes.value = el.scrollLeft > 4
  temDepois.value = folga > 4
}

function rolar(direcao: -1 | 1) {
  const el = trilho.value
  if (!el) return
  el.scrollBy({ left: direcao * Math.round(el.clientWidth * 0.8), behavior: 'smooth' })
}

/** Traz a pastilha ativa para o campo de visão sem mexer no scroll da página. */
function centralizarAtiva() {
  const el = trilho.value
  if (!el) return
  const ativa = el.querySelector<HTMLElement>('[data-ativa="true"]')
  if (!ativa) return

  const inicio = ativa.offsetLeft
  const fim = inicio + ativa.offsetWidth
  const visivelInicio = el.scrollLeft
  const visivelFim = visivelInicio + el.clientWidth

  if (inicio < visivelInicio + 12 || fim > visivelFim - 12) {
    el.scrollTo({
      left: Math.max(0, inicio - (el.clientWidth - ativa.offsetWidth) / 2),
      behavior: 'smooth',
    })
  }
}

/**
 * Filtrar no meio da lista deixava o leitor olhando para a barriga de uma
 * lista nova. Se a barra já saiu de vista, a página sobe até ela.
 */
function subirAteOFiltro() {
  const el = raiz.value
  if (!el) return
  // `offsetTop` continua marcando a posição estática mesmo com a barra grudada.
  const alvo = Math.max(0, el.offsetTop - 84)
  if (window.scrollY <= alvo) return
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: alvo, behavior: suave ? 'smooth' : 'auto' })
}

function selecionar(slug: string) {
  emit('update:modelValue', slug)
  subirAteOFiltro()
  nextTick(centralizarAtiva)
}

onMounted(() => {
  medir()
  centralizarAtiva()
  window.addEventListener('resize', medir, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('resize', medir))

// O trilho só existe depois que a taxonomia chega da API.
watch(() => props.opcoes.length, () => nextTick(medir))
</script>

<template>
  <div ref="raiz" class="filtro" :class="{ 'filtro--antes': temAntes, 'filtro--depois': temDepois }">
    <button
      class="filtro__seta filtro__seta--antes"
      type="button"
      tabindex="-1"
      aria-hidden="true"
      @click="rolar(-1)"
    >
      <i class="fas fa-chevron-left" />
    </button>

    <div
      ref="trilho"
      class="filtro__trilho tags"
      role="group"
      :aria-label="legenda ?? 'Filtrar por editoria'"
      @scroll.passive="medir"
    >
      <button
        class="tag"
        type="button"
        :class="{ 'tag--ativa': modelValue === '' }"
        :data-ativa="modelValue === ''"
        :aria-pressed="modelValue === ''"
        @click="selecionar('')"
      >
        <i class="fas fa-th-large" /> {{ rotuloTodas ?? 'Todas' }}
      </button>

      <button
        v-for="opcao in opcoes"
        :key="opcao.slug"
        class="tag"
        type="button"
        :class="{ 'tag--ativa': modelValue === opcao.slug }"
        :data-ativa="modelValue === opcao.slug"
        :aria-pressed="modelValue === opcao.slug"
        @click="selecionar(opcao.slug)"
      >
        <i :class="opcao.icone" /> {{ opcao.nome }}
      </button>
    </div>

    <button
      class="filtro__seta filtro__seta--depois"
      type="button"
      tabindex="-1"
      aria-hidden="true"
      @click="rolar(1)"
    >
      <i class="fas fa-chevron-right" />
    </button>
  </div>
</template>
