<script setup lang="ts">
/**
 * Previsão do tempo da região de quem está lendo, com dados reais do
 * Open-Meteo via `server/api/tempo`. Clicar no widget abre os 15 dias.
 *
 * A cidade vem do IP no primeiro carregamento; o botão embaixo troca para a
 * localização exata do navegador, quando o leitor autoriza.
 *
 * A busca acontece só no navegador (ver `useTempo`), então o widget aparece um
 * instante depois do resto da página — de propósito: previsão do tempo não
 * atrasa notícia.
 */
const { previsao, pedindo, erro, localizar } = useTempo()

const aberto = ref(false)

// A faixa do widget mostra hoje + os quatro dias seguintes.
const proximos = computed(() => previsao.value?.dias.slice(0, 5) ?? [])
</script>

<template>
  <div v-if="previsao" class="widget weather-widget">
    <div class="widget-title">
      <i class="fas fa-cloud-sun" /> Previsão do Tempo
    </div>

    <button type="button" class="weather-abrir" title="Ver os 15 dias" @click="aberto = true">
      <div class="weather-current">
        <div class="weather-icon">
          <i :class="previsao.agora.icone" style="font-size:2.4rem;color:#fff;" />
        </div>
        <div>
          <div class="weather-temp">{{ previsao.agora.temperatura }}°</div>
        </div>
        <div class="weather-info">
          <p>{{ previsao.cidade }}</p>
          <small>{{ previsao.agora.rotulo }}</small>
        </div>
      </div>

      <div class="weather-forecast">
        <div v-for="(dia, i) in proximos" :key="dia.data" class="forecast-day">
          {{ i === 0 ? 'Hoje' : dia.diaCurto }}<strong>{{ dia.maxima }}°</strong><i :class="dia.icone" />
        </div>
      </div>

      <span class="weather-cta">Ver 15 dias <i class="fas fa-arrow-right" /></span>
    </button>

    <!-- Fora do botão de cima: botão dentro de botão não é HTML válido. -->
    <p v-if="previsao.fonte === 'gps'" class="weather-local weather-local--ativo">
      <i class="fas fa-location-dot" /> Previsão da sua localização
    </p>
    <button
      v-else
      type="button"
      class="weather-local"
      :disabled="pedindo"
      @click="localizar()"
    >
      <i :class="pedindo ? 'fas fa-circle-notch fa-spin' : 'fas fa-location-crosshairs'" />
      {{ pedindo ? 'Localizando…' : 'Usar minha localização' }}
    </button>
    <p v-if="erro" class="weather-local weather-local--erro">
      {{ erro }}
    </p>

    <TempoModal :aberto="aberto" :previsao="previsao" @fechar="aberto = false" />
  </div>
</template>
