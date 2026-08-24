<script setup lang="ts">
/** Os quatro pilares do ecossistema cultural do projeto. */
const eixos = [
  { icone: 'fas fa-bullhorn', titulo: 'Comunicação Cultural', texto: 'Nosso portal de notícias realiza a cobertura do Festival de Parintins, trazendo entrevistas, bastidores, conteúdos educativos e ampla divulgação artística.' },
  { icone: 'fas fa-chalkboard-teacher', titulo: 'Formação Cultural', texto: 'Promovemos o intercâmbio com oficinas de dança de boi-bumbá, musicalidade amazônica, preparação coreográfica e confecção de artesanatos e adereços.' },
  { icone: 'fas fa-hand-holding-heart', titulo: 'Projeto Social', texto: 'Democratizamos o acesso à arte em comunidades periféricas através de oficinas gratuitas, bolsas culturais e formação artística voltada para jovens em situação de vulnerabilidade social.' },
  { icone: 'fas fa-calendar-day', titulo: 'Eventos e Experiências', texto: 'Movimentamos a cena paulistana com workshops, ensaios abertos, mostras, exposições e festas temáticas, além de aproximar o turista do Sudeste dessa experiência única através da nossa curadoria de viagens para o festival.' },
]
</script>

<template>
  <div class="eco-grid">
    <div v-for="eixo in eixos" :key="eixo.titulo" class="eco-card">
      <i :class="eixo.icone" />
      <h3>{{ eixo.titulo }}</h3>
      <p>{{ eixo.texto }}</p>
    </div>
  </div>
</template>
