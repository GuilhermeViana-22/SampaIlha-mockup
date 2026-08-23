<script setup lang="ts">
import type { EventoAgenda } from '#shared/types/content'

/**
 * Bloco de agenda. Pode receber os itens prontos ou buscar na API
 * filtrando por tipo (ensaio, mostra, show, festival…).
 */
const props = withDefaults(defineProps<{
  itens?: EventoAgenda[]
  tipo?: string
  limite?: number
  vazio?: string
}>(), {
  limite: 10,
  vazio: 'Nenhum evento na agenda por enquanto.',
})

const { data } = props.itens
  ? { data: ref({ itens: props.itens, total: props.itens.length }) }
  : await useFetch<{ itens: EventoAgenda[], total: number }>('/api/eventos', {
      key: `agenda-${props.tipo ?? 'todos'}`,
      params: { tipo: props.tipo, limite: props.limite },
      default: () => ({ itens: [], total: 0 }),
    })

const lista = computed(() => (props.itens ?? data.value.itens).slice(0, props.limite))
</script>

<template>
  <div>
    <div v-if="lista.length" class="schedule">
      <div v-for="item in lista" :key="item.id ?? item.titulo" class="schedule-item">
        <div class="schedule-item__date">
          {{ item.mes }}<strong>{{ item.dia }}</strong>
        </div>
        <div>
          <h4>{{ item.titulo }}</h4>
          <p>{{ item.descricao }}</p>
          <p v-if="item.local" style="margin-top:4px;font-size:.78rem;color:var(--cinza-3);">
            <i class="fas fa-map-marker-alt" /> {{ item.local }}
          </p>
        </div>
      </div>
    </div>

    <ComumEstadoVazio v-else :titulo="vazio" icone="fas fa-calendar-alt" />
  </div>
</template>
