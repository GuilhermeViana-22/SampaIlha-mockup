<script setup lang="ts">
import type { Previsao } from '#shared/types/content'

/** Painel com os 15 dias de previsão, aberto ao clicar no widget do tempo. */
const props = defineProps<{ aberto: boolean, previsao: Previsao | null }>()
const emit = defineEmits<{ fechar: [] }>()

const hoje = computed(() => props.previsao?.dias[0])

function aoTeclar(evento: KeyboardEvent) {
  if (evento.key === 'Escape') emit('fechar')
}

// A tecla Esc fecha, e a página atrás não rola enquanto o painel está aberto.
watch(() => props.aberto, (aberto) => {
  if (!import.meta.client) return
  document.body.style.overflow = aberto ? 'hidden' : ''
  if (aberto) window.addEventListener('keydown', aoTeclar)
  else window.removeEventListener('keydown', aoTeclar)
})

onUnmounted(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', aoTeclar)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="aberto && previsao"
      class="tempo-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Previsão do tempo para 15 dias"
      @click.self="emit('fechar')"
    >
      <div class="tempo-modal__caixa">
        <header class="tempo-modal__topo">
          <div>
            <h2>Previsão para 15 dias</h2>
            <p>{{ previsao.cidade }}</p>
          </div>
          <button type="button" aria-label="Fechar" @click="emit('fechar')">
            <i class="fas fa-times" />
          </button>
        </header>

        <div class="tempo-modal__agora">
          <i :class="previsao.agora.icone" />
          <div class="tempo-modal__grau">{{ previsao.agora.temperatura }}°</div>
          <div>
            <p>{{ previsao.agora.rotulo }}</p>
            <small>
              Sensação {{ previsao.agora.sensacao }}° ·
              Umidade {{ previsao.agora.umidade }}% ·
              Vento {{ previsao.agora.vento }} km/h
            </small>
          </div>
        </div>

        <ul class="tempo-modal__lista">
          <li v-for="(dia, i) in previsao.dias" :key="dia.data">
            <span class="tempo-modal__dia">{{ i === 0 ? 'Hoje' : dia.diaLongo }}</span>
            <i :class="dia.icone" :title="dia.rotulo" />
            <span class="tempo-modal__rotulo">{{ dia.rotulo }}</span>
            <span class="tempo-modal__chuva">
              <i class="fas fa-droplet" /> {{ dia.chuva }}%
            </span>
            <span class="tempo-modal__faixa">
              <strong>{{ dia.maxima }}°</strong> <small>{{ dia.minima }}°</small>
            </span>
          </li>
        </ul>

        <footer class="tempo-modal__rodape">
          Dados de <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo</a>,
          atualizados a cada 30 minutos.
          <template v-if="hoje"> Hoje: máxima de {{ hoje.maxima }}° e mínima de {{ hoje.minima }}°.</template>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
