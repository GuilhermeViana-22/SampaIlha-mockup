<script setup lang="ts">
/**
 * Previsão do tempo de São Paulo, com dados reais do Open-Meteo via
 * `server/api/tempo`. Clicar no widget abre os 15 dias.
 */
const { data: previsao } = await useFetch('/api/tempo', { key: 'previsao-tempo' })

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

    <TempoModal :aberto="aberto" :previsao="previsao" @fechar="aberto = false" />
  </div>
</template>
