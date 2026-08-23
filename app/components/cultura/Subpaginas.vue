<script setup lang="ts">
/** Navegação entre as frentes do ecossistema cultural. */
const props = withDefaults(defineProps<{ exceto?: string }>(), { exceto: '' })

const frentes = [
  { para: '/cultura/o-projeto', icone: 'fas fa-seedling', titulo: 'O Projeto Sampa na Ilha', texto: 'Conheça o ecossistema cultural, social e educacional do projeto.' },
  { para: '/cultura/grupo-danca', icone: 'fas fa-music', titulo: 'Grupo de Dança', texto: 'O corpo de dança que representa o boi-bumbá em São Paulo.' },
  { para: '/cultura/workshops', icone: 'fas fa-hands-helping', titulo: 'Workshops & Artesanato', texto: 'Oficinas de confecção de adereços e formação artística.' },
  { para: '/cultura/eventos', icone: 'fas fa-calendar-day', titulo: 'Eventos & Atrações', texto: 'Calendário de ensaios, mostras e shows com atrações do Amazonas.' },
  { para: '/cultura', icone: 'fas fa-newspaper', titulo: 'Cultura & Arte', texto: 'Cobertura jornalística e histórica da cultura amazônica.' },
]

const visiveis = computed(() => frentes.filter(f => f.para !== props.exceto))
</script>

<template>
  <div class="subpage-grid">
    <NuxtLink v-for="frente in visiveis" :key="frente.para" class="subpage-card" :to="frente.para">
      <div class="subpage-card__icon">
        <i :class="frente.icone" />
      </div>
      <div>
        <h3>{{ frente.titulo }}</h3>
        <p>{{ frente.texto }}</p>
      </div>
    </NuxtLink>
  </div>
</template>
