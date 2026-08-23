<script setup lang="ts">
import type { Vaga } from '#shared/types/content'

/** Vagas divulgadas pelo portal — vêm da API. */
const { data, status } = await useFetch<{ itens: Vaga[], total: number }>('/api/vagas', {
  key: 'vagas',
  default: () => ({ itens: [], total: 0 }),
})
</script>

<template>
  <div>
    <VagasCard v-for="vaga in data.itens" :key="vaga.id" :vaga="vaga" />

    <ComumEstadoVazio
      v-if="!data.itens.length && status !== 'pending'"
      titulo="Nenhuma vaga aberta no momento"
      descricao="Assim que uma nova oportunidade for recebida pela redação, ela aparece aqui."
      icone="fas fa-briefcase"
    />
  </div>
</template>
