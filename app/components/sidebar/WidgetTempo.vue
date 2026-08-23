<script setup lang="ts">
/** Previsão do tempo (dados ilustrativos até integrar uma API real). */
const previsao = [
  { dia: 'Seg', temp: '25°', icone: 'fas fa-sun' },
  { dia: 'Ter', temp: '23°', icone: 'fas fa-cloud-rain' },
  { dia: 'Qua', temp: '22°', icone: 'fas fa-bolt' },
  { dia: 'Qui', temp: '26°', icone: 'fas fa-cloud-sun' },
  { dia: 'Sex', temp: '27°', icone: 'fas fa-sun' },
]
</script>

<template>
  <div class="widget weather-widget">
    <div class="widget-title">
      <i class="fas fa-cloud-sun" /> Previsão do Tempo
    </div>
    <div class="weather-current">
      <div class="weather-icon">
        <i class="fas fa-cloud-sun" style="font-size:2.4rem;color:#fff;" />
      </div>
      <div>
        <div class="weather-temp">24°</div>
      </div>
      <div class="weather-info">
        <p>São Paulo, SP</p>
        <small>Parcialmente nublado</small>
      </div>
    </div>
    <div class="weather-forecast">
      <div v-for="dia in previsao" :key="dia.dia" class="forecast-day">
        {{ dia.dia }}<strong>{{ dia.temp }}</strong><i :class="dia.icone" />
      </div>
    </div>
  </div>
</template>
