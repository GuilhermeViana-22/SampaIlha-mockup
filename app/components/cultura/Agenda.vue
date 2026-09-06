<script setup lang="ts">
import type { Evento, TipoEvento } from '#shared/types/evento'

/**
 * Bloco de agenda. Pode receber os itens prontos ou buscar na API
 * filtrando por tipo (ensaio, mostra, show, festival…).
 */
const props = withDefaults(defineProps<{
  itens?: Evento[]
  tipo?: TipoEvento
  limite?: number
  vazio?: string
}>(), {
  limite: 10,
  vazio: 'Nenhum evento na agenda por enquanto.',
})

const { data } = props.itens
  ? { data: ref({ itens: props.itens, total: props.itens.length }) }
  : await useFetch<{ itens: Evento[], total: number }>('/api/eventos', {
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

        <!--
          O cartaz respeita a orientação escolhida no painel: forçar a mesma
          proporção nos dois formatos cortaria o flyer em pé bem no meio da
          arte, que é onde ele concentra o nome da atração.
        -->
        <img
          v-if="item.imagemUrl"
          :src="item.imagemUrl"
          :alt="`Cartaz de ${item.titulo}`"
          class="schedule-item__cartaz"
          :class="`schedule-item__cartaz--${item.orientacaoCartaz}`"
          loading="lazy"
        >

        <div>
          <h4>{{ item.titulo }}</h4>
          <p>{{ item.resumo }}</p>
          <p v-if="item.local" style="margin-top:4px;font-size:.78rem;color:var(--cinza-3);">
            <i class="fas fa-map-marker-alt" /> {{ item.local }}
          </p>
        </div>
      </div>
    </div>

    <ComumEstadoVazio v-else :titulo="vazio" icone="fas fa-calendar-alt" />
  </div>
</template>
