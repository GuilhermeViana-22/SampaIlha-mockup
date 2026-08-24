<script setup lang="ts">
/** Os cinco pilares do ecossistema do portal — usados em /quem-somos e em /cultura/o-projeto. */
const eixos = [
  { icone: 'fas fa-bullhorn', titulo: 'Comunicação Cultural & Informação Global', texto: 'Nosso portal realiza a cobertura do Festival de Parintins — trazendo entrevistas, bastidores e conteúdos educativos — e expande suas fronteiras para ser um veículo de notícias completo. Levamos até você os principais acontecimentos de São Paulo, do Brasil e do mundo, com credibilidade e dinamismo.' },
  { icone: 'fas fa-chalkboard-teacher', titulo: 'Formação Cultural', texto: 'Promovemos o intercâmbio com oficinas de dança de boi-bumbá, musicalidade amazônica, preparação coreográfica e confecção de artesanatos e adereços.' },
  { icone: 'fas fa-hand-holding-heart', titulo: 'Projeto Social', texto: 'Democratizamos o acesso à arte em comunidades periféricas através de oficinas gratuitas, bolsas culturais e formação artística voltada para jovens em situação de vulnerabilidade social.' },
  { icone: 'fas fa-calendar-day', titulo: 'Eventos e Experiências', texto: 'Movimentamos a cena paulistana com workshops, ensaios abertos, mostras, exposições e festas temáticas, além de aproximar o turista paulista dessa experiência única através do fomento à nossa tradicional caravana cultural para Parintins.' },
  { icone: 'fas fa-briefcase', titulo: 'Utilidade Pública & Oportunidades', texto: 'Fortalecendo nosso compromisso com a comunidade paulista, oferecemos um espaço exclusivo de divulgação de vagas de emprego, ajudando a conectar profissionais talentosos a grandes oportunidades de trabalho no mercado.' },
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
