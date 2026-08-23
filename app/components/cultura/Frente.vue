<script setup lang="ts">
/** Blocos "em breve" das frentes culturais (inscrições, termo, galeria, agenda). */
const blocos = [
  { icone: 'fas fa-file-signature', titulo: 'Inscrições', texto: 'Formulário de inscrição — em breve disponível nesta página.' },
  { icone: 'fas fa-file-contract', titulo: 'Termo de Participação', texto: 'Documento com as regras e o termo de compromisso dos participantes — em breve.' },
  { icone: 'fas fa-images', titulo: 'Galeria de Fotos', texto: 'Registros dos ensaios, oficinas e bastidores — em breve.' },
  { icone: 'fas fa-calendar-alt', titulo: 'Agenda', texto: 'Datas, locais e vagas disponíveis — em breve.' },
]
</script>

<template>
  <div class="subpage-grid">
    <div v-for="bloco in blocos" :key="bloco.titulo" class="subpage-card">
      <div class="subpage-card__icon">
        <i :class="bloco.icone" />
      </div>
      <div>
        <h3>{{ bloco.titulo }}</h3>
        <p>{{ bloco.texto }}</p>
      </div>
    </div>
  </div>
</template>
